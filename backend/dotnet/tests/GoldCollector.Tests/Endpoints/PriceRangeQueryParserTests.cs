using GoldCollector.Api.Controllers;

namespace GoldCollector.Tests.Endpoints;

public sealed class PriceRangeQueryParserTests
{
    private static readonly DateTime FixedNow = new(2026, 6, 6, 14, 23, 45);

    [Fact]
    public void TryParse_ShouldSupportMinutePrecision()
    {
        var success = PriceRangeQueryParser.TryParse(
            "2026-06-05T08:15",
            "2026-06-05T09:30",
            FixedNow,
            out var range,
            out var errorMessage);

        Assert.True(success);
        Assert.Null(errorMessage);
        Assert.Equal(new DateTime(2026, 6, 5, 8, 15, 0), range.StartInclusive);
        Assert.Equal(new DateTime(2026, 6, 5, 9, 31, 0), range.EndExclusive);
    }

    [Fact]
    public void TryParse_ShouldKeepDateOnlyBackwardCompatible()
    {
        var success = PriceRangeQueryParser.TryParse(
            "2026-06-05",
            "2026-06-05",
            FixedNow,
            out var range,
            out var errorMessage);

        Assert.True(success);
        Assert.Null(errorMessage);
        Assert.Equal(new DateTime(2026, 6, 5, 0, 0, 0), range.StartInclusive);
        Assert.Equal(new DateTime(2026, 6, 6, 0, 0, 0), range.EndExclusive);
    }

    [Fact]
    public void TryParse_ShouldDefaultToTodayWhenMissing()
    {
        var success = PriceRangeQueryParser.TryParse(
            null,
            null,
            FixedNow,
            out var range,
            out var errorMessage);

        Assert.True(success);
        Assert.Null(errorMessage);
        Assert.Equal(new DateTime(2026, 6, 6, 0, 0, 0), range.StartInclusive);
        Assert.Equal(new DateTime(2026, 6, 6, 14, 24, 0), range.EndExclusive);
    }

    [Fact]
    public void TryParse_ShouldRejectInvertedRange()
    {
        var success = PriceRangeQueryParser.TryParse(
            "2026-06-05T10:31",
            "2026-06-05T10:30",
            FixedNow,
            out _,
            out var errorMessage);

        Assert.False(success);
        Assert.Equal("开始时间不能晚于结束时间。", errorMessage);
    }
}
