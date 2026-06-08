# Mobile App

`apps/mobile` 是 `open-gold-system` 的 `Capacitor + iOS` 容器工程。

当前实现按以下前提设计：

- 只做 `iOS`
- 远程加载站点
- 使用 `http://IP:端口`
- 仅内部自用，不以 App Store 上架为目标

## 环境变量

复制 `.env.example` 为 `.env`，然后修改：

```powershell
Copy-Item .env.example .env
```

- `CAPACITOR_SERVER_URL`：iPhone 要加载的远程站点地址
- `CAPACITOR_APP_ID`：iOS Bundle Identifier
- `CAPACITOR_APP_NAME`：App 显示名称

## 常用命令

```powershell
npm install
npm run config:write
npm run ios:add
npm run ios:sync
npm run ios:open
```

说明：

- `config:write` 会根据 `.env` 生成 `capacitor.config.json`
- `ios:add` 会生成 `ios` 原生工程
- `ios:sync` 会同步插件和 Web 兜底页，并注入 iOS 的 HTTP/ATS 例外配置
- `ios:open` 会在 macOS 上打开 Xcode 工程

## 当前能力

- 远程站点直接加载
- 本地错误兜底页 `web/unavailable.html`
- Web 内调用 Capacitor Share / Browser
- iOS `NSAllowsArbitraryLoadsInWebContent` 注入脚本

## 注意事项

- 当前地址是写入壳配置的，后端 `IP` 或端口变化后需要重新执行 `npm run ios:sync`
- 由于使用的是 `http://IP:端口`，本方案只适合内部自用
- `ios` 原生工程目录不会预先提交占位内容，执行 `npm run ios:add` 后才会生成
