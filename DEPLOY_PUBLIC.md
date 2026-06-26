# FocusFlow 公开测试版发布说明

目标：把 FocusFlow 发布成一个公开网页 APP 链接，手机可以直接打开，并添加到主屏幕。

## 你需要知道的事

- 当前版本没有登录、没有云数据库。
- 数据保存在每台设备自己的浏览器里。
- 别人打开公开链接时，看到的是一个空系统，不会看到你的私人数据。
- 你的电脑本地数据仍然只存在你的浏览器 localStorage 里。

## 推荐方式：Netlify Drop

这个方式最适合第一次公开测试，不需要命令行部署。

1. 先运行构建：

```bash
npm run build
```

2. 打开 Netlify Drop：

```text
https://app.netlify.com/drop
```

3. 把 `dist` 文件夹拖进去。

4. Netlify 会生成一个公开链接，类似：

```text
https://xxxxxx.netlify.app
```

5. 手机打开这个链接。

6. Android Chrome：右上角菜单，选择“安装应用”或“添加到主屏幕”。

7. iPhone Safari：分享按钮，选择“添加到主屏幕”。

## 备选方式：Vercel

适合以后接 GitHub 自动部署。

1. 把 `outputs/focusflow-project` 推到 GitHub 仓库。
2. 在 Vercel 导入仓库。
3. Framework 选择 `Vite`。
4. Build Command 使用：

```bash
npm run build
```

5. Output Directory 使用：

```text
dist
```

## 发布前检查

运行：

```bash
npm run build
```

确认 `dist` 中至少包含：

```text
index.html
manifest.webmanifest
sw.js
icon-192.png
icon-512.png
assets/
```

## 后续升级

以后每次改代码后：

1. 重新运行 `npm run build`
2. 重新上传新的 `dist`
3. 手机刷新公开链接
4. 如果仍看到旧版本，关闭 APP 后重新打开，或清除浏览器缓存
