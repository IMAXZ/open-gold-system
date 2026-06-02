using Quartz;

namespace GoldCollector.Api.Services;

public sealed class CollectorJob(
    CollectorService collectorService,
    ILogger<CollectorJob> logger) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            var result = await collectorService.CollectAsync(
                CollectRequestSource.Scheduled,
                context.CancellationToken);

            if (!result.Success && !result.Skipped)
            {
                logger.LogWarning("定时采集执行完成但未成功，消息：{Message}", result.Message);
            }
        }
        catch (OperationCanceledException) when (context.CancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Quartz 定时采集执行失败。");
            throw;
        }
    }
}
