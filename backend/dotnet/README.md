# .NET Backend

本目录是 `open-gold-system` 的 ASP.NET Core 后端实现，也是当前默认主实现。

## 技术栈

- ASP.NET Core Web API
- Quartz
- Dapper
- MySqlConnector
- Serilog

## 目录

- `src/GoldCollector.Api`：主服务
- `tests/GoldCollector.Tests`：测试项目

## 本地运行

```powershell
dotnet restore .\GoldCollector.DotNet.slnx --configfile ..\..\NuGet.Config
dotnet run --project .\src\GoldCollector.Api
```

## 测试

```powershell
dotnet test .\GoldCollector.DotNet.slnx
```

## 配置

主要配置文件：

- `src/GoldCollector.Api/appsettings.json`

常用环境变量：

- `ConnectionStrings__GoldDb`
- `Gold__Enabled`
- `Gold__Api__BaseUrl`
- `Gold__Api__TimeoutMs`
- `Gold__ExchangeRate__Default`
- `Collector__Cron`
- `Cors__AllowedOrigins__0`

## API

- `POST /api/collect`
- `GET /api/latest`
- `GET /api/history?limit=10`
- `GET /api/prices?startDate=2026-05-29&endDate=2026-05-29`

## Docker

当前对应的部署文件位于：

- `../../deploy/docker/Dockerfile`
- `../../deploy/docker/docker-compose.yml`
- `../../deploy/docker/.env.example`

如果接口发生变化，请同步检查：

- `apps/web`
- `backend/java`
- `contracts/openapi`
