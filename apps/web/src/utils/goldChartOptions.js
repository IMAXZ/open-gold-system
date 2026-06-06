import * as echarts from 'echarts'
import { getUnitLabel } from '@/utils/goldChartData'

function formatAxisTime(time) {
  const date = new Date(time)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

function calcChangeRate(values) {
  if (!values || values.length < 2) {
    return values || []
  }

  const base = values[0]
  if (!base) {
    return values.map(() => 0)
  }

  return values.map((value) => ((value - base) / base) * 100)
}

function createPaddedRange(value, precision = 100) {
  const range = value.max - value.min
  const padding = range * 0.12 || 1
  return {
    min: Math.floor((value.min - padding) * precision) / precision,
    max: Math.ceil((value.max + padding) * precision) / precision
  }
}

function getPalette(theme) {
  if (theme === 'light') {
    return {
      bg: 'transparent',
      text: '#3d2d0b',
      subtext: '#6f5a2f',
      axis: '#7d6a4c',
      split: 'rgba(125, 106, 76, 0.12)',
      tooltipBg: 'rgba(255,255,255,0.97)',
      tooltipText: '#30220c',
      tooltipBorder: 'rgba(212,154,31,0.45)',
      tooltipStrip: 'rgba(255,215,120,0.12)',
      usd: '#d49a1f',
      cny: '#d4442f',
      rate: '#0f9fb3',
      up: '#d4442f',
      down: '#1f9d55'
    }
  }

  return {
    bg: 'transparent',
    text: '#fff2cc',
    subtext: '#c7b17b',
    axis: '#bfb6a3',
    split: 'rgba(255,255,255,0.08)',
    tooltipBg: 'rgba(18,22,35,0.96)',
    tooltipText: '#fff7e6',
    tooltipBorder: 'rgba(255,196,80,0.35)',
    tooltipStrip: 'rgba(255,255,255,0.06)',
    usd: '#ffcc4d',
    cny: '#ff7a59',
    rate: '#45d0e3',
    up: '#ff5b5b',
    down: '#38c172'
  }
}

function buildBaseOption({ theme, title, subtext, legend }) {
  const colors = getPalette(theme)

  return {
    backgroundColor: colors.bg,
    animationDuration: 450,
    title: {
      text: title,
      subtext,
      left: 'center',
      top: 12,
      textStyle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 700
      },
      subtextStyle: {
        color: colors.subtext,
        fontSize: 12
      }
    },
    legend: {
      data: legend,
      top: 60,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 8,
      textStyle: {
        color: colors.subtext
      }
    },
    grid: {
      left: 24,
      right: 24,
      top: 105,
      bottom: 76,
      containLabel: true
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        throttle: 30
      },
      {
        start: 0,
        end: 100,
        height: 22,
        bottom: 18,
        borderColor: 'transparent',
        brushSelect: false,
        fillerColor: theme === 'light' ? 'rgba(212,154,31,0.16)' : 'rgba(255,204,77,0.16)',
        backgroundColor: theme === 'light' ? 'rgba(125,106,76,0.06)' : 'rgba(255,255,255,0.06)',
        handleSize: '85%',
        moveHandleSize: 0,
        textStyle: {
          color: colors.axis
        }
      }
    ]
  }
}

function buildTooltip(colors, formatter, axisPointer) {
  return {
    trigger: 'axis',
    triggerOn: 'mousemove|click',
    confine: true,
    padding: 0,
    showDelay: 0,
    transitionDuration: 0.08,
    backgroundColor: colors.tooltipBg,
    borderColor: colors.tooltipBorder,
    borderWidth: 1,
    extraCssText: 'box-shadow:0 18px 40px rgba(0,0,0,0.22);border-radius:16px;overflow:hidden;',
    textStyle: {
      color: colors.tooltipText
    },
    axisPointer,
    formatter
  }
}

function buildTooltipRow(color, label, value, suffix = '') {
  return `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid rgba(255,255,255,0.06);">
    <span style="width:10px;height:10px;border-radius:999px;background:${color};display:inline-block;box-shadow:0 0 0 4px ${color}22;"></span>
    <span style="flex:1;opacity:.88;">${label}</span>
    <span style="font-weight:700;color:${color};">${value}${suffix}</span>
  </div>`
}

