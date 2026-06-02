export function getUnitLabel(currency) {
  return currency === 'USD' ? '美元/盎司' : '元/克'
}

export function buildChartData(prices) {
  return {
    series: [
      {
        name: '黄金价格 (USD)',
        type: 'line',
        data: prices.map((item) => item.priceUsd)
      },
      {
        name: '黄金价格 (CNY)',
        type: 'line',
        data: prices.map((item) => item.priceCny)
      }
    ],
    xaxis: prices.map((item) => item.createdAt),
    prices
  }
}

export function aggregateChartData(data, minutes) {
  if (!data || !data.prices || data.prices.length === 0 || minutes <= 1) {
    return data
  }

  const buckets = []
  let bucketStart = new Date(data.prices[0].createdAt).getTime()
  let bucket = []

  data.prices.forEach((price) => {
    const timestamp = new Date(price.createdAt).getTime()
    if (timestamp - bucketStart >= minutes * 60 * 1000 && bucket.length > 0) {
      buckets.push(bucket)
      bucket = []
      bucketStart = timestamp
    }
    bucket.push(price)
  })

  if (bucket.length > 0) {
    buckets.push(bucket)
  }

  const aggregatedPrices = buckets.map((items) => {
    const last = items[items.length - 1]
    const average = (key) => items.reduce((sum, item) => sum + item[key], 0) / items.length

    return {
      createdAt: last.createdAt,
      priceUsd: average('priceUsd'),
      priceCny: average('priceCny'),
      exchangeRate: average('exchangeRate')
    }
  })

  return buildChartData(aggregatedPrices)
}

export function calculateStats(data) {
  if (!data || !data.prices || data.prices.length === 0) {
    return null
  }

  const prices = data.prices
  const first = prices[0]
  const last = prices[prices.length - 1]
  const usdPrices = prices.map((item) => item.priceUsd)
  const cnyPrices = prices.map((item) => item.priceCny)
  const rates = prices.map((item) => item.exchangeRate)

  return {
    usdMax: Math.max(...usdPrices).toFixed(2),
    usdMin: Math.min(...usdPrices).toFixed(2),
    usdAvg: (usdPrices.reduce((sum, value) => sum + value, 0) / usdPrices.length).toFixed(2),
    usdStart: first.priceUsd.toFixed(2),
    usdEnd: last.priceUsd.toFixed(2),
    usdChange: (((last.priceUsd - first.priceUsd) / first.priceUsd) * 100).toFixed(3),
    usdChangePositive: last.priceUsd >= first.priceUsd,
    usdVolatility: (Math.max(...usdPrices) - Math.min(...usdPrices)).toFixed(2),
    cnyMax: Math.max(...cnyPrices).toFixed(2),
    cnyMin: Math.min(...cnyPrices).toFixed(2),
    cnyAvg: (cnyPrices.reduce((sum, value) => sum + value, 0) / cnyPrices.length).toFixed(2),
    cnyStart: first.priceCny.toFixed(2),
    cnyEnd: last.priceCny.toFixed(2),
    cnyChange: (((last.priceCny - first.priceCny) / first.priceCny) * 100).toFixed(3),
    cnyChangePositive: last.priceCny >= first.priceCny,
    cnyVolatility: (Math.max(...cnyPrices) - Math.min(...cnyPrices)).toFixed(2),
    rateStart: first.exchangeRate.toFixed(4),
    rateEnd: last.exchangeRate.toFixed(4),
    rateChange: (((last.exchangeRate - first.exchangeRate) / first.exchangeRate) * 100).toFixed(3),
    rateChangePositive: last.exchangeRate >= first.exchangeRate,
    rateVolatility: (Math.max(...rates) - Math.min(...rates)).toFixed(4)
  }
}
