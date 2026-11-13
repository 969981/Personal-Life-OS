# Memos 可选导入

Memos 不是 Personal Life OS 的第二个主数据库，而是可选的手机/网页随手记录入口。导入仅单向复制，原 Memos 数据保持不变。

## 方式 A：本地 JSON 导入（优先）

提供包含 `memos` 数组的 Memos JSON 导出文件：

```bash
node scripts/import-memos.mjs --file /path/to/memos-export.json
node scripts/import-memos.mjs --file /path/to/memos-export.json --apply
```

默认 dry-run 只显示条数，不写文件；加 --apply 才会写入 `vault/Moments/`，全部强制 `visibility: private`。已有同一来源 ID 不重复写入。

## 方式 B：使用授权 API

```powershell
$env:MEMOS_TOKEN = "在本机安全设置的MemosAccessToken"
node scripts/import-memos.mjs --url "https://memos.example.com"
node scripts/import-memos.mjs --url "https://memos.example.com" --apply
Remove-Item Env:MEMOS_TOKEN
```

支持 Memos 近期 API 的 `/api/memos`，并兼容旧版 `/api/v1/memos` 路由；仅在首个接口返回 404/405 时回退。认证为 Bearer token，不写入仓库；非 localhost 要求 HTTPS，禁止跨源重定向。分页遵循 nextPageToken，最多读取 50 页。

## 数据映射

| Memos 字段 | Markdown |
| --- | --- |
| content | 原始正文 |
| name / id | source_id（用于重复导入去重） |
| createTime | created |
| visibility | source_visibility（仅作为来源说明） |
| tags | tags |
| property.title | title |

无论 Memos 原本是 PUBLIC/PRIVATE/PROTECTED/SPACE，导入结果一律为 private。图片和附件不自动下载，也不会尝试打开外链。

## 限制

- Memos API 可能随版本变化，部分旧实例需在当前版本的 API 文档中核对访问范围。
- 导入覆盖只考虑来源 ID：同 ID 在 Memos 里后来编辑过，旧 Markdown 不自动覆盖。建议后续提供变更对比工具。
- 不提供逆向回写，避免 Obsidian 与 Memos 两处修改造成数据冲突。

官方 API：https://usememos.com/docs/api/latest/memoservice/ListMemos
