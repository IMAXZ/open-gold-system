package com.gold.collector.entity;

import jakarta.persistence.*;
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
@Entity
@Table(name = "gold_price")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoldPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "price_usd", precision = 20, scale = 8)
    private BigDecimal priceUsd;

    @Column(name = "price_cny", precision = 20, scale = 8)
    private BigDecimal priceCny;

    @Column(name = "exchange_rate", precision = 12, scale = 4)
    private BigDecimal exchangeRate;

    @Column(name = "price_usd_change", precision = 20, scale = 8)
    private BigDecimal priceUsdChange;

    @Column(name = "price_cny_change", precision = 20, scale = 8)
    private BigDecimal priceCnyChange;

    @Column(name = "price_change_pct", precision = 10, scale = 4)
    private BigDecimal priceChangePct;

    @Column(name = "month")
    private int month;

    @Column(name = "year")
    private int year;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_date")
    private LocalDate createdDate;
}