<template>
  <div class="toolbar-shell">
    <div class="toolbar-top">
      <div class="toolbar-top__group">
        <div class="section-label section-label--inline">币种切换</div>
        <div class="option-row option-row--currency">
          <button
            v-for="option in currencyOptions"
            :key="option.value"
            :class="['segmented-button', { active: currency === option.value }]"
            @click="$emit('switch-currency', option.value)"
          >
            <span class="segmented-icon">{{ option.icon }}</span>
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>

      <div class="toolbar-actions">
        <div class="unit-pill">
          <span class="unit-dot"></span>
          <span>{{ unitLabel }}</span>
        </div>
        <button class="theme-button" @click="$emit('toggle-theme')">
          <span class="theme-icon">{{ theme === 'dark' ? '日' : '夜' }}</span>
          {{ theme === 'dark' ? '浅色' : '深色' }}
        </button>
      </div>
    </div>

    <div class="section-label">图表模式</div>
    <div class="option-row option-row--chart">
      <button
        v-for="option in chartTypeOptions"
        :key="option.value"
        :class="['segmented-button segmented-button--chart', { active: chartType === option.value }]"
        @click="$emit('switch-chart-type', option.value)"
      >
        <span class="segmented-icon">{{ option.icon }}</span>
        <span>{{ option.label }}</span>
      </button>
    </div>

    <div class="controls-grid">
      <div class="glass-card">
        <div class="card-title">时间范围</div>
        <div class="date-grid">
          <label class="date-field">
            <span>开始时间</span>
            <div class="date-time-row">
              <input
                type="date"
                :value="startDatePart"
                :max="maxDatePart"
                @input="updateStartDate($event.target.value)"
                @change="$emit('date-change')"
              />
              <input
                type="time"
                step="60"
                :value="startTimePart"
                :max="startTimeMax"
                @input="updateStartTime($event.target.value)"
                @change="$emit('date-change')"
              />
            </div>
          </label>

          <label class="date-field">
            <span>结束时间</span>
            <div class="date-time-row">
              <input
                type="date"
                :value="endDatePart"
                :max="maxDatePart"
                @input="updateEndDate($event.target.value)"
                @change="$emit('date-change')"
              />
              <input
                type="time"
                step="60"
                :value="endTimePart"
                :max="endTimeMax"
                @input="updateEndTime($event.target.value)"
                @change="$emit('date-change')"
              />
            </div>
          </label>
        </div>

        <button class="query-button" :disabled="loading" @click="$emit('fetch')">
          {{ loading ? '加载中...' : '刷新图表' }}
        </button>
      </div>

      <div class="glass-card">
        <div class="card-title">快捷区间</div>
        <div class="chip-row">
          <button
            v-for="day in quickDays"
            :key="day.value"
            :class="['chip-button', { active: selectedQuickDay === day.value }]"
            @click="$emit('select-quick-day', day.value)"
          >
            {{ day.label }}
          </button>
        </div>
      </div>

      <div class="glass-card">
        <div class="card-title">数据粒度</div>
        <div class="chip-row">
          <button
            v-for="option in granularityOptions"
            :key="option.value"
            :class="['chip-button chip-button--soft', { active: granularity === option.value }]"
            @click="$emit('switch-granularity', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import {
  CHART_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  GRANULARITY_OPTIONS,
  QUICK_DAYS
} from '@/constants/goldChart'

function splitDateTime(value) {
  if (!value) {
    return { date: '', time: '00:00' }
  }

  const [datePart = '', timePart = '00:00'] = value.split('T')
  return {
    date: datePart,
    time: timePart.slice(0, 5) || '00:00'
  }
}

function mergeDateTime(datePart, timePart) {
  if (!datePart) {
    return ''
  }

  return `${datePart}T${timePart || '00:00'}`
}

