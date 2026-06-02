package com.gold.collector.service;

import com.gold.collector.dto.GoldApiResponse;
import com.gold.collector.entity.GoldPrice;
import com.gold.collector.repository.GoldPriceRepository;
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
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * @author max
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoldPriceService {
    private final GoldPriceRepository goldPriceRepository;
    private final WebClient webClient;

    @Value("${gold.api.url:api.gold-api.com/}")
    private String goldApiUrl;

    @Value("${gold.api.timeout:5000}")
    private int timeout;

    @Value("${gold.exchange-rate.default:7.25}")
    private BigDecimal defaultExchangeRate;

    @Value("${gold.enabled:true}")
    private boolean enabled;

    /**
     * 每 1 分钟执行一次，带重试和事务
     */
    @Scheduled(cron = "${gold.schedule.cron:0 */1 * * * *}")
    @Retryable(
            retryFor = {Exception.class},
            maxAttempts = 2,
            backoff = @Backoff(delay = 1000)
    )
    @Transactional
    public void collectGoldPrice() {
        if (!enabled) {
            log.debug("黄金价格采集功能已禁用，跳过本次执行");
            return;
        }

        log.info("开始采集黄金价格数据...");
        long startTime = System.currentTimeMillis();

        try {
            // 1. 获取黄金价格和汇率（带重试）
            GoldPriceData priceData = fetchGoldPriceWithExchangeRate();
            if (priceData == null || priceData.priceCny() == null) {
                log.error("获取黄金价格失败");
                throw new RuntimeException("获取黄金价格失败：价格为空");
            }

            BigDecimal priceUsd = priceData.priceUsd();
            BigDecimal priceCny = priceData.priceCny();
            BigDecimal exchangeRate = priceData.exchangeRate();

            // 2. 计算与上一条的变动
            GoldPriceChange change = calculateChange(priceUsd, priceCny);

            // 3. 获取当前时间
            LocalDateTime now = LocalDateTime.now();

            // 4. 构建实体
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

            // 5. 保存
            goldPriceRepository.save(goldPrice);
            long duration = System.currentTimeMillis() - startTime;
            log.info("黄金价格数据已保存：USD={}, CNY={}, 汇率={}, 耗时={}ms",
                    priceUsd, priceCny, exchangeRate, duration);

        } catch (Exception e) {
            log.error("采集黄金价格数据时发生错误：{}", e.getMessage(), e);
            // 触发重试
            throw e;
        }
    }

    /**
     * 获取黄金价格和汇率（使用 WebClient，带重试）
     */
    @Retryable(
            retryFor = {Exception.class},
            maxAttempts = 2,
            backoff = @Backoff(delay = 1000)
    )
    private GoldPriceData fetchGoldPriceWithExchangeRate() {
        try {
            String url = goldApiUrl + "price/XAU/CNY";

            // 使用 WebClient 异步获取数据
            GoldApiResponse response = webClient.get().uri(url).retrieve().bodyToMono(GoldApiResponse.class).timeout(Duration.ofMillis(timeout)).block();

            if (response != null && response.getPrice() != null) {
                BigDecimal priceCny = response.getPrice();
                BigDecimal exchangeRate = Optional.ofNullable(response.getExchangeRate()).orElse(defaultExchangeRate);

                // 计算美元价格
                BigDecimal priceUsd = calculateUsdPrice(priceCny, exchangeRate);

                // priceCny 单位由盎司转成克
                priceCny = convertOunceToGram(priceCny);

                return new GoldPriceData(priceUsd, priceCny, exchangeRate);
            }
        } catch (Exception e) {
            log.error("获取黄金价格和汇率失败：{}", e.getMessage());
            throw new RuntimeException("API 调用失败", e);
        }
        return null;
    }

    /**
     * 计算价格变动
     */
    private GoldPriceChange calculateChange(BigDecimal currentUsd, BigDecimal currentCny) {
        return goldPriceRepository.findTopByOrderByIdDesc()
                .map(last -> {
                    BigDecimal usdChange = currentUsd.subtract(last.getPriceUsd());
                    BigDecimal cnyChange = currentCny.subtract(last.getPriceCny());
                    BigDecimal changePct = calculatePercentageChange(usdChange, last.getPriceUsd());
                    return new GoldPriceChange(usdChange, cnyChange, changePct);
                })
                .orElse(new GoldPriceChange(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
    }

    /**
     * 计算美元价格
     */
    private BigDecimal calculateUsdPrice(BigDecimal priceCny, BigDecimal exchangeRate) {
        return priceCny.divide(exchangeRate, 6, RoundingMode.HALF_UP);
    }

    /**
     * 将盎司价格转换为克价格
     */
    private BigDecimal convertOunceToGram(BigDecimal priceCny) {
        return priceCny.divide(new BigDecimal("31.1034768"), 6, RoundingMode.HALF_UP);
    }

    /**
     * 计算百分比变化
     */
    private BigDecimal calculatePercentageChange(BigDecimal change, BigDecimal basePrice) {
        if (basePrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return change.divide(basePrice, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(4, RoundingMode.HALF_UP);
    }

    /**
     * 黄金价格和汇率数据包装类
     */
    private record GoldPriceData(BigDecimal priceUsd, BigDecimal priceCny, BigDecimal exchangeRate) {
    }

    /**
     * 价格变动数据包装类
     */
    private record GoldPriceChange(BigDecimal usdChange, BigDecimal cnyChange, BigDecimal changePct) {
    }
}
