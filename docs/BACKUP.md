# 私人 Vault 的加密备份与恢复

**同步不是备份。** 手机误删、电脑误删或合并冲突都可能被同步到其他设备。

推荐 [restic](https://restic.readthedocs.io/en/stable/010_introduction.html) 建立经过加密的独立备份仓库。可选择加密后保存到外部磁盘或单独的受控备份存储；不要放进公开 GitHub 仓库，也不要仅存同一系统盘。

## Windows PowerShell

安装 restic 后，在 Personal-Life-OS 仓库根目录打开 PowerShell：

~~~powershell
$Vault = (Resolve-Path ".\vault").Path
$BackupRepo = "E:\PrivateBackups\Personal-Life-OS-restic"

# 仅首次初始化，系统将提示输入加密口令
restic -r $BackupRepo init

# 之后每次备份（仍会提示输入加密口令）
restic -r $BackupRepo backup $Vault

# 列出备份和检查仓库结构
restic -r $BackupRepo snapshots
restic -r $BackupRepo check
~~~

注意：不要把备份密码、API token、密钥写入仓库或明文脚本。密码丢失会导致备份不可解密。

## 恢复演练（非常重要）

不要直接恢复到正使用的原始 Vault。先恢复到独立目录检查：

~~~powershell
$RestoreTarget = Join-Path $env:TEMP ("life-os-restore-" + (Get-Date -Format yyyyMMddHHmmss))
restic -r $BackupRepo restore latest --target $RestoreTarget
Get-ChildItem -Recurse $RestoreTarget | Select-Object -First 30 FullName
~~~

确认日记、照片、附件、模板等确实存在且可读取后，才算完成恢复演练。restic 恢复可能保留原文件路径结构，因此请在恢复目录中查找 Vault 文件夹，再在另一份测试 Obsidian Vault 中试读。

## 建议频率

- 日常至少每天增量备份，定期检查备份是否成功；
- 每月抽样恢复一次，验证文本和图片；
- 密钥单独安全保存，另外保留一份物理隔离的备份；
- 照片可能很大，预留额外容量。手机同步和 Git 历史均不是这份独立备份的替代品。

官方文档：https://restic.readthedocs.io/en/stable/050_restore.html
