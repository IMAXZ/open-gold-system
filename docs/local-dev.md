# 本地开发说明

## 环境要求

- Node.js：用于前端开发
- JDK 17+：用于 Java 后端
- Maven 3.8+：用于 Java 后端构建
- .NET SDK 10：用于 .NET 后端构建与运行
- MySQL 8+：用于后端数据存储

## 推荐开发方式

日常开发建议优先使用 `.NET` 后端：

1. 启动 MySQL
2. 启动 `.NET` 后端
3. 启动前端页面

如需对照另一套实现，再切换到 `Java` 后端。

## 前端

```powershell
cd .\apps\web
npm install
npm run serve
```

说明：

- 当前入口见 [apps/web/src/main.js](/E:/2026/05/open-gold-system/apps/web/src/main.js)
- 当前默认挂载的是 `App.vue`
- 前端默认使用相对路径 `/api` 访问后端
- 本地联调可直接修改 [apps/web/public/config.json](/E:/2026/05/open-gold-system/apps/web/public/config.json)
- 如果后端跑在本机 `41736`，当前默认配置已经可直接使用

## Java 后端

```powershell
cd .\backend\java
mvn spring-boot:run
```

配置文件：

- [backend/java/src/main/resources/application.yml](/E:/2026/05/open-gold-system/backend/java/src/main/resources/application.yml)

默认端口：

- `41736`

## .NET 后端

```powershell
cd .\backend\dotnet
dotnet restore .\GoldCollector.DotNet.slnx --configfile ..\..\NuGet.Config
dotnet run --project .\src\GoldCollector.Api
```

配置文件：

- [backend/dotnet/src/GoldCollector.Api/appsettings.json](/E:/2026/05/open-gold-system/backend/dotnet/src/GoldCollector.Api/appsettings.json)

默认端口：

- `41736`

## Docker

当前 Docker 部署同时提供 `.NET` 和 `Java` 两套方案。

```powershell
cd .\deploy\docker
Copy-Item .env.example .env
docker compose up -d --build
```

Java 版本：

```powershell
cd .\deploy\docker
Copy-Item .env.java.example .env.java
docker compose -f docker-compose.java.yml up -d --build
```

相关文件：

- [deploy/docker/Dockerfile](/E:/2026/05/open-gold-system/deploy/docker/Dockerfile)
- [deploy/docker/docker-compose.yml](/E:/2026/05/open-gold-system/deploy/docker/docker-compose.yml)
- [deploy/docker/.env.example](/E:/2026/05/open-gold-system/deploy/docker/.env.example)
- [deploy/docker/Dockerfile.java](/E:/2026/05/open-gold-system/deploy/docker/Dockerfile.java)
- [deploy/docker/docker-compose.java.yml](/E:/2026/05/open-gold-system/deploy/docker/docker-compose.java.yml)
- [deploy/docker/.env.java.example](/E:/2026/05/open-gold-system/deploy/docker/.env.java.example)
