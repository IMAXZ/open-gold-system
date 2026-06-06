package com.gold.collector.controller;

import com.gold.collector.entity.GoldPrice;
import com.gold.collector.service.GoldPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 黄金价格查询与采集接口。
 *
 * @author max
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GoldPriceController {
    private final GoldPriceService goldPriceService;

    @PostMapping("/collect")
    public ResponseEntity<Void> manualCollect() {
        goldPriceService.collectGoldPrice();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/latest")
    public ResponseEntity<GoldPrice> getLatest() {
        Optional<GoldPrice> latest = goldPriceService.getLatestRecord();
        return latest.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<GoldPrice>> getHistory(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(goldPriceService.getRecentRecords(limit));
    }

    @GetMapping("/prices")
    public ResponseEntity<?> getPrices(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            PriceRangeQueryParser.PriceRangeQuery range = PriceRangeQueryParser.parse(startDate, endDate);
            return ResponseEntity.ok(goldPriceService.getRecordsByDateRange(
                    range.startInclusive(),
                    range.endExclusive()));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }
}
