# Web App

本目录是 `open-gold-system` 的前端页面，基于 `Vue 3 + Vue CLI`。

## 启动

```powershell
npm install
npm run serve
```

## 构建

```powershell
npm run build
```

## 说明

- 当前入口见 `src/main.js`
- 当前默认挂载组件是 `App.vue`
- 前端默认通过 `/api` 调用后端
- 如果要切换后端地址，可通过 `VUE_APP_API_BASE_URL` 或运行时配置文件处理
