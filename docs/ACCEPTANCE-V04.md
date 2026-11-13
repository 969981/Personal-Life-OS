# v0.4 实际使用验收

此检查单区分 **CI 自动验收** 与 **真实设备人工验收**。测试通过不等于用户已经在 Windows、iOS、Android 的 Obsidian App 实际安装验证。

## Windows 桌面（真实 Obsidian + QuickAdd）

1. 安装 Obsidian、启用 Daily Notes / Templates，并安装 QuickAdd 2.30+。
2. 在设置中检查 Daily Notes 的目录、日期格式、模板与仓库一致；按照 [QuickAdd 指南](QUICKADD.md) 创建 Capture。
3. 快捷键连续触发三次，写入虚构测试内容：`测试甲`、`测试乙`、`测试丙`。
4. 打开当日日记，检查三条均在 `## Timeline` 下，没有被挪到其他章节、没有覆盖旧条目。
5. 启动 `npm run dev:private`，打开 `/moments`，验证顺序和跳转。
6. 关闭网页重新启动，确认 Markdown 原文仍保留。

CI 在 Windows runner 中自动验证 `npm run capture` 的并发、安全写入和 Markdown 解析，**不具备 Obsidian GUI 的真机操作能力**。

## 手机（真实 Obsidian URI）

1. 在手机安装 Obsidian 并打开与电脑同步的 Vault；启用 Daily Notes。
2. HTTPS 打开私有网站 `/capture`，输入虚构测试记录；浏览器将尝试启动 `obsidian://daily`。
3. 切回 Obsidian 手工确认保存成功；不允许以网页提示作为保存成功证据。
4. 先联网打开一次，等待 Service Worker 安装，然后开飞行模式，重开 `/capture/` 测试离线后备页面。
5. 离线记录到 Obsidian 后重新联网，确认数据经自己的同步方式在电脑上可见。
6. 不要将私人内容输入 Public 演示网站，只用虚构样例进行验收。

离线 Service Worker 范围仅 `/capture/`，缓存空白输入页面，不缓存 `/notes`、`/_gallery` 或任何私人资源。首次安装和授权时仍需要联网；手机若无 Obsidian，需手动复制 Markdown。主屏图标使用 `/capture/` 作为 start_url，确保离线服务工作线程作用域正确。

## Markdown 标题与双向链接

在两篇非敏感示例中添加：
- `[[目标笔记#安装与配置？]]`
- `[[目标笔记|简写]]`
- `[Markdown 链接](./目标笔记.md#安装与配置？)`
- 双方互相引用，并用嵌入记法 `![[目标笔记]]` 验证回退呈现

检查中英文标题正确跳转，重复标题定位第一项，反向链接可见。**内联嵌入已提供沙箱预览**：页面用 `![[笔记]]` 在当前位置展示独立的只读 Markdown 内容；嵌套 iframe 被 CSP 阻止，预览高度有限并可滚动。受限于安全沙箱，它并非 Obsidian 那样可原位编辑的完整交互嵌入。

## 长篇聊天的多灵感提炼

1. 先用虚构的、跨不同主题的长对话测试，至少 3 个主题，每段 5-8 KB。
2. 运行 `npm run ai:multi -- --input ... --max 6`。
3. 对每张候选卡片检查 `source_hash`、`source_evidence` 是否真实存在于原文。
4. 反复运行相同文件，确认不会覆盖旧候选内容；输出 `duplicate` 信息。
5. 只人工批准真正有价值的候选，错误内容删除或修正。
6. 离线模型性能、生成耗时、漏提取率和人工评价需要在实际本机 Ollama 上测试，模拟 API 的 CI 不能证明质量。

## 安全红线

- Public 仓库继续只提交合成演示内容；不要提交真实日记、聊天、照片。
- 私人网站的认证不能只依赖 GitHub Private 和 noindex。
- 未通过未认证的 HTML/图片 401 测试，不应把私人静态构建部署公网。
