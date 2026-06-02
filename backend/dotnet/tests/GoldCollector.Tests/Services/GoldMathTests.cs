using GoldCollector.Api;
using GoldCollector.Api.Services;

namespace GoldCollector.Tests.Services;

public sealed class GoldMathTests
{
    [Fact]
    public void ConvertOunceToGram_ShouldMatchExpectedScale()
    {
        var result = GoldMath.ConvertOunceToGram(23500m);
        Assert.Equal(755.542544m, result);
    }

    [Fact]
    public void CalculateUsdPrice_ShouldDivideByExchangeRate()
    {
        var result = GoldMath.CalculateUsdPrice(23500m, 7.25m);
        Assert.Equal(3241.37931m, result);
    }

    [Fact]
    public void CalculatePercentageChange_ShouldReturnZeroWhenBasePriceInvalid()
    {
        var result = GoldMath.CalculatePercentageChange(12.5m, 0m);
        Assert.Equal(0m, result);
    }

    [Fact]
    public void CalculateChange_ShouldUsePreviousRecordWhenAvailable()
    {
        var current = new GoldPricePayload(3210m, 750m, 7.25m);
        var previous = new GoldPriceRecord(1, 3200m, 748m, 7.2m, 0m, 0m, 0m, 5, 2026, new DateTime(2026, 5, 29, 12, 0, 0), new DateOnly(2026, 5, 29));

        var result = GoldMath.CalculateChange(current, previous);

        Assert.Equal(10m, result.UsdChange);
        Assert.Equal(2m, result.CnyChange);
        Assert.Equal(0.3125m, result.ChangePct);
    }
}
