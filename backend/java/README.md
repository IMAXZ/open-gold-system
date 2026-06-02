# Java Backend

本目录是 `open-gold-system` 的 Spring Boot 后端实现。

## 技术栈

- Spring Boot 3.2
- Spring Web / WebFlux
- MyBatis-Plus
- MySQL
- Spring Retry

## 目录

- `src/main/java`：Java 源码
- `src/main/resources`：配置与日志配置

## 启动

```powershell
mvn spring-boot:run
```

## 打包

```powershell
mvn clean package
```

## 配置

主要配置文件：

- `src/main/resources/application.yml`

持久化说明：

- 当前使用 `MyBatis-Plus` 作为数据访问层
- 实体映射见 `src/main/java/com/gold/collector/entity`
- Mapper 接口见 `src/main/java/com/gold/collector/mapper`

默认端口：

- `41736`

## API

- `POST /api/collect`
- `GET /api/latest`
- `GET /api/history?limit=10`
- `GET /api/prices?startDate=2026-05-29&endDate=2026-05-29`

如果接口发生变化，请同步检查：

- `apps/web`
- `backend/dotnet`
- `contracts/openapi`
