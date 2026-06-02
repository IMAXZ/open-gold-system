<template>
  <div class="gold-chart-scene" :class="{ 'light-theme': theme === 'light' }">
    <div class="scene-glow scene-glow--left"></div>
    <div class="scene-glow scene-glow--right"></div>

    <GoldChartToolbar
      :chart-type="chartType"
      :currency="currency"
      :end-date="endDate"
      :granularity="granularity"
      :loading="loading"
      :selected-quick-day="selectedQuickDay"
      :start-date="startDate"
      :theme="theme"
      :today="today"
      :unit-label="unitLabel"
      @date-change="clearQuickSelection"
      @fetch="loadData"
      @select-quick-day="handleQuickDaySelection"
      @switch-chart-type="switchChartType"
      @switch-currency="switchCurrency"
      @switch-granularity="switchGranularity"
      @toggle-theme="toggleTheme"
      @update:end-date="endDate = $event"
      @update:start-date="startDate = $event"
    />

    <section class="chart-panel">
      <div class="chart-panel__meta">
        <div>
          <p class="chart-panel__label">Current View</p>
          <h2 class="chart-panel__title">{{ chartTitle }}</h2>
        </div>
        <div class="chart-panel__badge">{{ unitLabel }}</div>
      </div>

      <div class="chart-wrapper">
        <div ref="chartRef" class="chart"></div>

        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>数据加载中...</p>
        </div>

        <div v-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="loadData">重新加载</button>
        </div>
      </div>
    </section>

    <GoldStatsPanel :chart-type="chartType" :currency="currency" :stats="stats" />
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import GoldChartToolbar from '@/components/GoldChartToolbar.vue'
import GoldStatsPanel from '@/components/GoldStatsPanel.vue'
import { UNIT_LABELS } from '@/constants/goldChart'
import { useGoldChartData } from '@/composables/useGoldChartData'
import { aggregateChartData } from '@/utils/goldChartData'
import { buildChartOption } from '@/utils/goldChartOptions'

const CHART_TITLES = {
  price: '价格走势',
  trend: '涨跌幅趋势',
  rate: '汇率变化',
  compare: '双币种对比'
}

export default {
  name: 'GoldChart',
  components: {
    GoldChartToolbar,
    GoldStatsPanel
  },
  setup() {
    const chartRef = ref(null)
    const chartInstance = ref(null)
    const chartType = ref('price')
    const currency = ref('CNY')
    const theme = ref('dark')
    const granularity = ref(1)

    const {
      chartData,
      clearQuickSelection,
      endDate,
      error,
      fetchData,
      loading,
      selectedQuickDay,
      setDateRangeByQuickDay,
      startDate,
      stats,
      today
    } = useGoldChartData()

    const displayData = computed(() => aggregateChartData(chartData.value, granularity.value))
    const unitLabel = computed(() => UNIT_LABELS[currency.value] || UNIT_LABELS.CNY)
    const chartTitle = computed(() => CHART_TITLES[chartType.value] || CHART_TITLES.price)

    const renderChart = () => {
      if (!chartInstance.value || !displayData.value) {
        return
      }

      chartInstance.value.setOption(
        buildChartOption({
          chartType: chartType.value,
          currency: currency.value,
          theme: theme.value,
          data: displayData.value
        }),
        true
      )
    }

    const syncThemeToBody = () => {
      document.body.classList.toggle('gold-dashboard-light', theme.value === 'light')
      document.body.classList.toggle('gold-dashboard-dark', theme.value === 'dark')
    }

    const loadData = async () => {
      const data = await fetchData()
      if (data) {
        renderChart()
      } else {
        chartInstance.value?.clear()
      }
    }

    const handleResize = () => {
      chartInstance.value?.resize()
    }

    const handleQuickDaySelection = async (days) => {
      setDateRangeByQuickDay(days)
      await loadData()
    }

    const switchChartType = (nextType) => {
      chartType.value = nextType
      renderChart()
    }

    const switchCurrency = (nextCurrency) => {
      currency.value = nextCurrency
      renderChart()
    }

    const switchGranularity = (minutes) => {
      granularity.value = minutes
      renderChart()
    }

    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
      syncThemeToBody()
      renderChart()
    }

    watch(displayData, () => {
      renderChart()
    })

    onMounted(async () => {
      if (chartRef.value) {
        chartInstance.value = echarts.init(chartRef.value)
        window.addEventListener('resize', handleResize)
      }

      syncThemeToBody()
      await handleQuickDaySelection(0)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      document.body.classList.remove('gold-dashboard-light', 'gold-dashboard-dark')
      chartInstance.value?.dispose()
    })

    return {
      chartRef,
      chartTitle,
      chartType,
      clearQuickSelection,
      currency,
      endDate,
      error,
      granularity,
      handleQuickDaySelection,
      loadData,
      loading,
      selectedQuickDay,
      startDate,
      stats,
      switchChartType,
      switchCurrency,
      switchGranularity,
      theme,
      today,
      toggleTheme,
      unitLabel
    }
  }
}
</script>

<style scoped>
.gold-chart-scene {
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 0 28px;
}

.scene-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.8;
}

.scene-glow--left {
  top: 40px;
  left: -60px;
  width: 220px;
  height: 220px;
  background: rgba(255, 184, 0, 0.18);
}

.scene-glow--right {
  right: -40px;
  top: 220px;
  width: 260px;
  height: 260px;
  background: rgba(255, 94, 98, 0.16);
}

