# open-gold-system

`open-gold-system` 是一个黄金价格采集与展示系统的单仓库项目（monorepo）。

当前仓库包含以下部分：

- `apps/web`：Vue 3 前端页面
- `apps/mobile`：Capacitor iOS 容器工程
- `backend/java`：Spring Boot + MyBatis-Plus 后端实现
- `backend/dotnet`：ASP.NET Core 后端实现

当前默认将 `.NET` 版本视为主实现，因为它拥有更完整的测试与部署配套；`Java` 版本作为同接口能力的备选实现保留。

## 目录结构

```text
open-gold-system/
  apps/
    web/
    mobile/
  backend/
    java/
    dotnet/
  contracts/
    openapi/
  deploy/
    docker/
  docs/
  .github/workflows/
  AGENTS.md
  NuGet.Config
  README.md
```

## API 约定

前后端当前约定的核心接口如下：

- `POST /api/collect`
- `GET /api/latest`
- `GET /api/history?limit=10`
- `GET /api/prices?startDate=2026-05-29&endDate=2026-05-29`

正式契约文件见：

- [gold-price-api.yaml](/E:/2026/open-gold-system/contracts/openapi/gold-price-api.yaml)

如果修改接口行为、参数或返回结构，至少需要同步更新：

- 对应后端实现
- 前端调用逻辑
- `contracts/openapi`
- 相关文档

## 本地开发

详细说明见：

- [local-dev.md](/E:/2026/open-gold-system/docs/local-dev.md)
- [architecture.md](/E:/2026/open-gold-system/docs/architecture.md)
- [mobile-capacitor-ios.md](/E:/2026/open-gold-system/docs/mobile-capacitor-ios.md)

### 前端

```powershell
cd .\apps\web
npm install
npm run serve
```

### iOS 容器

```powershell
cd .\apps\mobile
Copy-Item .env.example .env
npm install
npm run config:write
```

后续 `ios` 原生工程的生成与调试需要在 macOS 上继续执行 `npm run ios:add`、`npm run ios:sync` 和 `npm run ios:open`。

### Java 后端

```powershell
cd .\backend\java
mvn spring-boot:run
```

### .NET 后端

```powershell
cd .\backend\dotnet
dotnet restore .\GoldCollector.DotNet.slnx --configfile ..\..\NuGet.Config
dotnet run --project .\src\GoldCollector.Api
```

默认情况下，后端监听 `41736` 端口，前端通过 `/api` 相对路径访问后端。

## Docker

当前 `deploy/docker` 中同时提供 `.NET` 和 `Java` 两套 Docker 部署方案。

```powershell
cd .\deploy\docker
Copy-Item .env.example .env
docker compose up -d --build
```

如果要运行 Java 版本：

```powershell
cd .\deploy\docker
Copy-Item .env.java.example .env.java
docker compose -f docker-compose.java.yml up -d --build
```

## 仓库整理说明

本仓库由以下两个旧仓库重新整理而来，不保留原 Git 历史：

- `gold-chart-app` -> `apps/web`
- `gold-collector` -> `backend/java` 与 `backend/dotnet`

迁移说明见 [migration-notes.md](/E:/2026/open-gold-system/docs/migration-notes.md)。
