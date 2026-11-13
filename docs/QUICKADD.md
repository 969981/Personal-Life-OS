# Obsidian QuickAdd 一键记录

本仓库的主编辑器是 Obsidian，数据始终保存为本机 Markdown。请先在 Obsidian 打开 `vault/` 文件夹，启用 **Daily notes** 与 **Templates** 核心插件，并安装 QuickAdd **2.30.0 或更新版本**。

## 1. 每日随手记录（推荐热键 Ctrl+Alt+D）

Settings → Community plugins → QuickAdd → New choice → Capture：

| 设置 | 值 |
| --- | --- |
| Name | 随手记到 Diary |
| Capture to | `{{DAILY}}`（选择旁边的 Daily note） |
| Create file if it doesn't exist | On |
| Write position | After line… |
| Insert after | `## Timeline` |
| Insert at end of section | On |
| Create line if not found | On，Bottom |
| Capture format | `- {{DATE:HH:mm}} 💭 {{VALUE}}` |
| Link to captured file | Off |

请确认 Daily Notes 的 folder 为 `Diary`、Date format 为 `YYYY/MM/YYYY-MM-DD`，模板为 `Templates/Daily`。选择 `{{DAILY}}` 可以避免和 Daily Notes 指向不同的日期或目录。QuickAdd 会按所设模板创建缺失的日记。

快捷键：将此 Choice 添加进命令面板，再到 Settings → Hotkeys 设置 Ctrl+Alt+D。已有全局快捷键冲突时请改用其他组合。

## 2. 待办 Capture（推荐 Ctrl+Alt+T）

再创建一个 Capture，目标也是 `{{DAILY}}`，Insert after 设为 `## 今日待办`、不存在时于底部创建，Capture format 为：

```text
- [ ] {{VALUE}}
```

这样可以从任何笔记快速向今天追加待办，而不必每条任务创建一个新文件。

## 3. 选中聊天内容保存为原始摘录

QuickAdd → New choice → Macro → Add user script；选择 `Automation/quickadd-chat.js`。执行该宏后，优先读取编辑器当前选区；没有选中文本时弹窗输入。脚本仅保存到本地的 `Chat-Captures/`，默认 visibility: private；不会调用云端 AI。

## 4. 灵感模板

QuickAdd → New choice → Template，Template path 选 `Templates/Idea.md`，Folder 设为 `Ideas`，File name 可使用 `{{DATE:YYYY-MM-DD}} {{VALUE}}`。创建后人工补充来源和下一步。

## 5. 检查

1. 在 Obsidian 按每日记录快捷键输入一句话，检查 `Diary/YYYY/MM/YYYY-MM-DD.md` 的 Timeline。
2. 连续追加两句，确认两条都在同一篇日记下。
3. 选中一段文字执行聊天摘录宏，检查新建的 Chat-Captures 文件完整包含原文。
4. 运行 `git status --short`，真实日记和聊天文件不得进入当前 Public 仓库的提交列表。

QuickAdd 官方手册：
- https://quickadd.obsidian.guide/docs/Examples/Capture_ToDailyNote/
- https://quickadd.obsidian.guide/docs/Choices/CaptureChoice/
- https://quickadd.obsidian.guide/docs/Choices/Packages/

> 暂不提交未经验证的 QuickAdd `data.json` 配置；保留可实际配置的标准 Capture/Macro 方案，避免覆写用户已有的插件数据。

## 6. QuickAdd 与 Astro 时间线（v0.3）

使用标准格式写在每日 Markdown 的 `## Timeline` 下：

```markdown
## Timeline

- 09:31 💭 想随手记下来的一句话
- 10:15 💡 需要继续研究的灵感

## 今日的小事
```

Astro 的 `/moments` 自动提取此类时分条目，按日期和时间降序展示，同时保留原有独立 Moments 文件。**无需把 Diary 条目再复制成独立的 Moment 文件。**

只有当前站点允许展示的 Diary 才会被提取；Public build 仍只包括 visibility: public 的演示记录。手机端可按照 [手机快捷记录](MOBILE-CAPTURE.md) 使用官方 Obsidian URI 写入同一个 Timeline。
