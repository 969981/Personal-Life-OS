# Personal Life OS

> 日常碎碎念、Diary 日记、聊天灵感、知识库和项目，最后成为一个属于自己的 Markdown 数字生活空间。

**当前状态：v0.5 私人部署与双向同步验收版 · Astro + Obsidian · 本仓库暂时为 Public。**

⚠️ **请勿上传真实私人日记、聊天记录、照片、身份证件、账户或其他敏感数据。** 已设置 Git 忽略规则，但不是泄露保险：强制添加、已经提交的历史、工作流日志和第三方部署都可能泄露内容。详见 [隐私指南](docs/PRIVACY.md)。

## 快速开始

要求：Node.js 22+、npm、Obsidian（可选）。

~~~bash
git clone https://github.com/969981/Personal-Life-OS.git
cd Personal-Life-OS
npm run init:vault
npm install --prefix apps/web
npm run dev
~~~

打开 http://127.0.0.1:4321。

在 Obsidian 选择 Open folder as vault，打开仓库里的 vault/ 目录。打开 Daily Notes / Templates 核心插件；建议按需安装 QuickAdd 和 Obsidian Git。

当前默认网页只显示 visibility: public 的演示笔记。在可信任的本机 dev 模式下设置 LIFE_OS_SHOW_PRIVATE=true 可查看私人笔记；普通 build 不会公开私人数据。

## 功能

| 模块 | 路由 | 当前状态 |
| --- | --- | --- |
| 生活首页 | / | Dashboard、统计、最新记录 |
| Diary 日记 | /diary | Markdown 列表与阅读 |
| 碎碎念 | /moments | Diary Timeline + 独立 Moment 合并时间线 |
| 日历 | /calendar | 月份切换、日期跳转 |
| 灵感 | /ideas | 卡片与状态 |
| 知识库 | /knowledge | Markdown 内容 |
| 项目 | /projects | 项目卡片 |
| 相册 | /photos | 私人图像导入、WebP、可见图片墙 |
| 快捷记录 | /capture | 官方 Obsidian URI + 无私人缓存的离线空白表单 |
| 搜索 | /search | 已展示笔记的标题、标签和摘要搜索 |
| AI 整理 | CLI | 本地 Ollama 单篇/多篇候选灵感，保留原文证据，需人工审核 |
| Memos | CLI | JSON/API 单向私有导入（可选） |
| Quartz / SilverBullet | — | 可选参考，不引入第二套主数据 |

## 目录

- vault/Samples/：公开演示笔记，供预览与 CI 使用
- vault/Templates/：Obsidian 日记、灵感和聊天摘录模板
- vault/Diary/、vault/Ideas/、vault/Chat-Captures/ 等：真实个人笔记，默认被 Git 忽略
- apps/web/：Astro 网站
- docs/：架构、隐私、集成与迭代计划
- scripts/：初始化及后续整理工具

每篇笔记使用 YAML frontmatter；visibility 缺失时默认为 private。

~~~yaml
---
title: "今天的一点记录"
type: diary
date: "2026-11-13"
visibility: private
tags: [daily, life]
---
~~~

**数据原则：** Markdown 是主数据；Obsidian 是编辑器，Astro 是只读展示，Git 是版本历史。AI 仅生成候选内容，默认不能修改原始记录。

## 随手记和聊天摘录（本地）

本项目提供不依赖 AI API 的本地捕捉命令。它会在被 Git 忽略的私人文件夹写入 Markdown，默认 visibility: private。

~~~bash
npm run capture -- --type diary --text "今天突然想到一个新点子"
npm run capture -- --type moment --text "随手记的一句话"
npm run capture -- --type idea --title "个人时间线" --text "我的灵感"
npm run capture -- --type chat --title "聊天摘录" --source "ChatGPT" --text "保留的原文"
~~~

Diary 会追加到当天文件的 Timeline 标题下；chat 会保留原文并等待 AI 审核。该工具不会自动上传或同步聊天。

## QuickAdd / 本地 AI / Memos / 相册

