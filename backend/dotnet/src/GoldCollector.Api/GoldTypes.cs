using System.Text.Json.Serialization;

namespace GoldCollector.Api;

public sealed class GoldOptions
{
    public bool Enabled { get; set; } = true;

    public GoldApiOptions Api { get; set; } = new();

    public GoldExchangeRateOptions ExchangeRate { get; set; } = new();
}

public sealed class GoldApiOptions
{
    public string BaseUrl { get; set; } = "https://api.gold-api.com/";

    public int TimeoutMs { get; set; } = 5000;
}

public sealed class GoldExchangeRateOptions
{
    public decimal Default { get; set; } = 7.25m;
}

public sealed class CollectorOptions
{
    public string Cron { get; set; } = "0 0/1 * * * ?";
}

public sealed class CorsOptions
{
    public string[] AllowedOrigins { get; set; } = [];
}

public sealed record GoldPriceRecord(
    long Id,
    decimal PriceUsd,
    decimal PriceCny,
    decimal ExchangeRate,
    decimal PriceUsdChange,
    decimal PriceCnyChange,
    decimal PriceChangePct,
    int Month,
    int Year,
    DateTime CreatedAt,
    DateOnly CreatedDate);

public sealed record GoldPriceResponse(
    long Id,
    decimal PriceUsd,
    decimal PriceCny,
    decimal ExchangeRate,
    decimal PriceUsdChange,
    decimal PriceCnyChange,
    decimal PriceChangePct,
    int Month,
    int Year,
    DateTime CreatedAt,
    DateOnly CreatedDate)
{
    public static GoldPriceResponse FromRecord(GoldPriceRecord record) =>
        new(
            record.Id,
            record.PriceUsd,
            record.PriceCny,
            record.ExchangeRate,
            record.PriceUsdChange,
            record.PriceCnyChange,
            record.PriceChangePct,
            record.Month,
            record.Year,
            record.CreatedAt,
            record.CreatedDate);
}

public sealed record GoldPriceInsertModel(
    decimal PriceUsd,
    decimal PriceCny,
    decimal ExchangeRate,
    decimal PriceUsdChange,
    decimal PriceCnyChange,
    decimal PriceChangePct,
    int Month,
    int Year,
    DateTime CreatedAt,
    DateOnly CreatedDate);

public sealed record GoldPricePayload(
    decimal PriceUsd,
    decimal PriceCny,
    decimal ExchangeRate);

public sealed record GoldPriceChange(
    decimal UsdChange,
    decimal CnyChange,
    decimal ChangePct);

public enum CollectRequestSource
{
    Scheduled = 0,
    Manual = 1
}

public sealed record CollectResult(
    bool Success,
    bool Skipped,
    string Message,
    GoldPriceResponse? Record = null);

public sealed record GoldApiResponse
{
    [JsonPropertyName("currency")]
    public string? Currency { get; init; }

    [JsonPropertyName("currency_symbol")]
    public string? CurrencySymbol { get; init; }

    [JsonPropertyName("exchange_rate")]
    public decimal? ExchangeRate { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }

    [JsonPropertyName("price")]
    public decimal? Price { get; init; }

    [JsonPropertyName("symbol")]
    public string? Symbol { get; init; }

    [JsonPropertyName("updatedAt")]
    public DateTimeOffset? UpdatedAt { get; init; }
}
