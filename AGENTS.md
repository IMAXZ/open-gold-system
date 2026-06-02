# open-gold-system 项目协作规范

本文件用于补充仓库级约束，和全局 `AGENTS.md` 一起使用。

## 项目简介

这是一个黄金价格采集与展示系统的单仓库项目，包含：

- 一个 `Vue 3` 前端展示页面
- 一个 `Spring Boot` 后端实现
- 一个 `ASP.NET Core` 后端实现

两个后端实现目标上应保持相同的业务能力和接口语义。

## 目录约定

- `apps/web`：前端页面
- `backend/java`：Java 后端
- `backend/dotnet`：.NET 后端
- `contracts/openapi`：共享接口契约
- `deploy/docker`：Docker 部署文件
- `docs`：架构、开发、迁移文档

## 当前默认实现

- 默认主实现：`backend/dotnet`
- 备选实现：`backend/java`

如果新增后端能力，优先确保 `.NET` 实现完整可用；如果该能力也要求在 `Java` 版本中存在，需要同步补齐。

## 开发约束

- 优先保持单仓库结构清晰，不要把跨技术栈公共说明散落到各子目录
- 修改 API 时，必须检查前端、`.NET`、`Java` 三方是否一致
- 如果接口发生变化，必须同步更新 `contracts/openapi` 和相关文档
- 前端默认只保留一套正式实现，不保留并行的 `Final`、`Refactor`、`Temp` 页面变体
- 修改 Docker 部署相关内容时，必须同时检查 `.NET` 与 `Java` 两套部署文件是否仍然一致可用
- 不要在“整理仓库”的提交中混入大规模业务重构
- 优先修正路径、配置、文档、构建入口这类结构性问题

## 本地运行命令

### 前端

```powershell
cd .\apps\web
npm install
npm run serve
```

### Java

```powershell
cd .\backend\java
mvn spring-boot:run
```

### .NET

```powershell
cd .\backend\dotnet
dotnet restore .\GoldCollector.DotNet.slnx --configfile ..\..\NuGet.Config
dotnet run --project .\src\GoldCollector.Api
```

## 最小验证要求

涉及仓库结构、路径、部署文件或文档变更时，至少检查：

- 目录结构是否符合约定
- 启动命令和文档路径是否仍然正确
- Docker 构建路径是否仍然有效
- `.gitignore` 是否覆盖新增产物目录

涉及接口或业务逻辑变更时，应尽可能补充或更新自动化测试。
