// 构建配置脚本
// 用于在构建前准备配置文件

const fs = require('fs');
const path = require('path');

console.log('正在准备构建配置...');

// 获取环境变量中的 API 地址
const apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:41736';

console.log(`后端 API 地址：${apiBaseUrl}`);

// 创建临时配置文件（供构建时使用）
const tempConfigPath = path.resolve(__dirname, 'temp.config.json');
const configData = {
  apiUrl: apiBaseUrl
};

fs.writeFileSync(tempConfigPath, JSON.stringify(configData, null, 2), 'utf-8');
console.log('✓ 临时配置文件已创建');

console.log('开始构建...');
