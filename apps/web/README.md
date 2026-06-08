# Web App

该目录是 `open-gold-system` 的前端页面，基于 `Vue 3 + Vue CLI`。

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
- 默认挂载组件是 `App.vue`
- 前端默认通过 `/api` 调用后端
- 如果需要切换后端地址，可通过 `VUE_APP_API_BASE_URL` 或运行时 `public/config.json` 处理
- 当前页面已补充 Capacitor 容器运行时入口，可在 iOS 容器中显示“分享当前页”和“Safari 打开”
