using GoldCollector.Api.Data;
using GoldCollector.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GoldCollector.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class GoldPriceController(
    IGoldPriceRepository repository,
    CollectorService collectorService) : ControllerBase
{
    [HttpPost("collect")]
    public async Task<ActionResult<CollectResult>> ManualCollect(CancellationToken cancellationToken)
    {
        try
        {
            var result = await collectorService.CollectAsync(CollectRequestSource.Manual, cancellationToken);
            if (result.Success)
            {
                return Ok(result);
            }

            return result.Skipped && string.Equals(result.Message, "已有采集任务正在执行。", StringComparison.Ordinal)
                ? Conflict(result)
                : Ok(result);
        }
        catch (Exception ex)
        {
            return Problem(title: "手动采集失败。", detail: ex.Message, statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [HttpGet("latest")]
    public async Task<ActionResult<GoldPriceResponse>> GetLatest(CancellationToken cancellationToken)
    {
        var latest = await repository.GetLatestAsync(cancellationToken);
        if (latest is null)
        {
            return NotFound();
        }

        return Ok(GoldPriceResponse.FromRecord(latest));
    }

    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyList<GoldPriceResponse>>> GetHistory(
        [FromQuery] int? limit,
        CancellationToken cancellationToken)
    {
        var normalizedLimit = Math.Clamp(limit ?? 10, 1, 100);
        var records = await repository.GetHistoryAsync(normalizedLimit, cancellationToken);
        return Ok(records.Select(GoldPriceResponse.FromRecord).ToArray());
    }

    [HttpGet("prices")]
    public async Task<ActionResult<IReadOnlyList<GoldPriceResponse>>> GetPrices(
        [FromQuery] string? startDate,
        [FromQuery] string? endDate,
        CancellationToken cancellationToken)
    {
        if (!PriceRangeQueryParser.TryParse(startDate, endDate, DateTime.Now, out var range, out var errorMessage))
        {
            ModelState.AddModelError(nameof(startDate), errorMessage ?? "时间范围无效。");
            return ValidationProblem(ModelState);
        }

        var records = await repository.GetByDateRangeAsync(
            range.StartInclusive,
            range.EndExclusive,
            cancellationToken);
        return Ok(records.Select(GoldPriceResponse.FromRecord).ToArray());
    }
}
