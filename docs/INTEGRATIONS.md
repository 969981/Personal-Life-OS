# 成熟开源项目融合策略

原则：只保留一个 Markdown 主数据源，避免多工具双向覆盖。

| 开源项目 | 角色 | v0.1 状态 | 后续方向 |
| --- | --- | --- | --- |
| Obsidian | 主要 Markdown 编辑、Daily Notes、QuickAdd、Bases | 已建 Vault 和模板 | 快捷记录、灵感看板 |
| Memos | 可选的社交式时间线录入 | 未安装 | API 单向导出到 vault/Moments |
| Quartz | 可选数字花园引擎 / 设计参考 | 未安装 | 研究 WikiLink 与反向链接 |
| Astro | Markdown 转私人生活网站 | 已采用 | 相册、图谱、移动端 |
| SilverBullet | 可选浏览器/PWA Markdown 编辑器 | 未安装 | 浏览器端录入 |
| 思源笔记 | 中文知识管理参考 | 未安装 | 仅在验证导出保真度后接入 |

## 碎碎念

第一阶段利用 Obsidian QuickAdd 向 Daily Note 的 Timeline 追加一条带时间的内容。如果一条碎片需要独立标签和单独网页链接，可另建 type: moment 的 Markdown 文件。

Memos 后续只作为可选收集端：导出至 staging，再做去重、审核、写入。桥接器记录 external_id、source_url、created_at 和 content_hash。绝不直接双写两种数据库。

## ChatGPT

选择性摘录聊天 → Chat-Captures 保存原文和来源 → AI 提炼到 staging → 人工确认 → Ideas、Knowledge 或 Projects。保留 source_ref、时间和 review_status，原始聊天不可覆盖。

**ChatGPT 聊天并不会原生地、实时地自动同步进 Obsidian**，这里规划的是授权导入器和待审核流程。

## 兼容性

v0.1 的 Astro 页面支持普通 Markdown 和 frontmatter；暂不完整支持 Obsidian WikiLinks、嵌入引用和 Backlinks。图谱、相册和块引用等功能按 ROADMAP 逐步增强。
