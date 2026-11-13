# Personal Life OS 私人网站：Caddy + Tailscale Serve

> 当前代码仓库 Public，真实 Vault 只保存在本地并被 Git 忽略。任何含私人数据的站点构建都不得上传 GitHub Actions、Pages、Vercel、Cloudflare Pages 的公开预览或第三方托管。

## 安全模型

Astro 生成静态 HTML → Caddy 全站 HTTP Basic Auth → Docker 仅监听 127.0.0.1:8088 → Tailscale Serve 的 tailnet HTTPS → 用户本人手机访问。

Caddy Basic Auth 对根目录、HTML、图片、Search、Wiki、嵌入和 Capture 页面均生效。**Basic Auth 本身在明文 HTTP 上不安全**，因此 8088 仅允许在同一电脑的回环地址访问，手机必须使用 Tailscale 提供的 HTTPS，不得直接把 8088 开放公网。

## 第一步：确保 Vault 同步/备份完成

先完成 [SYNC-SETUP.md](SYNC-SETUP.md) 的双向测试与 [BACKUP.md](BACKUP.md) 的备份恢复演练。不要为了部署先上传真实隐私文件到 Public GitHub。

## 第二步：先用公开演示数据启动 Caddy

需要 Node.js 22、Docker Desktop、Tailscale；在 Windows PowerShell 进入仓库：

~~~powershell
npm install --prefix apps/web
npm run build

Copy-Item deploy\private.env.example deploy\.private.env
docker run --rm -it caddy:2.10 caddy hash-password
~~~

在交互提示中输入强密码，复制生成的 bcrypt 哈希，编辑只保存在本地的 deploy/.private.env：

~~~dotenv
LIFE_OS_BASIC_USER=my-private-user
LIFE_OS_BASIC_HASH='$2a$14$替换为真实bcrypt哈希'
~~~

hash 里的美元符号用**单引号**包住。不要把真实明文密码、hash 或 deploy/.private.env 上传到 Git。请不要在 PowerShell 历史中输入带有明文密码的命令。

~~~powershell
npm run private:preflight
docker compose -f deploy/compose.private.yml up -d
~~~

Caddy 仅绑定 http://127.0.0.1:8088 ，不会监听公网网卡。第一次 Docker 启动可能需要拉取 caddy 镜像。

## 第三步：自动验证全站认证

在当前 PowerShell 窗口获取登录凭据，密码只放在临时进程环境变量中：

~~~powershell
$cred = Get-Credential -Message "输入刚设置的 Caddy 账户与密码"
$env:LIFE_OS_TEST_USER = $cred.UserName
$env:LIFE_OS_TEST_PASSWORD = $cred.GetNetworkCredential().Password
npm run private:check-auth
~~~

脚本检查每个路径的匿名 GET / HEAD 均返回 401，错误账号仍返回 401，正确账号访问正常页面返回 200，同时检查 no-store 缓存头。包括不存在的图片路径：必须先触发认证，再给 404。

**认证失败立即停止：**

~~~powershell
docker compose -f deploy/compose.private.yml down
~~~

## 第四步：只有认证通过后才能构建私人网站

~~~powershell
npm run private:build
~~~

此命令会先重复静态安全检查和真实 HTTP 认证测试，然后仅在当前本机进程里开启 LIFE_OS_PRIVATE_BUILD，构建私人 HTML 和已授权的图片列表，最后再次检测认证。如果发生故障将尝试关闭 Docker 服务。

⚠️ 本机构建产物 apps/web/dist/ 含有真实私人信息，虽然不上传 Git，但在磁盘上是**明文 HTML 文件**。请使用 Windows 设备加密/BitLocker，禁止任何公开静态服务读取此目录。

## 第五步：将本机网站通过 Tailscale Serve 提供给手机

在 Windows **管理员 PowerShell** 中执行（确认 Tailscale 已在本机登录）：

~~~powershell
tailscale serve --bg 8088
tailscale serve status
~~~

Tailscale 会显示本 tailnet 的 HTTPS 地址（通常是设备域名 .ts.net）。不要使用 tailscale funnel，也不要在路由器端口转发、Docker 0.0.0.0 绑定或关闭 Caddy 登录。访问控制应只允许自己的手机与电脑，检查 tailnet ACL/grants。

将手机登录同一 Tailscale tailnet，在手机浏览器打开 Serve 展示的 HTTPS 地址，必须仍需 Caddy 密码。登录后先用演示数据检查日记、相册、嵌入、搜索和离线 Capture。

可选从 Windows 对 tailnet HTTPS 地址复测：

~~~powershell
node scripts/check-auth.mjs --base "https://你的设备域名.ts.net/" --allow-tailnet
~~~

（仍使用上一步的 LIFE_OS_TEST_USER 和 LIFE_OS_TEST_PASSWORD。）

**未登录的直接访问必须是 401**。若在手机上看到无需密码即可读取真实私人 HTML/图片，立即执行 tailscale serve off 和 docker compose down。

## 第六步：结束后清除临时口令环境变量

~~~powershell
Remove-Item Env:LIFE_OS_TEST_USER
Remove-Item Env:LIFE_OS_TEST_PASSWORD
Remove-Variable cred
~~~

## 停止服务

~~~powershell
tailscale serve off
docker compose -f deploy/compose.private.yml down
~~~

## 验收范围

GitHub Actions 仅使用合成口令与公开演示页面测试真实 Caddy 401/200 和回环端口。CI 成功不代表用户的手机、Tailscale 帐户或 Windows Docker 已经配置完成。只有在你的设备上完成上述步骤，才可宣称私人站点真正上线。

文档：
- https://caddyserver.com/docs/caddyfile/directives/basic_auth
- https://tailscale.com/docs/features/tailscale-serve
- https://tailscale.com/docs/reference/examples/serve
