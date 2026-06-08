# Capacitor iOS 实施说明

本文档对应仓库中的 `apps/mobile`，用于把现有 `apps/web` 以 `Capacitor` 的方式封装成内部自用的 iOS App。

## 方案前提

- 仅做 `iOS`
- 站点使用远程地址加载
- 当前支持 `http://IP:端口`
- 仅内部自用，不按 App Store 上架标准设计

## 目录说明

- `apps/mobile`：Capacitor 壳工程
- `apps/mobile/web`：本地兜底页，只用于远程站点不可达时展示
- `apps/mobile/scripts/write-capacitor-config.mjs`：根据 `.env` 生成 `capacitor.config.json`
- `apps/mobile/scripts/apply-ios-http-config.mjs`：在原生工程存在时注入 iOS 的 `ATS` 配置
- `apps/mobile/assets`：图标与启动页素材源文件

## 初始化步骤

```powershell
cd .\apps\mobile
Copy-Item .env.example .env
npm install
npm run ios:add
npm run ios:sync
```

如果当前机器不是 macOS：

- 可以先完成 `npm install`
- 将仓库交给 macOS 环境继续执行 `npm run ios:add`
- 然后再次执行 `npm run ios:sync`

## 环境变量

`.env` 中至少需要配置：

```text
CAPACITOR_SERVER_URL=http://192.168.1.10:41736
CAPACITOR_APP_ID=com.opengold.mobile
CAPACITOR_APP_NAME=Open Gold
```

说明：

- `CAPACITOR_SERVER_URL` 写入到 `capacitor.config.json` 的 `server.url`
- 如果后端 `IP` 或端口变化，必须重新执行 `npm run ios:sync`
- 当前方案不建议频繁变更地址

## iOS 相关说明

### 1. ATS / HTTP

当前方案使用 `http://IP:端口`，因此在 iOS 中需要允许 `WKWebView` 加载非 HTTPS 内容。

仓库脚本会向 `Info.plist` 注入：

- `NSAppTransportSecurity`
- `NSAllowsArbitraryLoadsInWebContent = true`

该配置只放开 Web 内容加载，不代表可以在原生层任意新增 HTTP 网络请求。

### 2. 图标与启动页

仓库已提供设计源文件：

- `apps/mobile/assets/app-icon.svg`
- `apps/mobile/assets/launch-mark.svg`

在 Xcode 中需要手动完成：

- App Icon 资源导入
- Launch Screen 背景与标识配置
- 签名、Bundle ID、版本号

### 3. 分享与 Safari 打开

当前 Web 页面已经增加运行时桥接：

- 在 Capacitor 容器中可显示分享入口
- 可调用系统浏览器打开当前链接
- 如果原生桥不可用，会退化为浏览器原生分享或复制链接

## 验收建议

至少验证以下内容：

- 冷启动能进入远程站点
- 断网后会落到本地兜底页
- 分享按钮可正常触发
- Safari 打开当前页可用
- iPhone 小屏下无明显遮挡
- 图表渲染、日期筛选、币种切换正常

## 已知限制

- 当前仓库运行环境为 Windows，无法直接在本机生成和调试 Xcode 工程
- 由于使用 `http://IP:端口`，本方案不适合作为公开上架版本
- 如果远程站点或原生桥接策略变化，分享入口可能需要在真机上再次验证
