namespace GoldCollector.Api.Data;

public interface IGoldPriceRepository
{
    Task<GoldPriceRecord?> GetLatestAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<GoldPriceRecord>> GetHistoryAsync(int limit, CancellationToken cancellationToken);

    Task<IReadOnlyList<GoldPriceRecord>> GetByDateRangeAsync(DateTime startInclusive, DateTime endExclusive, CancellationToken cancellationToken);

    Task<GoldPriceRecord> InsertAsync(GoldPriceInsertModel model, CancellationToken cancellationToken);
}
