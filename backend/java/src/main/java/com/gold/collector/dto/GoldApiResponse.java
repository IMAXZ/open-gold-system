package com.gold.collector.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author max
 */
@Data
public class GoldApiResponse {
    private String currency;
    private String currencySymbol;
    private BigDecimal exchangeRate;
    private String name;
    private BigDecimal price;
    private String symbol;
    private LocalDateTime updatedAt;
}