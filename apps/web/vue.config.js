const { defineConfig } = require('@vue/cli-service')
const fs = require('fs')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  chainWebpack: config => {
    // 定义全局常量替换方式
    config.plugin('define').tap(args => {
      args[0]['process.env'].VUE_APP_API_BASE_URL = JSON.stringify(process.env.VUE_APP_API_BASE_URL || '')
      return args
    })
  },
  configureWebpack: (config) => {
    const { WebpackPluginHook } = require('./webpack-hook.js')
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new WebpackPluginHook((compilation) => {
          const outputDir = compilation.outputOptions.path
          let apiBaseUrl = process.env.VUE_APP_API_BASE_URL
          
          // 默认生成同源配置，适合通过 Nginx 反向代理 /api
          let configContent = {
            apiUrl: ''
          }

          if (apiBaseUrl) {
            // 如果显式配置了完整 URL，则保留该地址或端口供运行时使用
            try {
              const url = new URL(apiBaseUrl)
              const apiPort = url.port || (url.protocol === 'https:' ? '443' : '80')
              configContent = {
                apiUrl: apiBaseUrl,
                apiPort: apiPort
              }
            } catch (e) {
              console.log('无效的 API 地址格式')
            }
          }

          // 生成 config.json 配置文件
          fs.writeFileSync(
            path.join(outputDir, 'config.json'),
            JSON.stringify(configContent, null, 2),
            'utf-8'
          )
          console.log('✓ config.json 已生成')
          
          // 生成 web.config 文件
          const webConfigContent = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <!-- IIS URL 重写规则 -->
    <rewrite>
      <rules>
        <!-- Vue Router history 模式支持 -->
        <rule name="Handle History Mode and Custom 404/500" stopProcessing="true">
          <match url="^(.*)$" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" ignoreCase="false" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" ignoreCase="false" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- MIME 类型配置 -->
    <staticContent>
      <remove fileExtension=".json" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <remove fileExtension=".svg" />
      <mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
      <remove fileExtension=".woff" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <remove fileExtension=".woff2" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    
    <!-- HTTP 响应头配置 -->
    <httpProtocol>
      <customHeaders>
        <remove name="X-Powered-By" />
      </customHeaders>
    </httpProtocol>
    
    <!-- 压缩配置 -->
    <urlCompression doStaticCompression="true" doDynamicCompression="true" />
  </system.webServer>
</configuration>`
          
          fs.writeFileSync(
            path.join(outputDir, 'web.config'),
            webConfigContent,
            'utf-8'
          )
          console.log('✓ web.config 已生成')
          console.log(`✓ 后端地址：${apiBaseUrl}`)
        })
      )
    }
  }
})
