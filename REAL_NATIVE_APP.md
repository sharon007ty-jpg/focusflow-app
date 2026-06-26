# FocusFlow 真正 APP 打包说明

现在项目已经从 PWA 继续升级为 Capacitor 原生 APP 工程。

## 已完成

- 已安装 Capacitor：
  - `@capacitor/core`
  - `@capacitor/cli`
  - `@capacitor/android`
- 已新增原生配置：`capacitor.config.json`
- 已生成 Android 原生工程：`android/`
- 已把 React/Vite 构建结果复制到 Android WebView 资源中
- 已新增 APK 构建脚本：`Build-FocusFlow-Android-APK.cmd`

## 当前真实状态

这已经不是“网页添加到主屏幕”的路线了。

现在的结构是：

```text
React APP -> Vite build -> Capacitor -> Android native project -> APK
```

## 为什么现在还没有 APK

这台电脑目前没有检测到：

- Java / JDK
- Android SDK

所以已经可以生成 Android 工程，但还不能在这台电脑上直接编译出 `.apk`。

## 你需要安装

1. 安装 Android Studio：

```text
https://developer.android.com/studio
```

2. 安装时勾选：

```text
Android SDK
Android SDK Platform
Android Virtual Device
```

3. 安装完成后打开 Android Studio 一次，让它把 SDK 下载完。

## 生成 APK

安装好 Android Studio 后，双击：

```text
Build-FocusFlow-Android-APK.cmd
```

成功后 APK 在：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 手机安装

1. 把 `app-debug.apk` 发到手机。
2. 手机上的文件管理器打开它。
3. 允许“安装未知来源应用”。
4. 安装 FocusFlow。

## 之后要上架

上架 Google Play 需要生成 release AAB：

```bash
cd android
gradlew.bat bundleRelease
```

上架前还需要：

- 正式应用图标
- 隐私政策
- 签名证书
- 包名确认
- 数据存储说明
- 应用截图