function buildCrossPointer(color) {
  return {
    type: 'cross',
    snap: true,
    animation: false,
    lineStyle: {
      color,
      width: 1,
      type: 'dashed',
      opacity: 0.9
    },
    label: {
      show: true,
      color: '#fffdf5',
      backgroundColor: color,
      borderRadius: 999,
      padding: [6, 10]
    }
  }
}

function buildCategoryAxis(colors, data) {
  return {
    type: 'category',
    boundaryGap: false,
    data,
    axisLine: {
      lineStyle: {
        color: colors.axis
      }
    },
    axisLabel: {
      color: colors.axis,
      hideOverlap: true,
      margin: 14
    },
    axisTick: {
      show: false
    }
  }
}

function buildLineSeries({ name, data, color, width = 3, yAxisIndex = 0 }) {
  return {
    name,
    type: 'line',
    data,
    yAxisIndex,
    smooth: 0.18,
    showSymbol: false,
    symbol: 'circle',
    symbolSize: 8,
    showAllSymbol: false,
    hoverAnimation: false,
    z: 3,
    lineStyle: {
      width,
      color,
      shadowBlur: 10,
      shadowColor: `${color}44`
    },
    itemStyle: {
      color,
      borderColor: '#fff',
      borderWidth: 1.5
    },
    emphasis: {
      focus: 'series',
      scale: false,
      lineStyle: {
        width: width + 1
      },
      itemStyle: {
        borderWidth: 3,
        borderColor: '#fff',
        opacity: 1,
        shadowBlur: 16,
        shadowColor: color
      }
    },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: `${color}55` },
        { offset: 1, color: `${color}08` }
      ])
    }
  }
}

function buildHoverSeries({ data, color, yAxisIndex = 0 }) {
  return {
    name: '__hover_hit__',
    type: 'line',
    data,
    yAxisIndex,
    smooth: false,
    showSymbol: true,
    symbol: 'circle',
    symbolSize: 18,
    lineStyle: {
      width: 0,
      opacity: 0
    },
    itemStyle: {
      color,
      opacity: 0
    },
    emphasis: {
      scale: true,
      itemStyle: {
        opacity: 1,
        color,
        borderColor: '#fff',
        borderWidth: 3,
        shadowBlur: 18,
        shadowColor: color
      }
    },
    tooltip: {
      show: false
    },
    z: 6
  }
}

function getTooltipTarget(params) {
  return params.find((param) => param.seriesName !== '__hover_hit__') || params[0]
}

export function buildChartOption({ chartType, currency, theme, data }) {
  const colors = getPalette(theme)

  if (chartType === 'trend') {
    return buildTrendOption({ currency, theme, data, colors })
  }

  if (chartType === 'rate') {
    return buildRateOption({ theme, data, colors })
  }

  if (chartType === 'compare') {
    return buildCompareOption({ theme, data, colors })
  }

  return buildPriceOption({ currency, theme, data, colors })
}

function buildPriceOption({ currency, theme, data, colors }) {
  const isUSD = currency === 'USD'
  const unit = getUnitLabel(currency)
  const seriesName = isUSD ? '黄金价格 (USD)' : '黄金价格 (CNY)'
  const valueColor = isUSD ? colors.usd : colors.cny
  const seriesData = isUSD ? data.series[0]?.data || [] : data.series[1]?.data || []

  return {
    ...buildBaseOption({
      theme,
      title: `${currency} 价格走势`,
      subtext: `当前单位：${unit}`,
      legend: [seriesName]
    }),
    tooltip: buildTooltip(
      colors,
      (params) => {
        const item = getTooltipTarget(params)
        return `<div style="padding:12px 14px;background:${colors.tooltipStrip};font-weight:700;">${item.axisValue}</div>${buildTooltipRow(
          valueColor,
          seriesName,
          Number(item.value).toFixed(2),
          ` ${unit}`
        )}`
      },
      buildCrossPointer(valueColor)
    ),
    xAxis: buildCategoryAxis(colors, data.xaxis.map(formatAxisTime)),
    yAxis: [
      {
        type: 'value',
        name: unit,
        nameTextStyle: {
          color: valueColor,
          padding: [0, 0, 8, 0]
        },
        scale: true,
        min(value) {
          return createPaddedRange(value).min
        },
        max(value) {
          return createPaddedRange(value).max
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: valueColor
          }
        },
        axisLabel: {
          color: valueColor,
          formatter(value) {
            return value.toFixed(2)
          }
        },
        splitLine: {
          lineStyle: {
            color: colors.split
          }
        }
      }
    ],
    series: [
      buildLineSeries({
        name: seriesName,
        data: seriesData,
        color: valueColor
      }),
      buildHoverSeries({
        data: seriesData,
        color: valueColor
      })
    ]
  }
}

