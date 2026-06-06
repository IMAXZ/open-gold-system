package com.gold.collector.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

final class PriceRangeQueryParser {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATE_TIME_MINUTE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private PriceRangeQueryParser() {
    }

    static PriceRangeQuery parse(String startDate, String endDate) {
        return parse(startDate, endDate, LocalDateTime.now());
    }

    static PriceRangeQuery parse(String startDate, String endDate, LocalDateTime now) {
        LocalDateTime startInclusive = parseStart(startDate, now);
        LocalDateTime endExclusive = parseEnd(endDate, now);

        if (!startInclusive.isBefore(endExclusive)) {
            throw new IllegalArgumentException("开始时间不能晚于结束时间。");
        }

        return new PriceRangeQuery(startInclusive, endExclusive);
    }

    private static LocalDateTime parseStart(String value, LocalDateTime now) {
        if (value == null || value.isBlank()) {
            return now.toLocalDate().atStartOfDay();
        }

        try {
            return LocalDateTime.parse(value, DATE_TIME_MINUTE_FORMATTER);
        } catch (DateTimeParseException ignored) {
            try {
                return LocalDate.parse(value, DATE_FORMATTER).atStartOfDay();
            } catch (DateTimeParseException exception) {
                throw new IllegalArgumentException("开始时间格式无效，支持 yyyy-MM-dd 或 yyyy-MM-ddTHH:mm。", exception);
            }
        }
    }

    private static LocalDateTime parseEnd(String value, LocalDateTime now) {
        if (value == null || value.isBlank()) {
            return now.withSecond(0).withNano(0).plusMinutes(1);
        }

        try {
            return LocalDateTime.parse(value, DATE_TIME_MINUTE_FORMATTER).plusMinutes(1);
        } catch (DateTimeParseException ignored) {
            try {
                return LocalDate.parse(value, DATE_FORMATTER).plusDays(1).atStartOfDay();
            } catch (DateTimeParseException exception) {
                throw new IllegalArgumentException("结束时间格式无效，支持 yyyy-MM-dd 或 yyyy-MM-ddTHH:mm。", exception);
            }
        }
    }

    record PriceRangeQuery(LocalDateTime startInclusive, LocalDateTime endExclusive) {
    }
}
