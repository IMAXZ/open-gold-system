using GoldCollector.Api.Data;
using Microsoft.Extensions.Options;

namespace GoldCollector.Api.Services;

public sealed class CollectorService(
    IGoldPriceRepository repository,
    GoldPriceApiClient apiClient,
    IOptionsMonitor<GoldOptions> goldOptions,
    ILogger<CollectorService> logger)
{
    private readonly SemaphoreSlim _singleFlight = new(1, 1);

    public async Task<CollectResult> CollectAsync(CollectRequestSource source, CancellationToken cancellationToken)
    {
        if (!goldOptions.CurrentValue.Enabled)
        {
            return new CollectResult(false, true, "黄金价格采集已禁用。");
        }

        if (!await _singleFlight.WaitAsync(0, cancellationToken))
        {
            return new CollectResult(false, true, "已有采集任务正在执行。");
        }

        var startedAt = DateTime.UtcNow;

        try
        {
            logger.LogInformation("开始采集黄金价格，触发来源：{Source}", source);

            var payload = await apiClient.GetCurrentPriceAsync(cancellationToken);
            var latest = await repository.GetLatestAsync(cancellationToken);
            var change = GoldMath.CalculateChange(payload, latest);

            var now = DateTime.Now;
            var createdDate = DateOnly.FromDateTime(now);
            var insertModel = new GoldPriceInsertModel(
                payload.PriceUsd,
                payload.PriceCny,
                payload.ExchangeRate,
                change.UsdChange,
                change.CnyChange,
                change.ChangePct,
                now.Month,
                now.Year,
                now,
                createdDate);

            var inserted = await repository.InsertAsync(insertModel, cancellationToken);
            var record = GoldPriceResponse.FromRecord(inserted);
            logger.LogInformation(
                "黄金价格已保存，触发来源：{Source}，记录Id：{Id}，美元价格：{PriceUsd}，人民币价格：{PriceCny}，耗时毫秒：{DurationMs}",
                source,
                inserted.Id,
                inserted.PriceUsd,
                inserted.PriceCny,
                (DateTime.UtcNow - startedAt).TotalMilliseconds);

            return new CollectResult(true, false, "黄金价格采集成功。", record);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "黄金价格采集失败，触发来源：{Source}", source);
            throw;
        }
        finally
        {
            _singleFlight.Release();
        }
    }
}
