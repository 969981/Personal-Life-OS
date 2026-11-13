# 私人网页部署（有认证的本机 / Tailscale）

**当前公开仓库只可以部署演示数据。** 正式日记网站必须先将仓库设为 Private，或保留私人 vault 完全本地；同时完成身份认证。不能仅用 noindex 或 GitHub Private 保证静态网页权限。

本方案选用 **Astro 静态构建 + Caddy 全站 Basic Auth + 仅绑定 127.0.0.1 + Tailscale Serve**。默认不需要公网域名，不依赖外部反向代理。Caddy 只监听容器内部 HTTP 端口，本机回环口才可访问；远程通过 Tailscale HTTPS 访问，并额外经过 Caddy 密码验证。

## 1. 准备

确保 Node.js 22、Docker Engine/Docker Desktop 和 Tailscale 已安装。先用 Obsidian/CLI 建立本地笔记和照片。

```powershell
npm install --prefix apps/web
```

普通公开演示构建：

```powershell
npm run build
```

如果确实要生成包含私人内容的静态网站，先确认只打算把生成目录挂到受保护的 Caddy 实例：

```powershell
$env:LIFE_OS_PRIVATE_BUILD = "I_HAVE_PROTECTED_THE_SITE"
npm run build
Remove-Item Env:LIFE_OS_PRIVATE_BUILD
```

此命令只选择需要打包的数据，**本身不提供任何访问认证**。在确认 Caddy 配置正确以前，不要把 dist 拷贝到公开托管服务。

## 2. 配置 Caddy 密码

复制 `deploy/private.env.example` 到 `deploy/.private.env`（已被 Git 忽略）。先使用 Caddy 的 `hash-password` 命令生成 bcrypt 哈希，例如使用 Docker 的交互命令：

```bash
docker run --rm -it caddy:2.10 caddy hash-password
```

请在交互提示中输入强密码，不要将明文密码写进仓库、终端命令参数或 CI 环境。将生成的哈希填入 LIFE_OS_BASIC_HASH；保留 env 文件中**单引号**以避免美元符号被 Compose 扩展。

接着启动：

```bash
docker compose -f deploy/compose.private.yml up -d
```

## 3. 必须进行认证测试

```bash
curl -I http://127.0.0.1:8088/
curl -I http://127.0.0.1:8088/_gallery/example.webp
```

两条未带认证的请求应返回 **401**。即使照片不存在，也要先经过认证（401），而不是直接 404 或 200。认证成功后才允许返回 HTML 和图片。无法通过时立即停止容器，不要发布。

浏览器可以直接访问 http://127.0.0.1:8088；由于 Basic Auth 不应在公网明文 HTTP 上使用，这个地址只允许访问本机 loopback。

## 4. 用 Tailscale Serve 在自己设备上远程访问

所有设备登录同一个 Tailscale tailnet，在运行私有网站的那台主机执行：

```bash
tailscale serve 8088
```

按提示启用 tailnet HTTPS。使用其产生的 `*.ts.net` 站点地址访问，并输入 Caddy 账户密码。**不要开启 Tailscale Funnel**；Serve 只分享给 tailnet 成员，Funnel 会公开到互联网。还要确认 tailnet 的 ACL/grants 只允许你的个人账户或设备访问。

参见：https://tailscale.com/docs/features/tailscale-serve

## 5. 其他部署选项

Cloudflare Pages + Access 是另一条路线，但须手工完成 Access 应用、正式域名、*.pages.dev 和所有预览域名的权限覆盖检查，确认匿名用户无法直接读取资源，然后才构建私有版本。**本仓库不会自动向 Cloudflare Pages、GitHub Pages 或 Vercel 上传任何私人内容。**

## 6. 验收

- 未登录的网页 HTML、照片 URL、搜索索引、资源路由全部被拒绝；
- Docker 端口只绑定 127.0.0.1；
- Tailscale Serve 可访问，Funnel 不可访问；
- 私人 Build 不被任何 Public CI、预览分支或自动发布作业上传；
- 更新网站时会重新构建并检查静态目录，无多余旧照片；
- 备份独立于 Git 历史，并定期恢复测试。

参考：
- https://caddyserver.com/docs/caddyfile/directives/basic_auth
- https://tailscale.com/docs/features/tailscale-serve
