using System.Net;
using System.Net.Http.Json;
using GoldCollector.Api;
using GoldCollector.Api.Services;
using Microsoft.Extensions.Options;

namespace GoldCollector.Tests.Services;

public sealed class GoldPriceApiClientTests
{
    [Fact]
    public async Task GetCurrentPriceAsync_ShouldFallbackToDefaultExchangeRate()
    {
        var handler = new StubHandler(_ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = JsonContent.Create(new GoldApiResponse { Price = 23500m, ExchangeRate = null })
        }));

        using var client = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.gold-api.com/")
        };

        var options = Options.Create(new GoldOptions
        {
            ExchangeRate = new GoldExchangeRateOptions { Default = 7.25m }
        });

        var apiClient = new GoldPriceApiClient(client, new TestOptionsMonitor<GoldOptions>(options.Value));
        var result = await apiClient.GetCurrentPriceAsync(CancellationToken.None);

        Assert.Equal(7.25m, result.ExchangeRate);
        Assert.Equal(3241.37931m, result.PriceUsd);
        Assert.Equal(755.542544m, result.PriceCny);
    }

    [Fact]
    public async Task GetCurrentPriceAsync_ShouldThrowWhenPriceMissing()
    {
        var handler = new StubHandler(_ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = JsonContent.Create(new GoldApiResponse { Price = null, ExchangeRate = 7.2m })
        }));

        using var client = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.gold-api.com/")
        };

        var apiClient = new GoldPriceApiClient(
            client,
            new TestOptionsMonitor<GoldOptions>(new GoldOptions()));

        await Assert.ThrowsAsync<InvalidOperationException>(() => apiClient.GetCurrentPriceAsync(CancellationToken.None));
    }

    private sealed class StubHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> handler) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            handler(request);
    }
}
