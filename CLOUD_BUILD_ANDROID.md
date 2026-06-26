# 不装 Android Studio，云端生成 APK

如果电脑是虚拟机，装不了 Android Studio，可以用 GitHub Actions 在云端生成 APK。

## 你需要准备

- 一个 GitHub 账号
- 一个新的 GitHub 仓库
- 把 `outputs/focusflow-project` 这个项目上传到仓库根目录

## 已经准备好的文件

项目里已经有：

```text
.github/workflows/android-debug-apk.yml
```

这个文件会自动完成：

```text
npm ci
npm run native:sync
gradlew assembleDebug
上传 app-debug.apk
```

## 操作步骤

1. 打开 GitHub，新建一个仓库，例如：

```text
focusflow-app
```

2. 上传 `outputs/focusflow-project` 里面的全部文件。

注意：上传的是 `focusflow-project` 文件夹里面的内容，不是外层 `outputs` 文件夹。

3. 打开仓库页面，点上方：

```text
Actions
```

4. 左侧选择：

```text
Build Android APK
```

5. 点：

```text
Run workflow
```

6. 等构建完成后，进入这次运行记录。

7. 页面底部会出现：

```text
Artifacts
```

8. 下载：

```text
FocusFlow-debug-apk
```

9. 解压后得到：

```text
app-debug.apk
```

## 手机安装

1. 把 `app-debug.apk` 发到安卓手机。
2. 手机打开文件。
3. 允许“安装未知来源应用”。
4. 安装 FocusFlow。

## 说明

这个 APK 是 debug 版本，适合自己测试和发给少量朋友试用。

如果以后要上架 Google Play，需要生成 release AAB，并配置签名证书。
