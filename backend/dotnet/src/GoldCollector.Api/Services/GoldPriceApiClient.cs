using Microsoft.Extensions.Options;

namespace GoldCollector.Api.Services;

public sealed class GoldPriceApiClient(
    HttpClient httpClient,
    IOptionsMonitor<GoldOptions> goldOptions)
{
    public async Task<GoldPricePayload> GetCurrentPriceAsync(CancellationToken cancellationToken)
    {
        var response = await httpClient.GetFromJsonAsync<GoldApiResponse>(
            "price/XAU/CNY",
            cancellationToken);

        if (response?.Price is null)
        {
            throw new InvalidOperationException("黄金价格接口返回的价格为空。");
        }

        var options = goldOptions.CurrentValue;
        var exchangeRate = response.ExchangeRate ?? options.ExchangeRate.Default;
        if (exchangeRate <= 0)
        {
            throw new InvalidOperationException("汇率必须大于 0。");
        }

        var priceUsd = GoldMath.CalculateUsdPrice(response.Price.Value, exchangeRate);
        var priceCny = GoldMath.ConvertOunceToGram(response.Price.Value);
        return new GoldPricePayload(priceUsd, priceCny, exchangeRate);
    }
}
