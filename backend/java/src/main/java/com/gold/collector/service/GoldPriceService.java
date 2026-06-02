package com.gold.collector.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gold.collector.dto.GoldApiResponse;
import com.gold.collector.entity.GoldPrice;
import com.gold.collector.mapper.GoldPriceMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * 黄金价格采集与查询服务。
 *
 * @author max
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoldPriceService {
    private static final int MAX_HISTORY_LIMIT = 100;
    private static final BigDecimal OUNCE_TO_GRAM = new BigDecimal("31.1034768");

    private final GoldPriceMapper goldPriceMapper;
    private final WebClient webClient;

    @Value("${gold.api.url:https://api.gold-api.com/}")
    private String goldApiUrl;

    @Value("${gold.api.timeout:5000}")
    private int timeout;

    @Value("${gold.exchange-rate.default:7.25}")
    private BigDecimal defaultExchangeRate;

    @Value("${gold.enabled:true}")
    private boolean enabled;

    /**
     * 每 1 分钟执行一次采集，失败时重试一次。
     */
    @Scheduled(cron = "${gold.schedule.cron:0 */1 * * * *}")
    @Retryable(
            retryFor = Exception.class,
            maxAttempts = 2,
            backoff = @Backoff(delay = 1000)
    )
    @Transactional
    public void collectGoldPrice() {
        if (!enabled) {
            log.debug("黄金价格采集功能已禁用，跳过本次执行");
            return;
        }

        log.info("开始采集黄金价格数据");
        long startTime = System.currentTimeMillis();

        try {
            GoldPriceData priceData = fetchGoldPriceWithExchangeRate();
            if (priceData == null || priceData.priceCny() == null) {
                log.error("获取黄金价格失败，返回数据为空");
                throw new IllegalStateException("获取黄金价格失败：价格数据为空");
            }

            BigDecimal priceUsd = priceData.priceUsd();
            BigDecimal priceCny = priceData.priceCny();
            BigDecimal exchangeRate = priceData.exchangeRate();
            GoldPriceChange change = calculateChange(priceUsd, priceCny);
            LocalDateTime now = LocalDateTime.now();

            GoldPrice goldPrice = GoldPrice.builder()
                    .priceUsd(priceUsd)
                    .priceCny(priceCny)
                    .exchangeRate(exchangeRate)
                    .priceUsdChange(change.usdChange())
                    .priceCnyChange(change.cnyChange())
                    .priceChangePct(change.changePct())
                    .month(now.getMonthValue())
                    .year(now.getYear())
                    .createdDate(now.toLocalDate())
                    .createdAt(now)
                    .build();

            goldPriceMapper.insert(goldPrice);
            long duration = System.currentTimeMillis() - startTime;
            log.info("黄金价格数据已保存：USD={}, CNY={}, 汇率={}, 耗时={}ms",
                    priceUsd, priceCny, exchangeRate, duration);
        } catch (Exception exception) {
            log.error("采集黄金价格数据时发生错误：{}", exception.getMessage(), exception);
            throw exception;
        }
    }

    public Optional<GoldPrice> getLatestRecord() {
        LambdaQueryWrapper<GoldPrice> query = new LambdaQueryWrapper<GoldPrice>()
                .orderByDesc(GoldPrice::getId)
                .last("LIMIT 1");
        return Optional.ofNullable(goldPriceMapper.selectOne(query));
    }

    public List<GoldPrice> getRecentRecords(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, MAX_HISTORY_LIMIT));
        LambdaQueryWrapper<GoldPrice> query = new LambdaQueryWrapper<GoldPrice>()
                .orderByDesc(GoldPrice::getId)
                .last("LIMIT " + safeLimit);

        List<GoldPrice> records = goldPriceMapper.selectList(query);
        records.sort(Comparator.comparingLong(GoldPrice::getId));
        return records;
    }

    public List<GoldPrice> getRecordsByDateRange(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<GoldPrice> query = new LambdaQueryWrapper<GoldPrice>()
                .between(GoldPrice::getCreatedDate, startDate, endDate)
                .orderByAsc(GoldPrice::getId);
        return goldPriceMapper.selectList(query);
    }

    @Retryable(
            retryFor = Exception.class,
            maxAttempts = 2,
            backoff = @Backoff(delay = 1000)
    )
    private GoldPriceData fetchGoldPriceWithExchangeRate() {
        try {
            String url = goldApiUrl + "price/XAU/CNY";
            GoldApiResponse response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(GoldApiResponse.class)
                    .timeout(Duration.ofMillis(timeout))
                    .block();

            if (response != null && response.getPrice() != null) {
                BigDecimal priceCnyPerOunce = response.getPrice();
                BigDecimal exchangeRate = Optional.ofNullable(response.getExchangeRate())
                        .orElse(defaultExchangeRate);
                BigDecimal priceUsdPerOunce = calculateUsdPrice(priceCnyPerOunce, exchangeRate);
                BigDecimal priceCnyPerGram = convertOunceToGram(priceCnyPerOunce);
                return new GoldPriceData(priceUsdPerOunce, priceCnyPerGram, exchangeRate);
            }
        } catch (Exception exception) {
            log.error("获取黄金价格和汇率失败：{}", exception.getMessage(), exception);
            throw new RuntimeException("API 调用失败", exception);
        }

        return null;
    }

    private GoldPriceChange calculateChange(BigDecimal currentUsd, BigDecimal currentCny) {
        GoldPrice lastRecord = getLatestRecord().orElse(null);
        if (lastRecord == null) {
            return new GoldPriceChange(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal usdChange = currentUsd.subtract(lastRecord.getPriceUsd());
        BigDecimal cnyChange = currentCny.subtract(lastRecord.getPriceCny());
        BigDecimal changePct = calculatePercentageChange(usdChange, lastRecord.getPriceUsd());
        return new GoldPriceChange(usdChange, cnyChange, changePct);
    }

    private BigDecimal calculateUsdPrice(BigDecimal priceCny, BigDecimal exchangeRate) {
        return priceCny.divide(exchangeRate, 6, RoundingMode.HALF_UP);
    }

    private BigDecimal convertOunceToGram(BigDecimal priceCny) {
        return priceCny.divide(OUNCE_TO_GRAM, 6, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePercentageChange(BigDecimal change, BigDecimal basePrice) {
        if (basePrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        return change.divide(basePrice, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(4, RoundingMode.HALF_UP);
    }

    private record GoldPriceData(BigDecimal priceUsd, BigDecimal priceCny, BigDecimal exchangeRate) {
    }

    private record GoldPriceChange(BigDecimal usdChange, BigDecimal cnyChange, BigDecimal changePct) {
    }
}
