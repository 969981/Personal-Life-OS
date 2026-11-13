# Personal Life OS

> 日常碎碎念、Diary 日记、聊天灵感、知识库和项目，最后成为一个属于自己的 Markdown 数字生活空间。

**当前状态：v0.2 工具链预览 · Astro + Obsidian · 本仓库暂时为 Public。**

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
| 碎碎念 | /moments | 时间线 |
| 日历 | /calendar | 月份切换、日期跳转 |
| 灵感 | /ideas | 卡片与状态 |
| 知识库 | /knowledge | Markdown 内容 |
| 项目 | /projects | 项目卡片 |
| 相册 | /photos | 私人图像导入、WebP、可见图片墙 |
| 搜索 | /search | 已展示笔记的标题、标签和摘要搜索 |
| AI 整理 | CLI | 本地 Ollama 生成待审核笔记，需自行安装模型 |
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
- [带认证的私有站点](docs/PRIVATE-DEPLOY.md)：本机 Caddy 全站 Basic Auth + Tailscale Serve，未自动部署。

```bash
# 在 Obsidian 里设置 QuickAdd，详见 docs/QUICKADD.md
npm run dev:private

# 需自行安装并运行本地 Ollama
npm run ai:organize -- --input vault/Chat-Captures/摘录.md
npm run ai:approve -- --id 16位编号 --target Ideas

# 导入 Memos：先预览，不执行写入
npm run memos:import -- --file /path/memos-export.json
npm run memos:import -- --file /path/memos-export.json --apply

# 导入私人照片
npm run photos:import -- --file /path/photo.jpg --title "某天的照片"
```

**重要：** 上述代码和命令不会自动连接你的 ChatGPT 历史、Memos 账号或云端相册，也不会自动发布私人网页。所有外部来源和真人记录均需要用户自行授权或明确选择。

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
- [AI 协作规则](AGENTS.md)

License：尚未决定，当前不应假定获得复用授权。
