import { computed, ref } from 'vue'
import axios from 'axios'
import apiConfig from '@/config/api.js'
import { buildChartData, calculateStats } from '@/utils/goldChartData'

function formatDateTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getDateTimeByOffset(offset, { endOfDay = false } = {}) {
  const date = new Date()
  date.setDate(date.getDate() - offset)

  if (endOfDay) {
    date.setHours(23, 59, 0, 0)
  } else {
    date.setHours(0, 0, 0, 0)
  }

  return formatDateTime(date)
}

export function useGoldChartData() {
  const startDate = ref('')
  const endDate = ref('')
  const loading = ref(false)
  const error = ref('')
  const selectedQuickDay = ref(0)
  const chartData = ref(null)

  const maxDateTime = computed(() => formatDateTime(new Date()))
  const stats = computed(() => calculateStats(chartData.value))

  const setDateRangeByQuickDay = (days) => {
    selectedQuickDay.value = days

    if (days === 0) {
      startDate.value = getDateTimeByOffset(0)
      endDate.value = maxDateTime.value
      return
    }

    if (days === 1) {
      startDate.value = getDateTimeByOffset(1)
      endDate.value = getDateTimeByOffset(1, { endOfDay: true })
      return
    }

    startDate.value = getDateTimeByOffset(days - 1)
    endDate.value = maxDateTime.value
  }

  const clearQuickSelection = () => {
    selectedQuickDay.value = null
  }

  const fetchData = async () => {
    if (!startDate.value || !endDate.value) {
      error.value = '请选择时间范围'
      return null
    }

    if (startDate.value > endDate.value) {
      error.value = '开始时间不能晚于结束时间'
      return null
    }

    loading.value = true
    error.value = ''

    try {
      const response = await axios.get(`${apiConfig.baseURL}${apiConfig.endpoints.prices}`, {
        params: {
          startDate: startDate.value,
          endDate: endDate.value
        }
      })

      const prices = response.data
      if (!prices || prices.length === 0) {
        chartData.value = null
        error.value = '暂无数据'
        return null
      }

      chartData.value = buildChartData(prices)
      return chartData.value
    } catch (err) {
      chartData.value = null
      error.value = `数据加载失败：${err.message || '未知错误'}`
      console.error('Fetch data error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    startDate,
    endDate,
    loading,
    error,
    selectedQuickDay,
    chartData,
    maxDateTime,
    stats,
    setDateRangeByQuickDay,
    clearQuickSelection,
    fetchData
  }
}
