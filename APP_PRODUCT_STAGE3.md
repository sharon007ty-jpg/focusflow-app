# FocusFlow APP 产品雏形阶段

## 当前定位

FocusFlow 现在是一个本地优先的 PWA 产品雏形。它不是普通 Todo List，而是围绕项目推进、每日执行、时间安排、复盘和分析形成闭环。

## 已整理的数据模型

核心模型统一在 `src/data/schema.js`：

- Workspace：本地工作区和未来商业化扩展位
- Project：项目、目标、截止日期、进度、阶段节点
- Todo：每日任务、项目归属、优先级、状态、耗时、目标
- Step：Todo 的详细步骤
- TimelineItem：Todo 的时间块
- Review：按日期保存的每日复盘

当前本地存储 key：

```text
focusflow.react.local.v2
```

兼容旧 key：

```text
focusflow.react.local.v1
```

## 已整理的产品模块

- Today：每日任务、项目筛选、任务详情、今日时间块
- Projects：项目列表、项目详情、截止日期、阶段节点
- Timeline：今日时间块、项目时间轴
- Analytics：完成率、步骤完成、卡点、超时、明日建议
- Review：每日复盘
- Settings：安装、备份、恢复、重置、商业化扩展口

## 体验打磨

- 删除 Todo 前确认
- 删除 Project 前确认
- 创建、保存、删除后有 Toast 提示
- 空状态提供直接行动按钮
- 手机端详情面板改成弹层
- 手机端底部导航覆盖六个产品模块
- 公开测试版默认空数据，避免泄露私人内容

## 已预留但未接入的商业化能力

- 账号登录
- 云同步
- 订阅付费
- AI 分析

这些能力目前只保留在 Workspace 模型和 Settings 页面里，不连接真实外部服务。

## 下一阶段建议

1. 把页面拆成 `src/pages/`，让每个产品模块独立维护。
2. 接入 IndexedDB，替代 localStorage，提升数据容量和可靠性。
3. 增加任务模板和项目模板。
4. 加入真实 AI 分析前，先沉淀本地规则分析。
5. 上线公开测试链接，收集 3-5 个真实用户反馈。
