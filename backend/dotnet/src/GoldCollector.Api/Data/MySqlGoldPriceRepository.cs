using Dapper;
using MySqlConnector;

namespace GoldCollector.Api.Data;

public sealed class MySqlGoldPriceRepository(MySqlDataSource dataSource) : IGoldPriceRepository
{
    public async Task<GoldPriceRecord?> GetLatestAsync(CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        const string sql = """
            SELECT
                id AS Id,
                price_usd AS PriceUsd,
                price_cny AS PriceCny,
                exchange_rate AS ExchangeRate,
                price_usd_change AS PriceUsdChange,
                price_cny_change AS PriceCnyChange,
                price_change_pct AS PriceChangePct,
                month AS Month,
                year AS Year,
                created_at AS CreatedAt,
                created_date AS CreatedDate
            FROM gold_price
            ORDER BY id DESC
            LIMIT 1;
            """;
        var row = await connection.QuerySingleOrDefaultAsync<GoldPriceRow>(
            new CommandDefinition(sql, cancellationToken: cancellationToken));
        return row?.ToRecord();
    }

    public async Task<IReadOnlyList<GoldPriceRecord>> GetHistoryAsync(int limit, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        const string sql = """
            SELECT
                id AS Id,
                price_usd AS PriceUsd,
                price_cny AS PriceCny,
                exchange_rate AS ExchangeRate,
                price_usd_change AS PriceUsdChange,
                price_cny_change AS PriceCnyChange,
                price_change_pct AS PriceChangePct,
                month AS Month,
                year AS Year,
                created_at AS CreatedAt,
                created_date AS CreatedDate
            FROM gold_price
            ORDER BY id DESC
            LIMIT @limit;
            """;
        var items = await connection.QueryAsync<GoldPriceRow>(
            new CommandDefinition(sql, new { limit }, cancellationToken: cancellationToken));
        return items.Select(x => x.ToRecord()).ToArray();
    }

    public async Task<IReadOnlyList<GoldPriceRecord>> GetByDateRangeAsync(
        DateTime startInclusive,
        DateTime endExclusive,
        CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        const string sql = """
            SELECT
                id AS Id,
                price_usd AS PriceUsd,
                price_cny AS PriceCny,
                exchange_rate AS ExchangeRate,
                price_usd_change AS PriceUsdChange,
                price_cny_change AS PriceCnyChange,
                price_change_pct AS PriceChangePct,
                month AS Month,
                year AS Year,
                created_at AS CreatedAt,
                created_date AS CreatedDate
            FROM gold_price
            WHERE created_at >= @startInclusive
              AND created_at < @endExclusive
            ORDER BY id ASC;
            """;
        var items = await connection.QueryAsync<GoldPriceRow>(
            new CommandDefinition(
                sql,
                new
                {
                    startInclusive,
                    endExclusive
                },
                cancellationToken: cancellationToken));
        return items.Select(x => x.ToRecord()).ToArray();
    }

    public async Task<GoldPriceRecord> InsertAsync(GoldPriceInsertModel model, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        const string sql = """
            INSERT INTO gold_price
            (
                price_usd,
                price_cny,
                exchange_rate,
                price_usd_change,
                price_cny_change,
                price_change_pct,
                month,
                year,
                created_at,
                created_date
            )
            VALUES
            (
                @priceUsd,
                @priceCny,
                @exchangeRate,
                @priceUsdChange,
                @priceCnyChange,
                @priceChangePct,
                @month,
                @year,
                @createdAt,
                @createdDate
            );
            SELECT LAST_INSERT_ID();
            """;
        var insertedId = await connection.ExecuteScalarAsync<long>(
            new CommandDefinition(
                sql,
                new
                {
                    model.PriceUsd,
                    model.PriceCny,
                    model.ExchangeRate,
                    model.PriceUsdChange,
                    model.PriceCnyChange,
                    model.PriceChangePct,
                    model.Month,
                    model.Year,
                    model.CreatedAt,
                    CreatedDate = model.CreatedDate.ToDateTime(TimeOnly.MinValue)
                },
                cancellationToken: cancellationToken));
        return new GoldPriceRecord(
            insertedId,
            model.PriceUsd,
            model.PriceCny,
            model.ExchangeRate,
            model.PriceUsdChange,
            model.PriceCnyChange,
            model.PriceChangePct,
            model.Month,
            model.Year,
            model.CreatedAt,
            model.CreatedDate);
    }

    private sealed class GoldPriceRow
    {
        public long Id { get; init; }

        public decimal PriceUsd { get; init; }

        public decimal PriceCny { get; init; }

        public decimal ExchangeRate { get; init; }

        public decimal PriceUsdChange { get; init; }

        public decimal PriceCnyChange { get; init; }

        public decimal PriceChangePct { get; init; }

        public int Month { get; init; }

        public int Year { get; init; }

        public DateTime CreatedAt { get; init; }

        public DateTime CreatedDate { get; init; }

        public GoldPriceRecord ToRecord() =>
            new(
                Id,
                PriceUsd,
                PriceCny,
                ExchangeRate,
                PriceUsdChange,
                PriceCnyChange,
                PriceChangePct,
                Month,
                Year,
                CreatedAt,
                DateOnly.FromDateTime(CreatedDate));
    }
}
