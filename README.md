# FocusFlow

FocusFlow 是一个本地可用的个人项目推进系统。第一阶段不接登录、不接付费、不接云数据库，所有数据保存在浏览器 `localStorage`。

## 技术栈

- React
- Vite
- Tailwind CSS
- localStorage

## 第一阶段已完成

- 新增 Todo
- 删除 Todo
- 勾选完成
- 编辑 Todo 标题、目标、项目、状态、优先级、预计时间、实际时间、卡点和复盘
- 每个 Todo 添加、勾选、编辑、删除详细步骤
- 每个 Todo 添加、删除今日时间块
- 创建项目
- 删除项目
- 编辑项目名称、目标、截止日期、进度、状态和颜色
- Todo 归属到项目
- 项目阶段节点添加、勾选、删除
- 今日时间轴
- 项目时间轴
- 自动分析
- 每日复盘
- 刷新后本地数据保留

## APP 雏形能力

- PWA manifest
- Service worker 离线缓存壳
- APP 图标
- 手机底部导航
- Settings 设置页
- 本地数据导出备份
- 从 JSON 备份恢复数据
- 一键重置本地数据
- 本地 HTTP 启动脚本，方便浏览器识别为可安装 APP
- 第三阶段产品骨架说明：`APP_PRODUCT_STAGE3.md`
- Android 原生 APP 工程：`android/`
- 真正 APK 打包说明：`REAL_NATIVE_APP.md`
- APK 构建脚本：`Build-FocusFlow-Android-APK.cmd`
- 不装 Android Studio 的云端打包说明：`CLOUD_BUILD_ANDROID.md`

## 真正手机 APP

当前项目已经接入 Capacitor，可以打包成 Android APK。

流程：

```text
React APP -> Vite build -> Capacitor -> Android native project -> APK
```

先安装 Android Studio，然后双击：

```text
Build-FocusFlow-Android-APK.cmd
```

成功后 APK 位于：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

详细说明见：

```text
REAL_NATIVE_APP.md
```

## 运行

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

构建：

```bash
npm run build
```

本地打开：

```text
双击 Start-FocusFlow-React.cmd
```

这个方式会启动本地 HTTP 服务：

```text
http://127.0.0.1:5190/
```

如果只想快速查看，也可以直接用 Chrome 打开：

```text
dist/index.html
```

注意：PWA 安装和离线缓存需要通过 `http://127.0.0.1:5190/` 或未来上线地址打开，直接打开 `dist/index.html` 时浏览器不会启用 service worker。

## 手机安装

### 局域网测试

1. 电脑和手机连接同一个 Wi-Fi。
2. 双击 `Start-FocusFlow-React-Mobile.cmd`。
3. 黑色窗口里会显示手机链接。
4. 在手机浏览器打开这个链接。

### 公开测试版

查看 `DEPLOY_PUBLIC.md`。公开测试版部署后，手机可以直接打开公网链接，不需要和电脑在同一个 Wi-Fi。

## 目录

```text
src/
  App.jsx
  main.jsx
  components/
  data/
  hooks/
  styles/
  utils/
```
