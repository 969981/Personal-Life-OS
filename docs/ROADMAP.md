# 项目路线图

## v0.1 · 基础版

- [x] 建立 Public 仓库安全防线
- [x] Obsidian Vault 与 Daily / Idea / Chat 模板
- [x] Astro 内容集合与类型约束
- [x] 首页、日记、碎碎念、灵感、知识、项目等页面
- [x] 月视图日历与笔记详情路由
- [x] 可见笔记的客户端搜索
- [x] 架构、隐私和 AI 规则文档
- [x] 通过 CI 构建与路由检查
- [ ] 真实浏览器桌面与手机视觉回归

## v0.2 · 记录流体验

- [x] QuickAdd 标准 Capture 配置、时间戳 Timeline 与本地聊天宏（须用户在 Obsidian 内启用）
- [ ] Obsidian Bases 灵感看板和日历视图
- [x] WikiLinks / Alias / Heading / Backlinks 基础支持（嵌入按引用跳转，不内联）
- [ ] 稳定 ID、移动文件后的 URL 兼容
- [ ] 搜索 Markdown 正文及标签筛选

## v0.3 · AI 整理

- [x] 手动摘录 ChatGPT 聊天到本地原文（无法自动读取全量聊天）
- [x] 本地 AI 候选笔记保留 SHA-256 与原始文件引用（跨笔记去重尚未完成）
- [x] 本地 Ollama 分类/摘要、生成待审核 Markdown（不自动创建 PR）
- [ ] 手动触发每日/每周总结
- [x] AI 多主题独立候选、逐字证据与重复检查
- [x] 测试：本地模拟 Ollama、人工审核和原文保持不变

## v0.4 · 私有部署与相册

- [ ] 私有与公开双环境构建
- [ ] 已提交 Caddy + Tailscale Serve 认证部署配置；需在用户实际设备进行 401/登录验收
- [x] 本地照片 WebP 转码、元数据删除与发布白名单（仍需用户自建存储）
- [x] 手机快捷记录页面、主屏入口、Obsidian URI 一键追加（离线同步未实现）
- [x] Memos JSON/API 可选单向导入，默认 dry-run 与 private
- [ ] 备份与恢复演练

## 验收门槛

任何真实个人资料都不得进入 Public GitHub 历史或未加身份认证的网站。发布前必须审核 Git diff、生成的 HTML、索引和静态文件。

## v0.4 · 实际使用验收增强（PR #4）

- [x] Windows GitHub runner 模拟多进程 CLI 日记追加，不丢条目
- [x] 保存 Wiki 标题 fragment，使用 Astro 真正的 heading slug 跳转
- [x] 静态版手机离线空白记录页，Service Worker 仅在 /capture/ 生效
- [x] 本地 Ollama 长对话分段、上下文边界与跨段去重的模拟测试
- [x] 只对可见笔记生成 iframe 内联嵌入，CSP 禁止嵌套 iframe
- [ ] Windows Obsidian QuickAdd 图形界面连续记录实测
- [ ] iOS/Android Obsidian URI + 断网录入实测
- [ ] 真正运行本机大模型并评价长聊天提取质量
- [ ] 私人 HTTPS 地址及身份验证的真实环境部署


## v0.5 · 私人部署与备份验收

- [x] Windows/手机 Obsidian Sync 的逐步操作方案及冲突风险说明
- [x] PC→手机→PC 双向同步探针 CLI（真实跨设备仍需用户验证）
- [x] Caddy 部署静态预检查：bcrypt hash / 全站认证 / loopback
- [x] 真实 Docker Caddy 的匿名 401、正确账户 200、No-Store 自动化工作流
- [x] 私人静态构建前后强制认证检查与失败关闭容器
- [x] Tailscale Serve HTTPS / 禁止 Funnel 部署操作手册
- [x] restic 加密备份、列表、检查和恢复演练手册
- [ ] 用户电脑/手机 Obsidian Sync 真正激活与双向证明
- [ ] 用户 Docker Desktop/Tailscale 配置并在真机检查 HTTP 401
- [ ] HTTPS 私人网站完成实际上线
- [ ] 真实个人日记和照片开始日常记录