- [QuickAdd 快捷键与宏配置](docs/QUICKADD.md)：一键 Diary、待办、聊天原文摘录；
- [本地 AI 整理](docs/AI-ORGANIZER.md)：Ollama 结构化提取，先进入 00-Inbox/AI-Proposals，审核后才移动到 Ideas/Knowledge/Projects；
- [Memos 导入](docs/MEMOS.md)：可从 JSON 或授权 API 导入到 Moments，dry-run 默认开启，默认私密；
- [私人相册](docs/PHOTOS.md)：sharp 去 EXIF、生成 WebP、生成允许发布的静态图片列表；
- [手机快捷记录](docs/MOBILE-CAPTURE.md)
- [Windows / 手机 / Markdown / 长聊天实机验收清单](docs/ACCEPTANCE-V04.md)：官方 Obsidian URI，将一句话追加到当日日记，主屏快捷入口；
- [带认证的私有站点](docs/PRIVATE-DEPLOY.md)：本机 Caddy 全站 Basic Auth + Tailscale Serve，未自动部署。

```bash
# 在 Obsidian 里设置 QuickAdd，详见 docs/QUICKADD.md
npm run dev:private

# 需自行安装并运行本地 Ollama
npm run ai:organize -- --input vault/Chat-Captures/摘录.md
npm run ai:multi -- --input vault/Chat-Captures/摘录.md --max 6
npm run ai:approve -- --id 16位编号 --target Ideas

# 导入 Memos：先预览，不执行写入
npm run memos:import -- --file /path/memos-export.json
npm run memos:import -- --file /path/memos-export.json --apply

# 导入私人照片
npm run photos:import -- --file /path/photo.jpg --title "某天的照片"
```

**重要：** 上述代码和命令不会自动连接你的 ChatGPT 历史、Memos 账号或云端相册，也不会自动发布私人网页。所有外部来源和真人记录均需要用户自行授权或明确选择。

## v0.5：私人同步 / Caddy 安全测试 / 独立备份

公开 GitHub 仓库仍然**只保存代码和演示内容**。真实 Diary/Photos/Chat-Captures 只留在 Git 忽略的 Vault 中。

1. **[Windows + 手机 Obsidian 同步](docs/SYNC-SETUP.md)**：Obsidian Sync E2EE 优先（需订阅），可用 sync:probe 做 PC → 手机 → PC 双向确认。
2. **[加密备份与恢复演练](docs/BACKUP.md)**：独立 restic 仓库，不能把 Git 或跨设备同步当备份。
3. **[私有部署与 Caddy/Tailscale 验收](docs/PRIVATE-DEPLOY.md)**：先用 Public 演示内容启动只监听本机的 Caddy，匿名访问必须返回 401，检查通过后才构建私人网站。
4. GitHub Actions 使用**合成账户/密码**启动真实 Caddy 容器做认证回归测试。不会上传私人 Vault。

~~~powershell
npm run sync:probe -- create
npm run sync:probe -- verify <16位ID>

# 先用演示数据启动 Caddy 并配置本地 hash，详见文档
npm run private:preflight
npm run private:check-auth

# 只有通过认证测试后才可执行
npm run private:build
~~~

手机 HTTPS Tailscale Serve 和 Obsidian Sync 实机登录仍需在自己的设备配置，并不由 GitHub CI 自动完成。

## 构建

~~~bash
npm run build
npm run preview
~~~

静态产物位于 apps/web/dist/。**本仓库 Actions 只执行 CI 检查，不自动发布网站。** 私人网站必须在完成身份访问保护和预览域名检查后才部署。

## 文档

- [技术架构](docs/ARCHITECTURE.md)
- [隐私与公开仓库防护](docs/PRIVACY.md)
- [开源项目融合方案](docs/INTEGRATIONS.md)
- [开发路线](docs/ROADMAP.md)
- [QuickAdd 设置](docs/QUICKADD.md)
- [AI 本地整理](docs/AI-ORGANIZER.md)
- [Memos 导入](docs/MEMOS.md)
- [相册](docs/PHOTOS.md)
- [私人网页认证部署](docs/PRIVATE-DEPLOY.md)
- [Windows / 手机 Vault 同步指南](docs/SYNC-SETUP.md)
- [加密备份与恢复](docs/BACKUP.md)
- [手机快捷记录](docs/MOBILE-CAPTURE.md)
- [AI 协作规则](AGENTS.md)

License：尚未决定，当前不应假定获得复用授权。
