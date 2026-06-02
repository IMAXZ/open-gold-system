namespace GoldCollector.Api.Services;

public static class GoldMath
{
    private const decimal OunceToGramDivisor = 31.1034768m;

    public static decimal CalculateUsdPrice(decimal priceCnyPerOunce, decimal exchangeRate) =>
        Math.Round(priceCnyPerOunce / exchangeRate, 6, MidpointRounding.AwayFromZero);

    public static decimal ConvertOunceToGram(decimal priceCnyPerOunce) =>
        Math.Round(priceCnyPerOunce / OunceToGramDivisor, 6, MidpointRounding.AwayFromZero);

    public static decimal CalculatePercentageChange(decimal change, decimal basePrice)
    {
        if (basePrice <= 0)
        {
            return 0m;
        }

        return Math.Round(change / basePrice * 100m, 4, MidpointRounding.AwayFromZero);
    }

    public static GoldPriceChange CalculateChange(GoldPricePayload current, GoldPriceRecord? previous)
    {
        if (previous is null)
        {
            return new GoldPriceChange(0m, 0m, 0m);
        }

        var usdChange = current.PriceUsd - previous.PriceUsd;
        var cnyChange = current.PriceCny - previous.PriceCny;
        var changePct = CalculatePercentageChange(usdChange, previous.PriceUsd);
        return new GoldPriceChange(usdChange, cnyChange, changePct);
    }
}
