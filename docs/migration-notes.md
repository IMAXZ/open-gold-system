# 仓库迁移说明

## 迁移目标

将原来的前端仓库与后端仓库整理为一个单仓库项目，统一命名为 `open-gold-system`。

## 来源映射

- 原仓库 `gold-chart-app` 迁移到 `apps/web`
- 原仓库 `gold-collector` 中的 Java 实现迁移到 `backend/java`
- 原仓库 `gold-collector/dotnet` 迁移到 `backend/dotnet`

## 当前整理结果

- 已建立新的单仓库目录骨架
- 已迁移前端、Java 后端、.NET 后端源码
- 已将 Docker 部署文件迁移到 `deploy/docker`
- 已补充根目录文档与项目级 `AGENTS.md`
- 已将前端多版本页面收敛为单套正式实现
- 已补充共享 OpenAPI 契约与 GitHub Actions CI

## 当前已知后续事项

- Java 与 .NET 的部分源码历史上存在过编码污染，后续如果继续维护老文件，建议逐步统一到 UTF-8
