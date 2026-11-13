# 隐私和 Public 仓库防护

**仓库暂时公开。请只提交演示数据，不要提交真实私人日记、照片、聊天记录、工作或财务数据。**

## 已有措施

1. 根目录 .gitignore 排除所有真实生活记录路径、Photos、Photo-Media 和临时 _gallery 图片。
2. 公开演示只放在 vault/Samples，全部设置 demo: true 与 visibility: public。
3. visibility 缺省为 private，Astro 默认构建只输出 public 内容。
4. local-only 笔记不进入生产静态构建。
5. GitHub Actions 仅运行构建，不部署到 GitHub Pages 或公网上。
6. HTML 有 noindex，但 noindex 不是身份认证。
7. 图片导入采用 WebP 重新编码，静态构建仅复制允许发布的图片，私有构建必须在受认证保护的环境运行。

## 本地检查

~~~bash
git status --short
git ls-files vault
npm run build
find apps/web/dist -type f | sort
~~~

忽略规则并不是安全边界：手动强制 add、提交历史、Actions 日志、站点预览、缓存都可能导致信息泄露。曾经公开发布的真实个人数据应视为已泄露，即使之后将仓库设为 Private 也无法保证收回。

## 本地私密预览

只有在可信任本机开发环境下，设置 LIFE_OS_SHOW_PRIVATE=true 并运行 npm run dev。默认绑定 127.0.0.1，不能通过 --host 0.0.0.0 向外开放。禁止分享带私人内容的 dist。

## 将来部署

1. 仓库先设为 Private 并检查历史。
2. 用 Cloudflare Access、Tailscale 或自托管认证保护私人站点。
3. 实际测试正式域名、pages.dev 域名、预览分支、静态资源和缓存，确保未认证访问失败。
4. 认证完整后才允许显式设置 LIFE_OS_PRIVATE_BUILD=I_HAVE_PROTECTED_THE_SITE。
5. 永远不要在未认证的 GitHub Pages 上发布私人日记。
6. 照片使用受控存储；不要将真实私人图片放进 Astro public/。

## 本机 Caddy / Tailscale

参见 [私有部署操作文档](PRIVATE-DEPLOY.md)。Caddy 绑定 127.0.0.1:8088 并对所有文件强制密码认证；Tailscale Serve 提供 tailnet HTTPS，不能使用 Funnel 把私密照片公开分享。未经实机验证认证与 ACL，不应上传含私人内容的 dist。

## 自动化

AI 产生候选笔记，经人工审核才能保存到正式知识库。保留 source_refs、时间、修订历史，拒绝未经许可的全量聊天抓取。


## v0.5：准备使用真实日记前

- 先按 [SYNC-SETUP.md](SYNC-SETUP.md) 确认 Obsidian 双向同步，禁止同一 Vault 多套并发同步。
- 再按 [BACKUP.md](BACKUP.md) 将完整 Vault 加密备份到**非公开**的独立位置并执行恢复演练。
- [PRIVATE-DEPLOY.md](PRIVATE-DEPLOY.md) 提供 Caddy 全站 HTTP 认证实测，认证失败时不构建私人网页。
- Docker 只监听本机 127.0.0.1，跨设备访问只能走受权限控制的 Tailscale Serve HTTPS。
- GitHub Actions 的测试密码均为合成字符串，只用于模拟 Caddy，不能用于正式部署。
- 即使启用私人认证，构建出的 HTML 在本机磁盘上仍为明文，请保护磁盘和 Docker 访问权限。