function buildTrendOption({ currency, theme, data, colors }) {
  const isUSD = currency === 'USD'
  const unit = getUnitLabel(currency)
  const sourceValues = isUSD ? data.series[0]?.data || [] : data.series[1]?.data || []
  const mainColor = isUSD ? colors.usd : colors.cny
  const seriesName = `${currency} 涨跌幅`
  const changeValues = calcChangeRate(sourceValues)

  return {
    ...buildBaseOption({
      theme,
      title: `${currency} 涨跌幅走势`,
      subtext: `价格单位：${unit}，按区间起点计算百分比变化`,
      legend: [seriesName]
    }),
    tooltip: buildTooltip(
      colors,
      (params) => {
        const item = getTooltipTarget(params)
        const rawPrice = sourceValues[item.dataIndex]
        const trendColor = Number(item.value) >= 0 ? colors.up : colors.down
        return `<div style="padding:12px 14px;background:${colors.tooltipStrip};font-weight:700;">${item.axisValue}</div>${buildTooltipRow(
          mainColor,
          '原始价格',
          Number(rawPrice).toFixed(2),
          ` ${unit}`
        )}${buildTooltipRow(
          trendColor,
          '区间涨跌',
          `${Number(item.value) >= 0 ? '+' : ''}${Number(item.value).toFixed(3)}`,
          '%'
        )}`
      },
      buildCrossPointer(mainColor)
    ),
    xAxis: buildCategoryAxis(colors, data.xaxis.map(formatAxisTime)),
    yAxis: [
      {
        type: 'value',
        name: '涨跌幅 (%)',
        nameTextStyle: {
          color: mainColor,
          padding: [0, 0, 8, 0]
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: mainColor
          }
        },
        axisLabel: {
          color: colors.axis,
          formatter(value) {
            return `${value.toFixed(2)}%`
          }
        },
        splitLine: {
          lineStyle: {
            color: colors.split,
            type: 'dashed'
          }
        }
      }
    ],
    series: [
      {
        ...buildLineSeries({
          name: seriesName,
          data: changeValues,
          color: mainColor,
          width: 4
        }),
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 0,
              lineStyle: {
                color: colors.axis,
                type: 'dashed',
                width: 1.5
              },
              label: {
                show: true,
                formatter: '0%',
                color: colors.axis,
                backgroundColor: theme === 'light' ? 'rgba(125,106,76,0.08)' : 'rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: [4, 8]
              }
            }
          ]
        }
      },
      buildHoverSeries({
        data: changeValues,
        color: mainColor
      })
    ]
  }
}

