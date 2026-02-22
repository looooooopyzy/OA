# OA 系统开发进度记录

> **AI 工作指引**：每次开始工作前，请先阅读本文档了解当前进度，完成工作后更新本文档。
> 同时必须阅读 `docs/constraints.md` 确保符合项目约束。

---

## 当前状态：Phase 1 — 准备中

---

## 进度日志

### 2026-02-21 — 项目初始化 & 规划

**已完成 ✅**
1. 产品需求分析与讨论
2. 确认技术栈：React + TypeScript + Zustand + Ant Design (前端) / FastAPI + SQLAlchemy + Pydantic (后端) / PostgreSQL (数据库)
3. 确认架构方案：微内核（底座 + 可插拔子模块）
4. 输出产品设计文档 `docs/product_design.md`
5. 输出实施计划（v2），涵盖后端 / 前端 / 审批流 / 多端策略
6. 确认多端策略：Web 优先，后续 React Native 移动端
7. 确认审批流设计：仿致远 OA 可视化拖拽设计器
8. 创建项目约束文档 `docs/constraints.md`
9. 创建本进度记录文档

**下一步 🔜**
1. 搭建开发环境（Docker + Python venv + Node.js）
2. 创建 `docker-compose.yml`（PostgreSQL + Redis）
3. 初始化后端项目结构 (`backend/`)
4. 初始化前端项目结构 (`frontend/`)
5. 实现后端微内核核心（config, database, security, plugin_engine）

---

## Phase 分解概览

### Phase 1：底座搭建 ⬅ 当前阶段
- [ ] 开发环境搭建（Docker / Python / Node.js）
- [ ] 后端微内核底座（配置管理 / 数据库连接 / 认证鉴权 / 插件引擎 / 事件总线）
- [ ] 数据库模型 & 迁移（User / Role / Permission / Menu / Department / Plugin）
- [ ] 核心 API（认证 / 用户 / 角色 / 菜单 / 部门 / 插件管理）
- [ ] 前端项目初始化 & 设计系统
- [ ] OS 风格桌面布局（Sidebar / TopBar / Launchpad / ContentView）
- [ ] 前端微内核（动态模块加载 / 路由注册）
- [ ] 登录页面 & Token 管理
- [ ] 工作台 Dashboard
- [ ] 系统管理页面（用户 / 角色 / 部门 / 菜单）
- [ ] 插件管理页面 & Launchpad
- [ ] 示例插件（公告管理）完整前后端

### Phase 2：审批流引擎
- [ ] 后端审批流运行时（流程定义 / 实例 / 任务 / 条件求值）
- [ ] 审批流数据模型 & 迁移
- [ ] 审批流 API（定义 CRUD / 发起 / 审批 / 拒绝 / 转交 / 加签）
- [ ] 前端可视化流程设计器（AntV X6 画布 / 节点拖拽 / 属性面板）
- [ ] 审批流前端页面（流程列表 / 我的审批 / 审批详情）
- [ ] 预置流程模板（请假 / 报销 / 合同审批）

### Phase 3：通知中心 + 文件服务
- [ ] 通知模型 & API
- [ ] WebSocket 实时推送
- [ ] 前端通知组件（铃铛 / 抽屉 / Toast）
- [ ] 文件上传 / 存储 / 预览服务

### Phase 4：移动端
- [ ] 共享层抽离（stores / services / types → packages/shared）
- [ ] React Native 项目初始化
- [ ] 移动端 UI 适配

### Phase 5：更多业务插件
- [ ] 日程管理插件
- [ ] 会议管理插件
- [ ] 通讯录插件

---

## 关键决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-02-21 | 选用 PostgreSQL | JSON 字段支持好，适合存储流程定义 |
| 2026-02-21 | 选用 Ant Design 5 | 中后台组件丰富，贴合 OA 场景 |
| 2026-02-21 | 审批流设计器用 AntV X6 | AntV 生态成熟，与 Ant Design 风格一致 |
| 2026-02-21 | 多端用 React Native | 与 React Web 共享逻辑层和 TypeScript 类型 |
