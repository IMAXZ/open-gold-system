// API 配置优先级：
// 1. 构建时注入的 VUE_APP_API_BASE_URL
// 2. 运行时 public/config.json 中的 apiUrl 或 apiPort
// 3. 默认同源 /api

let baseURL = ''

if (process.env.VUE_APP_API_BASE_URL) {
  baseURL = process.env.VUE_APP_API_BASE_URL
} else if (typeof window !== 'undefined' && window.APP_CONFIG) {
  if (window.APP_CONFIG.apiUrl) {
    baseURL = window.APP_CONFIG.apiUrl
  } else if (window.APP_CONFIG.apiPort) {
    const currentHost = window.location.host
    const protocol = window.location.protocol
    const serverIp = currentHost.split(':')[0]
    baseURL = `${protocol}//${serverIp}:${window.APP_CONFIG.apiPort}`
  }
}

if (!baseURL && typeof window !== 'undefined') {
  baseURL = ''
}

const config = {
  baseURL,
  endpoints: {
    prices: '/api/prices'
  }
}

export default config