function buildRateOption({ theme, data, colors }) {
  const rateValues = data.prices.map((item) => item.exchangeRate)
  const changeValues = calcChangeRate(rateValues)

  return {
    ...buildBaseOption({
      theme,
      title: 'USD/CNY 汇率走势',
      subtext: '按区间起点计算汇率变化幅度',
      legend: ['汇率涨跌幅']
    }),
    tooltip: buildTooltip(
      colors,
      (params) => {
        const item = getTooltipTarget(params)
        const trendColor = Number(item.value) >= 0 ? colors.up : colors.down
        return `<div style="padding:12px 14px;background:${colors.tooltipStrip};font-weight:700;">${item.axisValue}</div>${buildTooltipRow(
          colors.rate,
          'USD/CNY 汇率',
          Number(rateValues[item.dataIndex]).toFixed(4)
        )}${buildTooltipRow(
          trendColor,
          '汇率涨跌',
          `${Number(item.value) >= 0 ? '+' : ''}${Number(item.value).toFixed(3)}`,
          '%'
        )}`
      },
      buildCrossPointer(colors.rate)
    ),
    xAxis: buildCategoryAxis(colors, data.xaxis.map(formatAxisTime)),
    yAxis: [
      {
        type: 'value',
        name: '汇率变化 (%)',
        nameTextStyle: {
          color: colors.rate,
          padding: [0, 0, 8, 0]
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: colors.rate
          }
        },
        axisLabel: {
          color: colors.rate,
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: {
            color: colors.split
          }
        }
      }
    ],
    series: [
      buildLineSeries({
        name: '汇率涨跌幅',
        data: changeValues,
        color: colors.rate
      }),
      buildHoverSeries({
        data: changeValues,
        color: colors.rate
      })
    ]
  }
}

function buildCompareOption({ theme, data, colors }) {
  const usdValues = data.series[0]?.data || []
  const cnyValues = data.series[1]?.data || []
  const sampleCount = Math.max(1, Math.min(12, usdValues.length))
  const step = Math.max(1, Math.floor(usdValues.length / sampleCount))
  const sampled = []

  for (let i = 0; i < sampleCount; i += 1) {
    const index = Math.min(i * step, usdValues.length - 1)
    const pointTime = new Date(data.xaxis[index])
    sampled.push({
      time: `${pointTime.getHours()}:${pointTime.getMinutes().toString().padStart(2, '0')}`,
      usd: usdValues[index],
      cny: cnyValues[index]
    })
  }

  return {
    ...buildBaseOption({
      theme,
      title: '价格对比',
      subtext: '美元按美元/盎司，人民币按元/克展示',
      legend: ['USD 价格', 'CNY 价格']
    }),
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        throttle: 30
      }
    ],
    tooltip: buildTooltip(
      colors,
      (params) =>
        `<div style="padding:12px 14px;background:${colors.tooltipStrip};font-weight:700;">${params[0].axisValue}</div>${params
          .map((item) =>
            buildTooltipRow(
              item.seriesName.includes('USD') ? colors.usd : colors.cny,
              item.seriesName,
              Number(item.value).toFixed(2),
              item.seriesName.includes('USD') ? ' 美元/盎司' : ' 元/克'
            )
          )
          .join('')}`,
      {
        type: 'shadow'
      }
    ),
    xAxis: {
      type: 'category',
      data: sampled.map((item) => item.time),
      axisLine: {
        lineStyle: {
          color: colors.axis
        }
      },
      axisLabel: {
        color: colors.axis
      },
      axisTick: {
        show: false
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '美元/盎司',
        position: 'left',
        scale: true,
        min(value) {
          return createPaddedRange(value).min
        },
        max(value) {
          return createPaddedRange(value).max
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: colors.usd
          }
        },
        axisLabel: {
          color: colors.usd
        },
        splitLine: {
          lineStyle: {
            color: colors.split
          }
        }
      },
      {
        type: 'value',
        name: '元/克',
        position: 'right',
        scale: true,
        min(value) {
          return createPaddedRange(value).min
        },
        max(value) {
          return createPaddedRange(value).max
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: colors.cny
          }
        },
        axisLabel: {
          color: colors.cny
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: 'USD 价格',
        type: 'bar',
        data: sampled.map((item) => item.usd),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.usd },
            { offset: 1, color: `${colors.usd}55` }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        barWidth: '32%'
      },
      {
        name: 'CNY 价格',
        type: 'bar',
        yAxisIndex: 1,
        data: sampled.map((item) => item.cny),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.cny },
            { offset: 1, color: `${colors.cny}55` }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        barWidth: '32%'
      }
    ]
  }
}
