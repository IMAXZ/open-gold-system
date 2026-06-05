using GoldCollector.Api;
using GoldCollector.Api.Data;
using Microsoft.Extensions.Logging.Abstractions;

namespace GoldCollector.Tests.Services;

public sealed class CollectorServiceTests
{
    [Fact]
    public async Task CollectAsync_ShouldReturnSkippedWhenDisabled()
    {
        var service = CreateService(
            repository: new FakeRepository(),
            apiClient: CreateApiClient(new GoldPricePayload(1m, 2m, 3m)),
            options: new GoldOptions { Enabled = false });

        var result = await service.CollectAsync(CollectRequestSource.Manual, CancellationToken.None);

        Assert.False(result.Success);
        Assert.True(result.Skipped);
    }

    [Fact]
    public async Task CollectAsync_ShouldPreventConcurrentRuns()
    {
        var gate = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var apiClient = CreateBlockingApiClient(gate.Task);
        var service = CreateService(
            repository: new FakeRepository(),
            apiClient: apiClient,
            options: new GoldOptions());

        var firstRun = service.CollectAsync(CollectRequestSource.Manual, CancellationToken.None);
        await Task.Delay(50);
        var secondRun = await service.CollectAsync(CollectRequestSource.Manual, CancellationToken.None);
        gate.SetResult();
        await firstRun;

        Assert.False(secondRun.Success);
        Assert.True(secondRun.Skipped);
        Assert.Contains("已有采集任务正在执行", secondRun.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CollectAsync_ShouldInsertCalculatedRecord()
    {
        var repository = new FakeRepository
        {
            Latest = new GoldPriceRecord(1, 3200m, 748m, 7.2m, 0m, 0m, 0m, 5, 2026, new DateTime(2026, 5, 29, 12, 0, 0), new DateOnly(2026, 5, 29))
        };
        var service = CreateService(
            repository,
            CreateApiClient(new GoldPricePayload(3210m, 750m, 7.25m)),
            new GoldOptions());

        var result = await service.CollectAsync(CollectRequestSource.Manual, CancellationToken.None);

        Assert.True(result.Success);
        Assert.NotNull(result.Record);
        Assert.Equal(10m, result.Record!.PriceUsdChange);
        Assert.Equal(0.228250m, repository.LastInserted!.PriceCnyChange);
        Assert.Equal(0.228250m, result.Record.PriceCnyChange);
        Assert.Equal(0.3125m, repository.LastInserted!.PriceChangePct);
        Assert.Equal(0.3125m, result.Record.PriceChangePct);
    }

    private static GoldCollector.Api.Services.CollectorService CreateService(
        IGoldPriceRepository repository,
        GoldCollector.Api.Services.GoldPriceApiClient apiClient,
        GoldOptions options) =>
        new(
            repository,
            apiClient,
            new TestOptionsMonitor<GoldOptions>(options),
            NullLogger<GoldCollector.Api.Services.CollectorService>.Instance);

    private sealed class FakeRepository : IGoldPriceRepository
    {
        public GoldPriceRecord? Latest { get; init; }

        public GoldPriceInsertModel? LastInserted { get; private set; }

        public Task<GoldPriceRecord?> GetLatestAsync(CancellationToken cancellationToken) =>
            Task.FromResult(Latest);

        public Task<IReadOnlyList<GoldPriceRecord>> GetHistoryAsync(int limit, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<GoldPriceRecord>>([]);

        public Task<IReadOnlyList<GoldPriceRecord>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<GoldPriceRecord>>([]);

        public Task<GoldPriceRecord> InsertAsync(GoldPriceInsertModel model, CancellationToken cancellationToken)
        {
            LastInserted = model;
            return Task.FromResult(new GoldPriceRecord(
                2,
                model.PriceUsd,
                model.PriceCny,
                model.ExchangeRate,
                model.PriceUsdChange,
                model.PriceCnyChange,
                model.PriceChangePct,
                model.Month,
                model.Year,
                model.CreatedAt,
                model.CreatedDate));
        }
    }

    private static GoldCollector.Api.Services.GoldPriceApiClient CreateApiClient(GoldPricePayload payload) =>
        new(
            new HttpClient(new FakeHandler(payload)) { BaseAddress = new Uri("https://api.gold-api.com/") },
            new TestOptionsMonitor<GoldOptions>(new GoldOptions()));

    private static GoldCollector.Api.Services.GoldPriceApiClient CreateBlockingApiClient(Task gate) =>
        new(
            new HttpClient(new BlockingHandler(gate)) { BaseAddress = new Uri("https://api.gold-api.com/") },
            new TestOptionsMonitor<GoldOptions>(new GoldOptions()));

    private sealed class FakeHandler(GoldPricePayload payload) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var response = new GoldApiResponse
            {
                Price = payload.PriceUsd * payload.ExchangeRate,
                ExchangeRate = payload.ExchangeRate
            };

            return Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = System.Net.Http.Json.JsonContent.Create(response)
            });
        }
    }

    private sealed class BlockingHandler(Task gate) : HttpMessageHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            await gate.WaitAsync(cancellationToken);
            return new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = System.Net.Http.Json.JsonContent.Create(new GoldApiResponse
                {
                    Price = 62.2069536m,
                    ExchangeRate = 1m
                })
            };
        }
    }
}
