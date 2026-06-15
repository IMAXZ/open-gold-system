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

function toFixedString(value, digits) {
  return value.toFixed(digits)
}

function calcAbsoluteChange(current, base, digits = 2) {
  return toFixedString(current - base, digits)
}

function calcPercentChange(current, base, digits = 3) {
  if (!base) {
    return toFixedString(0, digits)
  }

  return toFixedString(((current - base) / base) * 100, digits)
}

function calcRangePercent(max, min, digits = 2) {
  if (!min) {
    return toFixedString(0, digits)
  }

  return toFixedString(((max - min) / min) * 100, digits)
}

function calcPositionPercent(current, min, max) {
  if (max <= min) {
    return toFixedString(50, 0)
  }

  const raw = ((current - min) / (max - min)) * 100
  const normalized = Math.min(100, Math.max(0, raw))
  return toFixedString(normalized, 0)
}

function buildSeriesStats(values, firstValue, lastValue, digits) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length

  return {
    max: toFixedString(max, digits),
    min: toFixedString(min, digits),
    avg: toFixedString(avg, digits),
    start: toFixedString(firstValue, digits),
    end: toFixedString(lastValue, digits),
    changeValue: calcAbsoluteChange(lastValue, firstValue, digits),
    change: calcPercentChange(lastValue, firstValue),
    changePositive: lastValue >= firstValue,
    volatility: toFixedString(max - min, digits),
    rangePct: calcRangePercent(max, min),
    positionPct: calcPositionPercent(lastValue, min, max),
    fromHighPct: calcPercentChange(lastValue, max, 2),
    fromLowPct: calcPercentChange(lastValue, min, 2)
  }
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
  const usdStats = buildSeriesStats(usdPrices, first.priceUsd, last.priceUsd, 2)
  const cnyStats = buildSeriesStats(cnyPrices, first.priceCny, last.priceCny, 2)

  return {
    usdMax: usdStats.max,
    usdMin: usdStats.min,
    usdAvg: usdStats.avg,
    usdStart: usdStats.start,
    usdEnd: usdStats.end,
    usdChangeValue: usdStats.changeValue,
    usdChange: usdStats.change,
    usdChangePositive: usdStats.changePositive,
    usdVolatility: usdStats.volatility,
    usdRangePct: usdStats.rangePct,
    usdPositionPct: usdStats.positionPct,
    usdFromHighPct: usdStats.fromHighPct,
    usdFromLowPct: usdStats.fromLowPct,
    cnyMax: cnyStats.max,
    cnyMin: cnyStats.min,
    cnyAvg: cnyStats.avg,
    cnyStart: cnyStats.start,
    cnyEnd: cnyStats.end,
    cnyChangeValue: cnyStats.changeValue,
    cnyChange: cnyStats.change,
    cnyChangePositive: cnyStats.changePositive,
    cnyVolatility: cnyStats.volatility,
    cnyRangePct: cnyStats.rangePct,
    cnyPositionPct: cnyStats.positionPct,
    cnyFromHighPct: cnyStats.fromHighPct,
    cnyFromLowPct: cnyStats.fromLowPct,
    rateStart: first.exchangeRate.toFixed(4),
    rateEnd: last.exchangeRate.toFixed(4),
    rateChange: calcPercentChange(last.exchangeRate, first.exchangeRate),
    rateChangePositive: last.exchangeRate >= first.exchangeRate,
    rateVolatility: (Math.max(...rates) - Math.min(...rates)).toFixed(4)
  }
}