.chart-panel {
  position: relative;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(13, 18, 30, 0.92), rgba(9, 14, 24, 0.88));
  box-shadow: 0 28px 64px rgba(2, 6, 23, 0.38);
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.chart-panel__meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.chart-panel__label {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 236, 194, 0.62);
}

.chart-panel__title {
  margin: 0;
  color: #fff7e6;
  font-size: 24px;
}

.chart-panel__badge {
  min-width: 108px;
  padding: 10px 16px;
  border-radius: 999px;
  text-align: center;
  color: #fff1d1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.chart-wrapper {
  position: relative;
  min-height: 480px;
  padding: 18px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
    rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.25s ease, border-color 0.25s ease;
}

.chart {
  width: 100%;
  height: 480px;
}

.loading-overlay,
.error-message {
  position: absolute;
  inset: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-radius: 20px;
  text-align: center;
}

.loading-overlay {
  background: rgba(11, 15, 25, 0.82);
  color: #fff1d1;
  backdrop-filter: blur(10px);
}

.error-message {
  background: rgba(26, 12, 12, 0.84);
  color: #ffd9d6;
}

.spinner {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 3px solid rgba(255, 196, 80, 0.18);
  border-top-color: #ffcf63;
  animation: spin 1s linear infinite;
}

.error-message button {
  padding: 10px 16px;
  border: 0;
  border-radius: 14px;
  background: #ff7a59;
  color: #fff;
  cursor: pointer;
}

.light-theme .chart-panel {
  border-color: rgba(170, 130, 40, 0.18);
  background: linear-gradient(180deg, rgba(255, 252, 245, 0.96), rgba(249, 243, 228, 0.94));
  box-shadow: 0 24px 60px rgba(123, 96, 38, 0.16);
}

.light-theme .chart-panel__label {
  color: rgba(92, 65, 0, 0.82);
}

.light-theme .chart-panel__title {
  color: #5c4100;
}

.light-theme .chart-panel__badge {
  color: #3f2b06;
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(170, 130, 40, 0.26);
}

.light-theme .chart-wrapper {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.52));
  border-color: rgba(170, 130, 40, 0.12);
}

.light-theme .loading-overlay {
  background: rgba(255, 250, 240, 0.88);
  color: #5a4208;
}

.light-theme .spinner {
  border-color: rgba(212, 154, 31, 0.18);
  border-top-color: #d49a1f;
}

.light-theme :deep(.toolbar-shell) {
  border-color: rgba(170, 130, 40, 0.18);
  background:
    radial-gradient(circle at top left, rgba(255, 187, 0, 0.12), transparent 28%),
    radial-gradient(circle at bottom right, rgba(244, 63, 94, 0.1), transparent 24%),
    linear-gradient(180deg, rgba(255, 250, 240, 0.96), rgba(250, 245, 232, 0.94));
  box-shadow: 0 24px 60px rgba(123, 96, 38, 0.16);
}

.light-theme :deep(.title) {
  color: #5c4100;
}

.light-theme :deep(.subtitle),
.light-theme :deep(.date-field span),
.light-theme :deep(.section-label),
.light-theme :deep(.card-title),
.light-theme :deep(.stat-label),
.light-theme :deep(.stat-helper) {
  color: rgba(58, 40, 8, 0.88);
}

.light-theme :deep(.unit-pill),
.light-theme :deep(.theme-button),
.light-theme :deep(.segmented-button),
.light-theme :deep(.chip-button),
.light-theme :deep(.glass-card) {
  color: #3c2906;
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(170, 130, 40, 0.24);
}

.light-theme :deep(.date-field input) {
  background: rgba(255, 255, 255, 0.98);
  color: #2f2108;
  border-color: rgba(170, 130, 40, 0.26);
}

.light-theme :deep(.unit-pill),
.light-theme :deep(.theme-button),
.light-theme :deep(.segmented-button),
.light-theme :deep(.chip-button) {
  font-weight: 600;
}

.light-theme :deep(.theme-icon),
.light-theme :deep(.segmented-icon) {
  background: rgba(92, 65, 0, 0.12);
  color: #5c4100;
}

.light-theme :deep(.query-button) {
  color: #341f00;
  box-shadow: 0 10px 24px rgba(255, 138, 91, 0.16);
}

.light-theme :deep(.stat-card) {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(170, 130, 40, 0.2);
}

.light-theme :deep(.stat-card--usd) {
  background: linear-gradient(180deg, rgba(255, 214, 120, 0.38), rgba(255, 255, 255, 0.96));
}

.light-theme :deep(.stat-card--cny) {
  background: linear-gradient(180deg, rgba(255, 167, 136, 0.34), rgba(255, 255, 255, 0.96));
}

.light-theme :deep(.stat-card--rate) {
  background: linear-gradient(180deg, rgba(133, 226, 238, 0.34), rgba(255, 255, 255, 0.96));
}

.light-theme :deep(.stat-value) {
  color: #2f2108;
}

.light-theme :deep(.stat-value.up) {
  color: #c53030;
}

.light-theme :deep(.stat-value.down) {
  color: #2f855a;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .chart-panel {
    padding: 16px;
    border-radius: 22px;
  }

  .chart-wrapper {
    min-height: 320px;
    padding: 10px;
  }

  .chart {
    height: 320px;
  }

  .chart-panel__meta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .chart {
    height: 280px;
  }

  .chart-wrapper {
    min-height: 280px;
  }
}
</style>
