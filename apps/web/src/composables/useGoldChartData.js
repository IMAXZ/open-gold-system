import { computed, ref } from 'vue'
import axios from 'axios'
import apiConfig from '@/config/api.js'
import { buildChartData, calculateStats } from '@/utils/goldChartData'

export function useGoldChartData() {
  const startDate = ref('')
  const endDate = ref('')
  const loading = ref(false)
  const error = ref('')
  const selectedQuickDay = ref(0)
  const chartData = ref(null)

  const today = computed(() => new Date().toISOString().split('T')[0])
  const stats = computed(() => calculateStats(chartData.value))

  const formatDate = (date) => date.toISOString().split('T')[0]

  const getDateByOffset = (offset) => {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    return formatDate(date)
  }

  const setDateRangeByQuickDay = (days) => {
    selectedQuickDay.value = days

    if (days === 0) {
      startDate.value = today.value
      endDate.value = today.value
      return
    }

    if (days === 1) {
      startDate.value = getDateByOffset(1)
      endDate.value = getDateByOffset(1)
      return
    }

    startDate.value = getDateByOffset(days - 1)
    endDate.value = today.value
  }

  const clearQuickSelection = () => {
    selectedQuickDay.value = null
  }

  const fetchData = async () => {
    if (!startDate.value || !endDate.value) {
      error.value = '请选择日期范围'
      return null
    }

    if (startDate.value > endDate.value) {
      error.value = '开始日期不能晚于结束日期'
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
    today,
    stats,
    setDateRangeByQuickDay,
    clearQuickSelection,
    fetchData
  }
}
