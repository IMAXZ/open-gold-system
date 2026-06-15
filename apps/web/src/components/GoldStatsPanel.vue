<template>
  <div v-if="items.length" class="stats-grid">
    <article
      v-for="item in items"
      :key="item.key"
      :class="[
        'stat-card',
        item.tone ? `stat-card--${item.tone}` : '',
        item.featured ? 'stat-card--featured' : '',
        item.meter ? 'stat-card--meter' : '',
        item.pairs ? 'stat-card--pairs' : '',
        item.dualValue ? 'stat-card--dual' : ''
      ]"
    >
      <div class="stat-head">
        <p class="stat-label">{{ item.label }}</p>
        <span v-if="item.badge" class="stat-badge">{{ item.badge }}</span>
      </div>

      <div v-if="item.dualValue" class="stat-dual">
        <p :class="['stat-value', item.valueClass]">
          {{ item.prefix || '' }}{{ item.value }}{{ item.suffix || '' }}
        </p>
        <p :class="['stat-subvalue', item.subValueClass || item.valueClass]">
          {{ item.subPrefix || '' }}{{ item.subValue }}{{ item.subSuffix || '' }}
        </p>
      </div>

      <p v-else-if="!item.pairs" :class="['stat-value', item.valueClass]">
        {{ item.prefix || '' }}{{ item.value }}{{ item.suffix || '' }}
      </p>

      <div v-if="item.meter" class="stat-meter">
        <div class="stat-meter__fill" :style="{ width: `${item.meter}%` }"></div>
      </div>

      <div v-if="item.pairs" class="stat-pairs">
        <div v-for="pair in item.pairs" :key="pair.label" class="stat-pair">
          <span class="stat-pair__label">{{ pair.label }}</span>
          <span :class="['stat-pair__value', pair.valueClass]">
            {{ pair.value }}{{ pair.suffix || '' }}
          </span>
        </div>
      </div>

      <p v-if="item.formula" class="stat-formula">{{ item.formula }}</p>
    </article>
  </div>
</template>

<script>
import { computed } from 'vue'
import { getUnitLabel } from '@/utils/goldChartData'

function getPriceValueClass(value, start) {
  const current = Number(value)
  const base = Number(start)

  if (current > base) {
    return 'up'
  }

  if (current < base) {
    return 'down'
  }

  return ''
}

function getSignedPrefix(value) {
  return Number(value) > 0 ? '+' : ''
}

