# 本地 AI 整理流程（Ollama）

本阶段**不连接 ChatGPT 的个人聊天历史**，也不在 GitHub Actions 自动上传聊天内容。只处理你明确选择的本地 Markdown 文本。

## 先决条件

安装 Ollama，并在自己的电脑上准备一个支持中文与 JSON 输出的模型。例如：

```bash
ollama pull qwen2.5:7b-instruct
```

这个示例模型名只是默认值；硬件不足时可手动替换为更小的本地模型。

## 使用

```bash
npm run capture -- --type chat --title "灵感讨论" --text "需要整理的聊天原文"
node scripts/ai-organize.mjs --input vault/Chat-Captures/文件名.md --provider ollama
```

生成文件在 `vault/00-Inbox/AI-Proposals/proposal-<sha16>.md`。其中保留原始文件路径、SHA-256 和待办建议。随后先在 Obsidian 审阅，确认无误再执行：

```bash
node scripts/approve-proposal.mjs --id <16位编号> --target Ideas
```

项目判断为知识则使用 Knowledge，为行动计划则使用 Projects。

## 安全约束

- 仅允许 loopback 地址（127.0.0.1、localhost、::1）的 Ollama 服务，防止误发私人聊天到远程。
- 原始文件只读，不覆盖、不编辑、不自动提交 Git。
- 模型回答经过类别、标题和类型校验，结果始终在 Git 忽略的目录中。
- AI 摘要可能有误，不能替代来源验证。
- 当前仅抽取一份候选卡片，后续增强多候选分解、相似度去重及来源段落引用。

## 计划

- 多主题拆分、关联现有 Obsidian 双向链接、内容哈希去重与合并建议。
- 经用户明确授权后接入其他 AI provider；不默认传输原始聊天数据。

## 多灵感拆分（v0.3）

明确选择一份本地聊天摘录，在本机 Ollama 一次拆分多条候选：

```bash
npm run ai:multi -- --input vault/Chat-Captures/你的聊天.md --max 6
```

默认最多六条，最高八条。每条必须提供逐字存在于原文中的 evidence，缺少证据的自动拒绝。每条分别保存 SHA-256、原始文件路径、原文依据和 pending-review 状态；模型不会覆盖原始聊天。

在 Obsidian 人工审核后，逐条执行原有审批命令：

```bash
npm run ai:approve -- --id 16位编号 --target Ideas
```

重新运行相同输入会跳过同来源的已有候选，避免无意覆盖。这不是全局语义去重，模型提炼也不等于事实已验证。
