using GoldCollector.Api;
using GoldCollector.Api.Data;
using MySqlConnector;

namespace GoldCollector.Tests.Integration;

public sealed class MySqlIntegrationTests
{
    [Fact]
    public async Task Repository_ShouldRoundTrip_WhenIntegrationEnabled()
    {
        var connectionString = Environment.GetEnvironmentVariable("GOLD_COLLECTOR_TEST_MYSQL");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        var builder = new MySqlDataSourceBuilder(connectionString);
        await using var dataSource = builder.Build();
        var repository = new MySqlGoldPriceRepository(dataSource);
        var now = DateTime.Now;
        var createdDate = DateOnly.FromDateTime(now);

        var inserted = await repository.InsertAsync(
            new GoldPriceInsertModel(3000m, 700m, 7.2m, 10m, 2m, 0.3333m, now.Month, now.Year, now, createdDate),
            CancellationToken.None);

        var latest = await repository.GetLatestAsync(CancellationToken.None);
        Assert.NotNull(latest);
        Assert.Equal(inserted.Id, latest!.Id);
    }
}
