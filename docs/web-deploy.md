# 前端静态站点部署脚本

仓库里提供了一个本地执行的 PowerShell 脚本，用来把 `apps/web/dist` 上传到 Linux 服务器，并替换线上静态目录。

脚本位置：

- [deploy/scripts/deploy-web-dist.ps1](/E:/2026/open-gold-system/deploy/scripts/deploy-web-dist.ps1)

## 适用场景

- 你已经在本地执行过前端构建，或者希望脚本自动构建
- Linux 服务器通过 `nginx`、`caddy` 或其他静态文件服务读取某个目录
- 你可以通过 `ssh` 和 `scp` 连接服务器

## 脚本会做什么

脚本按下面的顺序执行：

1. 可选执行 `npm run build`
2. 将 `apps/web/dist` 打成 `.tar.gz`
3. 上传到服务器临时目录
4. 解压到临时发布目录
5. 将当前线上目录改名为带时间戳的备份目录
6. 将新版本目录移动为正式目录

这样做的好处是：

- 不依赖 `rsync`
- 服务器不需要安装 `Node.js`
- 旧版本目录会保留，回滚更直接

## 你的目录示例

如果你的线上静态目录是 `/usr/app/gold-chart`，最常用的命令是：

```powershell
.\deploy\scripts\deploy-web-dist.ps1 `
  -ServerHost 你的服务器IP或域名 `
  -User deploy `
  -TargetDir /usr/app/gold-chart `
  -SkipBuild `
  -UseSudo
```

如果你本来就是 `root` 登录，通常可以不加 `-UseSudo`：

```powershell
.\deploy\scripts\deploy-web-dist.ps1 `
  -ServerHost 你的服务器IP或域名 `
  -User root `
  -TargetDir /usr/app/gold-chart `
  -SkipBuild
```

如果你还没有先执行本地构建，可以去掉 `-SkipBuild`，让脚本自动构建：

```powershell
.\deploy\scripts\deploy-web-dist.ps1 `
  -ServerHost 你的服务器IP或域名 `
  -User deploy `
  -TargetDir /usr/app/gold-chart `
  -UseSudo
```

## 参数说明

- `-ServerHost`：Linux 服务器地址
- `-User`：SSH 登录用户名
- `-TargetDir`：服务器上的静态站点目录
- `-Port`：SSH 端口，默认 `22`
- `-DistDir`：本地前端产物目录，默认 `apps/web/dist`
- `-RemoteTempDir`：服务器临时目录，默认 `/tmp/open-gold-web-deploy`
- `-UseSudo`：目标目录需要 sudo 权限时启用
- `-SkipBuild`：跳过 `npm run build`，直接上传现有 `dist`

## 执行前提

- 本机需要可用的 `ssh`、`scp`、`tar`
- 服务器允许该用户通过 SSH 登录
- 如果启用了 `-UseSudo`，该用户需要具备相应 sudo 权限

## 回滚方式

脚本执行完成后，会输出一个备份目录，例如：

```text
/usr/app/gold-chart.backup-20260604210000
```

如果新版本有问题，你可以在服务器上把当前目录移走，再把这个备份目录改回 `/usr/app/gold-chart`。

## 注意事项

- 脚本默认不会自动删除历史备份目录
- 如果你的服务程序或 `nginx` 对目录内容有缓存，替换后可能需要额外刷新或重载
- 如果线上目录还有其他手工文件，脚本替换时不会保留这些额外文件
