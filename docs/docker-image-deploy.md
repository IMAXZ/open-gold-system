# Docker 镜像部署脚本

仓库里新增了一份本地执行的 PowerShell 脚本，用来完成下面这套流程：

1. 本地 `docker build`
2. 本地 `docker save`
3. 通过 `scp` 上传到 Linux 服务器
4. 远端 `docker load`
5. 删除旧容器并重新启动新容器

脚本位置：

- [deploy/scripts/deploy-dotnet-image.ps1](/E:/2026/open-gold-system/deploy/scripts/deploy-dotnet-image.ps1)

## 默认行为

脚本默认针对当前仓库的 `.NET` 后端：

- Dockerfile：`deploy/docker/Dockerfile`
- 镜像名：`open-gold-system-dotnet:latest`
- 容器名：`gold-collector-dotnet`
- 端口：`41736`
- 远端目录：`/usr/app/gold-collector`

脚本会假定服务器上已经准备好：

- `docker`
- 容器运行所需的环境变量文件 `/usr/app/gold-collector/.env`

## 最常用命令

如果你已经配置好了 SSH，最常用的是：

```powershell
.\deploy\scripts\deploy-dotnet-image.ps1 `
  -ServerHost 你的服务器IP `
  -User root `
  -TargetDir /usr/app/gold-collector
```

如果服务器是 ARM，例如 `linux/arm64`，可以这样：

```powershell
.\deploy\scripts\deploy-dotnet-image.ps1 `
  -ServerHost 你的服务器IP `
  -User root `
  -TargetDir /usr/app/gold-collector `
  -Platform linux/arm64
```

如果你本地已经提前构建好了镜像，想跳过 `docker build`：

```powershell
.\deploy\scripts\deploy-dotnet-image.ps1 `
  -ServerHost 你的服务器IP `
  -User root `
  -TargetDir /usr/app/gold-collector `
  -SkipBuild
```

如果远端目录需要 `sudo` 权限：

```powershell
.\deploy\scripts\deploy-dotnet-image.ps1 `
  -ServerHost 你的服务器IP `
  -User deploy `
  -TargetDir /usr/app/gold-collector `
  -UseSudo
```

## 服务器上的 `.env`

默认会读取：

```text
/usr/app/gold-collector/.env
```

示例可以参考：

- [deploy/docker/.env.example](/E:/2026/open-gold-system/deploy/docker/.env.example)

如果 MySQL 就在服务器本机，建议把连接串里的 `host.docker.internal` 改成 `127.0.0.1`。

## 参数说明

- `-ServerHost`：服务器地址，必填
- `-User`：SSH 用户，默认 `root`
- `-Port`：SSH 端口，默认 `22`
- `-TargetDir`：服务器部署目录，默认 `/usr/app/gold-collector`
- `-RemoteTempDir`：远端临时目录，默认 `/tmp/open-gold-dotnet-deploy`
- `-ImageName`：镜像名，默认 `open-gold-system-dotnet`
- `-ImageTag`：镜像标签，默认 `latest`
- `-ContainerName`：容器名，默认 `gold-collector-dotnet`
- `-AppPort`：应用端口，默认 `41736`
- `-Dockerfile`：Dockerfile 路径，默认 `deploy/docker/Dockerfile`
- `-Platform`：可选平台，例如 `linux/amd64`、`linux/arm64`
- `-UseSudo`：远端命令前加 `sudo`
- `-SkipBuild`：跳过本地镜像构建
- `-KeepRemoteArchive`：保留服务器上的镜像 tar 包，不自动删除

## 脚本会做什么

脚本在服务器上会执行这些动作：

1. 创建部署目录和日志目录
2. 导入新镜像
3. 如果旧容器存在，先删除旧容器
4. 使用相同容器名重新启动
5. 挂载日志目录到 `/app/logs`
6. 使用服务器上的 `.env` 作为环境变量来源

## 注意点

- 脚本默认用 `docker run` 重启容器，不依赖服务器上重新执行 `docker compose build`
- 当前容器使用 `--network host`
- 如果服务器没有 `/usr/app/gold-collector/.env`，容器会启动失败
- 如果你要部署 `Java` 版本，建议我再补一份对应脚本，或者把这份脚本扩成同时支持 `dotnet/java`
