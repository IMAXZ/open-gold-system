package com.gold.collector.controller;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PriceRangeQueryParserTest {
    private static final LocalDateTime FIXED_NOW = LocalDateTime.of(2026, 6, 6, 14, 23, 45);

    @Test
    void parseShouldSupportMinutePrecision() {
        PriceRangeQueryParser.PriceRangeQuery range =
                PriceRangeQueryParser.parse("2026-06-05T08:15", "2026-06-05T09:30", FIXED_NOW);

        assertEquals(LocalDateTime.of(2026, 6, 5, 8, 15), range.startInclusive());
        assertEquals(LocalDateTime.of(2026, 6, 5, 9, 31), range.endExclusive());
    }

    @Test
    void parseShouldKeepDateOnlyBackwardCompatible() {
        PriceRangeQueryParser.PriceRangeQuery range =
                PriceRangeQueryParser.parse("2026-06-05", "2026-06-05", FIXED_NOW);

        assertEquals(LocalDateTime.of(2026, 6, 5, 0, 0), range.startInclusive());
        assertEquals(LocalDateTime.of(2026, 6, 6, 0, 0), range.endExclusive());
    }

    @Test
    void parseShouldDefaultToTodayWhenMissing() {
        PriceRangeQueryParser.PriceRangeQuery range =
                PriceRangeQueryParser.parse(null, null, FIXED_NOW);

        assertEquals(LocalDateTime.of(2026, 6, 6, 0, 0), range.startInclusive());
        assertEquals(LocalDateTime.of(2026, 6, 6, 14, 24), range.endExclusive());
    }

    @Test
    void parseShouldRejectInvertedRange() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> PriceRangeQueryParser.parse("2026-06-05T10:31", "2026-06-05T10:30", FIXED_NOW));

        assertEquals("开始时间不能晚于结束时间。", exception.getMessage());
    }
}