export default {
  name: 'GoldChartToolbar',
  props: {
    chartType: { type: String, required: true },
    currency: { type: String, required: true },
    endDate: { type: String, required: true },
    granularity: { type: Number, required: true },
    loading: { type: Boolean, required: true },
    maxDateTime: { type: String, required: true },
    selectedQuickDay: { type: Number, default: null },
    startDate: { type: String, required: true },
    theme: { type: String, required: true },
    unitLabel: { type: String, required: true }
  },
  emits: [
    'date-change',
    'fetch',
    'select-quick-day',
    'switch-chart-type',
    'switch-currency',
    'switch-granularity',
    'toggle-theme',
    'update:end-date',
    'update:start-date'
  ],
  setup(props, { emit }) {
    const maxDateTimeParts = computed(() => splitDateTime(props.maxDateTime))
    const startParts = computed(() => splitDateTime(props.startDate))
    const endParts = computed(() => splitDateTime(props.endDate))

    const maxDatePart = computed(() => maxDateTimeParts.value.date)
    const maxTimePart = computed(() => maxDateTimeParts.value.time)

    const startDatePart = computed(() => startParts.value.date)
    const startTimePart = computed(() => startParts.value.time)
    const endDatePart = computed(() => endParts.value.date)
    const endTimePart = computed(() => endParts.value.time)

    const startTimeMax = computed(() =>
      startDatePart.value === maxDatePart.value ? maxTimePart.value : '23:59')
    const endTimeMax = computed(() =>
      endDatePart.value === maxDatePart.value ? maxTimePart.value : '23:59')

    const updateStartDate = (datePart) => {
      emit('update:start-date', mergeDateTime(datePart, startTimePart.value))
    }

    const updateStartTime = (timePart) => {
      emit('update:start-date', mergeDateTime(startDatePart.value, timePart))
    }

    const updateEndDate = (datePart) => {
      emit('update:end-date', mergeDateTime(datePart, endTimePart.value))
    }

    const updateEndTime = (timePart) => {
      emit('update:end-date', mergeDateTime(endDatePart.value, timePart))
    }

    return {
      chartTypeOptions: CHART_TYPE_OPTIONS,
      currencyOptions: CURRENCY_OPTIONS,
      granularityOptions: GRANULARITY_OPTIONS,
      quickDays: QUICK_DAYS,
      maxDatePart,
      startDatePart,
      startTimePart,
      endDatePart,
      endTimePart,
      startTimeMax,
      endTimeMax,
      updateStartDate,
      updateStartTime,
      updateEndDate,
      updateEndTime
    }
  }
}
</script>

<style scoped>
.toolbar-shell {
  margin-bottom: 14px;
  padding: 18px 20px 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(255, 187, 0, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(244, 63, 94, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(18, 24, 39, 0.92), rgba(12, 18, 31, 0.88));
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.35);
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.toolbar-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.toolbar-top__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.unit-pill,
.theme-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  color: #fff3da;
  backdrop-filter: blur(16px);
}

.unit-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd86f, #ff8c5a);
  box-shadow: 0 0 18px rgba(255, 184, 0, 0.55);
}

.theme-button {
  cursor: pointer;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

.theme-button:hover,
.segmented-button:hover,
.chip-button:hover,
.query-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(255, 196, 80, 0.45);
}

.theme-icon,
.segmented-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
  font-weight: 700;
}

.section-label,
.card-title {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 236, 194, 0.72);
}

.section-label {
  margin-bottom: 8px;
}

.section-label--inline {
  margin-bottom: 0;
}

.card-title {
  margin-bottom: 12px;
}

.option-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.option-row--currency {
  margin-bottom: 0;
}

.option-row--chart {
  margin-bottom: 16px;
}

.segmented-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 248, 235, 0.8);
  cursor: pointer;
  transition: transform 0.22s ease, border-color 0.22s ease;
}

.segmented-button.active {
  background: linear-gradient(135deg, rgba(255, 210, 107, 0.24), rgba(255, 122, 89, 0.22));
  border-color: rgba(255, 196, 80, 0.6);
  color: #fff8eb;
}

.segmented-button--chart {
  min-width: 132px;
}

.controls-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 12px;
}

.glass-card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.25s ease, border-color 0.25s ease;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.date-field span {
  display: block;
  margin-bottom: 6px;
  color: rgba(255, 245, 225, 0.72);
  font-size: 12px;
}

.date-time-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(96px, 0.9fr);
  gap: 8px;
}

.date-field input {
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(5, 10, 20, 0.28);
  color: #fff;
  outline: none;
}

.query-button {
  width: 100%;
  min-height: 42px;
  border: 1px solid rgba(255, 196, 80, 0.36);
  border-radius: 14px;
  background: linear-gradient(135deg, #ffcf63, #ff8a5b);
  color: #2f1800;
  font-weight: 800;
  cursor: pointer;
}

.query-button:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-button {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 248, 235, 0.82);
  cursor: pointer;
}

.chip-button--soft {
  border-radius: 14px;
}

.chip-button.active {
  background: linear-gradient(135deg, rgba(255, 212, 115, 0.22), rgba(69, 208, 227, 0.18));
  border-color: rgba(255, 212, 115, 0.58);
  color: #fff8eb;
}

@media (max-width: 1024px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-top {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .toolbar-shell {
    padding: 16px;
    border-radius: 22px;
  }

  .date-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .toolbar-shell {
    padding: 14px;
  }

  .date-time-row {
    grid-template-columns: 1fr;
  }

  .segmented-button,
  .query-button,
  .theme-button,
  .unit-pill {
    width: 100%;
    justify-content: center;
  }

  .segmented-button--chart {
    min-width: 0;
    flex: 1 1 100%;
  }
}
</style>
