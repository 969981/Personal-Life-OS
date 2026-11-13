# Personal Life OS · 技术架构

## 原则

1. Markdown 是唯一事实来源。所有长期保留的记录最终在 vault 中保存为独立 .md。
2. 记录与整理分层。AI 提炼产生候选文件，绝不覆盖原始日记。
3. 网站只读。Astro 按 YAML frontmatter 的 type、visibility 分类构建页面。
4. 隐私默认关闭。未声明 visibility 的笔记默认为 private。
5. Obsidian、Astro 和 Git 都能替换，原始 Markdown 不依赖这些平台。

## 数据流

~~~text
Obsidian Daily Notes / QuickAdd → vault/*.md
                           ↓ Git (private after migration)
                          Astro
              (build-time visibility filter)
                           ↓
                    Static website

ChatGPT/Memos → selected import → raw capture
                    ↓
            AI proposal / review
                    ↓
                  vault
~~~

## 文件与数据模型

~~~yaml
---
title: "有意义的题目"
type: diary
date: "2026-11-13"
created: "2026-11-13"
summary: "可选摘要"
visibility: private
tags: [life, idea]
status: exploring
---
~~~

type 支持 diary、moment、idea、knowledge、project、review。visibility 支持 public、private、local-only。日期为 ISO 格式。文件路径生成 URL，移动文件可能改变 URL，后续需引入稳定 id。

## 技术分层

- vault/Samples：公开的演示记录
- vault/Templates：模板文件（Astro 不解析）
- vault/Diary、Ideas、Moments、Knowledge、Projects、Life、Reviews、Chat-Captures、Attachments：个人内容（当前不提交到 Public）
- apps/web/src/content.config.ts：输入目录与 frontmatter 类型校验
- apps/web/src/lib/notes.ts：内容过滤和列表 helper
- apps/web/src/pages：静态路由
- scripts：工具
- docs：架构和隐私策略

## 构建隐私

visibleNotes 会在调用 getStaticPaths 时过滤未授权笔记。普通构建仅 public，local-only 永远不得被静态构建。LIFE_OS_PRIVATE_BUILD=I_HAVE_PROTECTED_THE_SITE 是部署者的显式确认开关，不执行登录验证；只有在部署完全受 Cloudflare Access/Tailscale 等保护时才允许设置。

## 后续接口

- 元数据包含 stable id、source_refs、content_hash 和 review_status
- AI 结果只写 staging 或新的 PR
- 照片通过授权存储、经过 EXIF 隐私校验后产生缩略图
- 公开个人主页与私人生活空间独立构建、独立部署
- 允许派生数据库或搜索索引，但不成为主数据
