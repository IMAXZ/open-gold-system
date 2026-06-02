namespace GoldCollector.Api.Data;

public interface IGoldPriceRepository
{
    Task<GoldPriceRecord?> GetLatestAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<GoldPriceRecord>> GetHistoryAsync(int limit, CancellationToken cancellationToken);

    Task<IReadOnlyList<GoldPriceRecord>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken);

    Task<GoldPriceRecord> InsertAsync(GoldPriceInsertModel model, CancellationToken cancellationToken);
}
