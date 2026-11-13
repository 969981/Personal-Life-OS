# 私人相册

相册遵循两份材料分离：`vault/Photos/` 保存 Markdown 元数据；`vault/Photo-Media/` 保存重新编码的 WebP。二者都在当前 Public 仓库的 .gitignore 内。

## 导入照片

先安装网页依赖：

```bash
npm install --prefix apps/web
```

然后导入：

```bash
npm run photos:import -- --file "/path/to/picture.jpg" --title "雨后的街道" --date 2026-11-13
```

图像被使用 sharp 重新编码成最长边不大于 1600px 的 WebP，默认不保留原始 EXIF / GPS 元数据，原始文件不会被修改。默认 visibility: private。相同原图内容重复导入不会生成第二个文件。

本机私密预览：

```bash
npm run dev:private
```

之后访问 http://127.0.0.1:4321/photos 。该模式只用于本地电脑，不会自动推送到 GitHub 或部署公网。

## 发布边界

1. 默认 `npm run build` 只复制 visibility: public 的照片对应 WebP 到临时的 `apps/web/public/_gallery/`。
2. `local-only` 永远不能复制到任何生产构建。
3. 私密发布需先认证保护完整，再显式设置 `LIFE_OS_PRIVATE_BUILD=I_HAVE_PROTECTED_THE_SITE`。
4. 上述临时 _gallery 文件夹已经被 Git 忽略，构建结束后仍需检查 dist 及临时静态目录是否含真实私人内容。
5. 不能仅通过隐藏 `/photos` 页面保护图像：图片 URL 本身也必须处于身份验证后面。

## 限制

- 当前仅导入静态照片，不支持 Live Photo、HEIC 视频伴随内容和 EXIF 时间自动分类。
- 文件名由原图内容哈希生成，用于去重；不暴露原始拍摄位置。
- 后期可增加相册分组、照片描述、幻灯片与增量导入。