function buildItems(chartType, currency, stats) {
  if (!stats) {
    return []
  }

  const unit = getUnitLabel(currency)
  const keyPrefix = currency === 'USD' ? 'usd' : 'cny'
  const tone = currency === 'USD' ? 'usd' : 'cny'
  const startValue = stats[`${keyPrefix}Start`]
  const endValue = stats[`${keyPrefix}End`]
  const maxValue = stats[`${keyPrefix}Max`]
  const minValue = stats[`${keyPrefix}Min`]
  const changeKey = `${keyPrefix}Change`
  const changeValueKey = `${keyPrefix}ChangeValue`
  const volatilityKey = `${keyPrefix}Volatility`
  const positionValue = Number(stats[`${keyPrefix}PositionPct`])
  const fromHighValue = Number(stats[`${keyPrefix}FromHighPct`])
  const fromLowValue = Number(stats[`${keyPrefix}FromLowPct`])
  const changePositive = stats[`${changeKey}Positive`]
  const changeClass = changePositive ? 'up' : 'down'

  return [
    {
      key: `${keyPrefix}End`,
      label: '最新价',
      value: endValue,
      tone,
      featured: true,
      badge: unit,
      valueClass: getPriceValueClass(endValue, startValue),
      formula: '最新价 = 区间最后一个采样点'
    },
    {
      key: `${keyPrefix}Max`,
      label: '最高价',
      value: maxValue,
      tone,
      valueClass: getPriceValueClass(maxValue, startValue),
      formula: '最高价 = max(区间价格)'
    },
    {
      key: `${keyPrefix}Min`,
      label: '最低价',
      value: minValue,
      tone,
      valueClass: getPriceValueClass(minValue, startValue),
      formula: '最低价 = min(区间价格)'
    },
    {
      key: `${keyPrefix}Start`,
      label: '起始价',
      value: startValue,
      tone,
      formula: '起始价 = 区间第一个采样点'
    },
    {
      key: changeKey,
      label: chartType === 'trend' ? '累计涨跌' : '区间涨跌',
      value: stats[changeValueKey],
      prefix: getSignedPrefix(stats[changeValueKey]),
      tone,
      featured: true,
      dualValue: true,
      subValue: stats[changeKey],
      subPrefix: getSignedPrefix(stats[changeKey]),
      subSuffix: '%',
      valueClass: changeClass,
      subValueClass: changeClass,
      formula: '实际值 = 最新价 - 起始价；百分比 = (最新价 - 起始价) / 起始价 × 100%'
    },
    {
      key: `${keyPrefix}RangePct`,
      label: '区间振幅',
      value: stats[volatilityKey],
      tone,
      dualValue: true,
      subValue: stats[`${keyPrefix}RangePct`],
      subSuffix: '%',
      formula: '实际值 = 最高价 - 最低价；百分比 = (最高价 - 最低价) / 最低价 × 100%'
    },
    {
      key: `${keyPrefix}PositionPct`,
      label: '区间位置',
      value: stats[`${keyPrefix}PositionPct`],
      suffix: '%',
      tone,
      meter: positionValue,
      formula: '(最新价 - 最低价) / (最高价 - 最低价)'
    },
    {
      key: `${keyPrefix}Distance`,
      label: '距高点 / 距低点',
      tone,
      pairs: [
        {
          label: '距高点',
          value: stats[`${keyPrefix}FromHighPct`],
          suffix: '%',
          valueClass: fromHighValue >= 0 ? 'up' : 'down'
        },
        {
          label: '距低点',
          value: stats[`${keyPrefix}FromLowPct`],
          suffix: '%',
          valueClass: fromLowValue >= 0 ? 'up' : 'down'
        }
      ],
      formula: '分别相对最高价、最低价计算偏离百分比'
    }
  ]
}

export default {
  name: 'GoldStatsPanel',
  props: {
    chartType: { type: String, required: true },
    currency: { type: String, required: true },
    stats: { type: Object, default: null }
  },
  setup(props) {
    const items = computed(() => buildItems(props.chartType, props.currency, props.stats))
    return { items }
  }
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 14px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  min-height: 144px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}

.stat-card--featured {
  background: linear-gradient(180deg, rgba(255, 214, 120, 0.18), rgba(255, 255, 255, 0.05));
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.14);
}

.stat-card--usd {
  background: linear-gradient(180deg, rgba(255, 204, 77, 0.12), rgba(255, 255, 255, 0.04));
}

.stat-card--cny {
  background: linear-gradient(180deg, rgba(255, 122, 89, 0.12), rgba(255, 255, 255, 0.04));
}

.stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.stat-label {
  margin: 0;
  color: rgba(255, 245, 225, 0.7);
  font-size: 12px;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  color: rgba(255, 245, 225, 0.82);
  font-size: 10px;
  white-space: nowrap;
}

.stat-dual {
  display: grid;
  gap: 6px;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  line-height: 1.05;
  color: #fff7e6;
  font-weight: 800;
}

.stat-subvalue {
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 247, 230, 0.82);
  font-weight: 700;
}

.stat-card--featured .stat-value {
  font-size: 28px;
}

.stat-card--featured .stat-subvalue {
  font-size: 15px;
}

.stat-meter {
  height: 6px;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.stat-meter__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffcf63, #ff8a5b);
}

.stat-pairs {
  display: grid;
  gap: 8px;
  margin-top: 2px;
}

.stat-pair {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stat-pair__label {
  color: rgba(255, 245, 225, 0.62);
  font-size: 11px;
}

.stat-pair__value {
  font-size: 16px;
  font-weight: 700;
  color: #fff7e6;
}

.stat-formula {
  margin: auto 0 0;
  padding-top: 10px;
  color: rgba(255, 245, 225, 0.5);
  font-size: 10px;
  line-height: 1.45;
}

.stat-value.up,
.stat-subvalue.up,
.stat-pair__value.up {
  color: #ff6b6b;
}

.stat-value.down,
.stat-subvalue.down,
.stat-pair__value.down {
  color: #38c172;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stat-card {
    min-height: 132px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-card--featured .stat-value {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
