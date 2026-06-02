package com.gold.collector.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * @author max
 */
@TableName("gold_price")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoldPrice {
    @TableId(type = IdType.AUTO)
    private Long id;
    private BigDecimal priceUsd;
    private BigDecimal priceCny;
    private BigDecimal exchangeRate;
    private BigDecimal priceUsdChange;
    private BigDecimal priceCnyChange;
    private BigDecimal priceChangePct;
    private int month;
    private int year;
    private LocalDateTime createdAt;
    private LocalDate createdDate;
}
