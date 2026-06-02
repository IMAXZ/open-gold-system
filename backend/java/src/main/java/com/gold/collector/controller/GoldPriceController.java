package com.gold.collector.controller;

import com.gold.collector.entity.GoldPrice;
import com.gold.collector.repository.GoldPriceRepository;
import com.gold.collector.service.GoldPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * @author max
 */

@RequestMapping("/api")
@RestController
@RequiredArgsConstructor
public class GoldPriceController {
    private final GoldPriceRepository goldPriceRepository;
    private final GoldPriceService goldPriceService;

    /**
     * 手动触发采集
     */
    @PostMapping("/collect")
    public ResponseEntity<Void> manualCollect() {
        goldPriceService.collectGoldPrice();
        return ResponseEntity.ok(null);
    }

    /**
     * 获取最新价格
     */
    @GetMapping("/latest")
    public ResponseEntity<GoldPrice> getLatest() {
        Optional<GoldPrice> latest = goldPriceRepository.findTopByOrderByIdDesc();
        return latest.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * 获取最近 N 条记录
     */
    @GetMapping("/history")
    public ResponseEntity<List<GoldPrice>> getHistory(
            @RequestParam(defaultValue = "10") int limit) {
        // 限制最大查询数量
        if (limit > 100) {
            limit = 100;
        }
        // 先取最多的记录，然后在内存中截取
        List<GoldPrice> allRecent = goldPriceRepository.findTop100ByOrderByIdDesc();
        // 返回前 N 条（需要反转顺序，让最新的在最后）
        List<GoldPrice> result = allRecent.stream().limit(limit).toList();
        return ResponseEntity.ok(result);
    }

    /**
     * 获取价格数据列表
     *
     * @param startDate 开始日期（格式：yyyy-MM-dd，不传则默认为当天）
     * @param endDate   结束日期（格式：yyyy-MM-dd，不传则默认为当天）
     * @return 价格数据列表
     */
    @GetMapping("/prices")
    public ResponseEntity<List<GoldPrice>> getPrices(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {

        // 如果未提供日期参数，默认使用当天
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        // 查询时间范围内的数据
        List<GoldPrice> data = goldPriceRepository.findByCreatedDateBetweenOrderByIdAsc(startDate, endDate);

        return ResponseEntity.ok(data);
    }

}