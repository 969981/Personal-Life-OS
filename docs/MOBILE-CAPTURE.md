# 手机快捷记录：无后端的 Obsidian URI

## 工作原理

Life OS 静态网站的 /capture 页面只负责接收文本并构造官方 Obsidian URI。网页**不发送也不储存**所输入的日记内容。使用者必须在当前手机安装 Obsidian 并打开同名 Vault，Daily Notes 应开启。

- 碎碎念：调用 obsidian://daily，并使用 append=true、heading=Timeline，将时间戳内容追加到当天日记。
- 日记片段：同样追加到 Timeline，但使用 📝 标记。
- 灵感：调用 obsidian://new，生成 Ideas/YYYY-MM-DD-<时间编号>.md，frontmatter 默认 visibility: private。
- 复制 Markdown：仅复制到本机剪贴板，不提交到公开仓库。
- 仅 Vault 名称或 ID 存入 localStorage；不持久化正文。

## 设置

1. 在手机安装 Obsidian，打开对应的 vault（与电脑内容保持同步，需要自行配置 Obsidian Sync / 安全的 Git 同步方式）。
2. 启用 Daily Notes，并设置 folder=Diary，format=YYYY/MM/YYYY-MM-DD，template=Templates/Daily。
3. 进入私人 Life OS 网站的 /capture，填入真实 Vault 名称或 ID。
4. 写一句话，点击“写入 Obsidian”；切换到 Obsidian 检查 Timeline 是否新增。
5. Safari 用“添加到主屏幕”，Android Chrome 用“添加到主屏幕”。首次安装需要联网。页面注册只作用于 /capture/ 的 Service Worker，之后断网可打开精简版空白表单。仅缓存 /capture/offline.html，不缓存私人笔记正文、照片或搜索内容。

## 需要注意

- 浏览器无法可靠地知道外部 Obsidian URI 是否写入成功，**不能因此提示绝对保存成功**。
- 请勿将日记原文放在网址查询参数、公开社交分享地址或日志里。
- 因为它是纯静态页面，手机上的内容由手机 Obsidian 写入；**不会直接修改电脑上的 Vault**。是否同步到另一台设备取决于你已配置的同步机制。
- Obsidian 提示权限时选择允许；若系统不支持 URI，可使用复制按钮作为后备。
- 官方文档：https://obsidian.md/help/uri
