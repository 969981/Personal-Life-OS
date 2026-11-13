# Windows ↔ 手机 Obsidian Vault 私有同步

## 目标与安全边界

Obsidian 同步的是本地 Markdown Vault，GitHub 公共仓库只存代码与演示数据。手机和 Windows 的 Diary、Ideas、照片、附件均留在本地 Vault 并通过**独立的同步服务**传输。同步与备份不同，不能仅依赖同步服务来防误删。

## 首选：Obsidian Sync

适用于 Windows、iPhone、Android，官方支持。需要单独订阅。推荐选择端到端加密（E2EE），并把加密密码保存在与设备分离的密码管理器；丢失密码可能无法恢复远程内容。

1. 先在 Windows 本机对完整 vault 做一次独立备份，见 [BACKUP.md](BACKUP.md)。
2. 确认 Vault 不在会自动清理的 OneDrive/iCloud/Google Drive/Dropbox 目录。Windows 可放在 D 盘普通工作区，避免多个服务同时同步相同文件。
3. Obsidian 打开 Personal-Life-OS/vault，启用 Core Plugins → Sync，创建新的远程 Vault；选择 E2EE，保管加密密码。
4. 同步设置允许 Markdown、附件和指定配置；尤其确认 Photos、Photo-Media、Attachments、Diary、Ideas、Knowledge、Chat-Captures、Sync-Probes 均在需要同步的范围内，附图大小须符合所订阅方案的容量和文件大小限制。
5. 在手机打开 Obsidian，用同一账户连接现有远程 Vault。手机端应新建/选择正确的本地 Vault，不要把已有其他资料的 Vault 直接无脑合并。
6. 等 Windows 完成第一次同步，再连接手机。安装插件与快捷键后，检查 Daily Notes 的模板和路径是否保持一致。
7. **不要在同一组文件上叠加 Syncthing、Obsidian Git 自动推送、OneDrive 或 iCloud 同步**；同日记同时编辑会产生冲突。

官方指南：
- https://obsidian.md/help/sync/setup
- https://obsidian.md/help/sync-notes
- https://obsidian.md/help/sync/switch

## 零订阅替代方案

仅 Windows + Android：可以评估 Syncthing 在两台设备直接同步一个本地 Vault，注意断网、后台耗电、文件冲突和附件占用。

iPhone + Windows：建议优先 Obsidian Sync；iOS 端不应默认假设 Syncthing 在后台与 Windows 同样可靠。自行选择第三方 iOS 同步方案时必须先用虚构 Vault 测试完整往返，勿直接迁移真实日记。

任何方案都要**只选一套主同步**。GitHub Public 不能作为私人笔记的远程同步仓库。

## 双向同步实测

在 Windows PowerShell、仓库根目录执行：

~~~powershell
npm run init:vault
npm run sync:probe -- create
~~~

会在被 Git 忽略的 Sync-Probes/ 目录生成含随机 ID 的演示文件，并打印 ID。等待手机 Obsidian 看到该笔记；在手机中将工具提示的纯文本 PHONE-CONFIRMED 行添加到文件末尾，保存并等待同步回 Windows。

~~~powershell
npm run sync:probe -- verify <16位ID>
npm run sync:probe -- clean <16位ID>
~~~

通过时可说明 PC → 手机到达、手机写回 PC 成功。仍要手工验证**真实的照片附件**、文件删除同步、冲突处理和手机离线重连。Sync-Probes 目录已加入 .gitignore，永远不要强制提交它。

## 给自己的一条底线

首次正式记录前确认：完整备份存在、可成功恢复、手机与电脑双向同步均通过、访问网页需要登录。否则先在单设备本地记录，暂缓跨设备私有站点上线。
