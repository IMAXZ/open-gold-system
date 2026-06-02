export const QUICK_DAYS = [
  { label: '今天', value: 0 },
  { label: '昨天', value: 1 },
  { label: '近 3 天', value: 3 },
  { label: '近 7 天', value: 7 },
  { label: '近 30 天', value: 30 }
]

export const GRANULARITY_OPTIONS = [
  { label: '1 分钟', value: 1 },
  { label: '5 分钟', value: 5 },
  { label: '10 分钟', value: 10 },
  { label: '15 分钟', value: 15 },
  { label: '30 分钟', value: 30 },
  { label: '1 小时', value: 60 }
]

export const CURRENCY_OPTIONS = [
  { label: '人民币', value: 'CNY', icon: '￥' },
  { label: '美元', value: 'USD', icon: '$' }
]

export const CHART_TYPE_OPTIONS = [
  { label: '价格走势', value: 'price', icon: '折' },
  { label: '涨跌幅', value: 'trend', icon: '幅' },
  { label: '汇率走势', value: 'rate', icon: '率' },
  { label: '价格对比', value: 'compare', icon: '比' }
]

export const UNIT_LABELS = {
  USD: '美元/盎司',
  CNY: '元/克'
}
