# OA 系统项目约束文档

> ⚠️ **强制要求**：AI 在每次开始任何开发工作前，**必须先阅读本文档**，确保所有产出符合以下约束。

---

## 1. 架构约束

### 1.1 微内核原则
- **底座与插件严格解耦**：底座代码不得引用任何插件的具体实现，只能通过插件协议（manifest.json + 统一接口）交互
- **插件独立性**：每个插件必须是一个独立目录，包含完整的 manifest.json、路由、模型、Schema
- **新增功能必须以插件形式**：除底座核心模块外，所有业务功能均以插件方式接入
- **禁止硬编码插件**：底座启动时通过扫描 `plugins/` 目录自动发现插件，不得在代码中硬编码插件列表

### 1.2 分层约束
```
API 层（router） → 服务层（service） → 数据层（model/repository）
```
- API 层不得直接访问数据库，必须通过服务层
- 服务层不得直接返回 HTTP 响应，只返回数据或抛异常
- 数据层不得包含业务逻辑

### 1.3 多端复用
- TypeScript 类型定义、状态管理 Store、API 调用 Service 必须设计为可跨端复用
- 前端代码中禁止使用 `window` / `document` 等浏览器专有 API 的地方需用平台检测包裹，或放在平台特定层
- API 设计必须是端无关的，不得为特定端做特殊处理

---

## 2. 技术栈约束

### 2.1 后端
| 项目 | 要求 |
|------|------|
| 语言 | Python 3.11+ |
| 框架 | FastAPI（async） |
| ORM | SQLAlchemy 2.0+（async mode） |
| 校验 | Pydantic v2 |
| 数据库 | PostgreSQL 15+ |
| 迁移 | Alembic（async） |
| 认证 | JWT（python-jose） |
| 密码 | bcrypt（passlib） |
| 缓存 | Redis（预留） |

### 2.2 前端
| 项目 | 要求 |
|------|------|
| 语言 | TypeScript（strict mode） |
| 框架 | React 18+ |
| 构建 | Vite 5+ |
| UI 库 | Ant Design 5.x |
| 状态管理 | Zustand |
| 路由 | React Router v6 |
| HTTP | Axios |
| 流程图 | @antv/x6 |

### 2.3 禁止使用
- ❌ 不得使用 Redux、MobX 等其他状态管理库
- ❌ 不得使用 TailwindCSS（除非用户明确要求）
- ❌ 不得使用 jQuery 或其他 DOM 操作库
- ❌ 不得使用 Class Component（统一使用 Function Component + Hooks）
- ❌ 后端不得使用同步数据库驱动（必须 async）
- ❌ 不得在系统全局 Python 环境中安装任何依赖，**必须使用虚拟环境**

---

## 3. 代码规范

### 3.1 命名规范
| 场景 | 规范 | 示例 |
|------|------|------|
| Python 文件/变量/函数 | snake_case | `user_service.py`, `get_user_by_id()` |
| Python 类 | PascalCase | `UserService`, `WorkflowEngine` |
| TS 文件 | kebab-case | `auth-store.ts`, `api-client.ts` |
| TS 组件文件 | PascalCase | `UserManagement.tsx`, `Sidebar.tsx` |
| TS 变量/函数 | camelCase | `getUserList()`, `isLoading` |
| TS 类型/接口 | PascalCase | `UserInfo`, `PluginManifest` |
| 数据库表 | snake_case 复数 | `users`, `workflow_definitions` |
| API 路径 | kebab-case | `/api/v1/workflow-definitions` |

### 3.2 文件组织
- 单个文件不得超过 **400 行**，超过必须拆分
- 每个模块必须有 `__init__.py`（Python）或 `index.ts`（TypeScript）作为入口
- 前端组件按功能域组织，不按类型组织（❌ `components/buttons/` → ✅ `pages/user-management/`）

### 3.3 注释要求
- 所有 Python 函数和类必须有 **docstring**
- 所有 TypeScript 公共函数和接口必须有 **JSDoc 注释**
- 复杂业务逻辑处必须有行内注释解释意图
- 禁止无意义注释（如 `# 获取用户` → `get_user()`）

---

## 4. API 规范

### 4.1 响应格式
所有 API 统一返回以下格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2026-02-21T22:30:00Z"
}
```

### 4.2 错误码
| code | 含义 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 4.3 分页参数
```
GET /api/v1/users?page=1&page_size=20&keyword=张
```
分页响应：
```json
{
  "code": 200,
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

### 4.4 版本管理
- 所有 API 路径必须包含版本号前缀 `/api/v1/`
- 破坏性变更必须升级版本号

---

## 5. 安全约束

- 所有密码必须 bcrypt 哈希存储，**禁止明文**
- JWT 密钥必须从环境变量读取，**禁止硬编码**
- 所有用户输入必须经过 Pydantic 校验，**禁止直接拼接 SQL**
- 前端 Token 存储在 `localStorage`，并通过 Axios 拦截器自动注入 Header
- 401 响应必须自动清除 Token 并跳转登录页
- CORS 配置必须明确指定允许的源，生产环境**禁止 `*`**

---

## 6. 数据库约束

- 所有表必须有 `id`（UUID 或自增）、`created_at`、`updated_at` 字段
- 使用 Alembic 管理迁移，**禁止手动修改数据库结构**
- 外键必须设置 `ondelete` 策略（CASCADE / SET NULL）
- JSON 字段（如流程定义）必须有对应的 Pydantic Schema 校验
- 批量操作必须使用事务

---

## 7. 前端约束

### 7.1 性能要求
- 首屏加载 < 3 秒（生产构建）
- 路由切换使用 `React.lazy` + `Suspense` 懒加载
- 列表数据必须分页加载，单次不超过 100 条
- 审批流画布操作保持 60fps

### 7.2 用户体验
- 所有异步操作必须有 Loading 状态
- 所有表单提交必须有防重复提交机制（按钮 disable）
- 所有删除操作必须有二次确认
- 错误信息必须友好展示，禁止直接展示堆栈
- 页面切换必须有过渡动画

### 7.3 样式约束
- 主题色通过 CSS 变量 / Ant Design Token 统一管理
- 禁止使用行内样式（inline style），除动态计算值外
- 间距、字号等必须使用设计系统的 token，禁止 magic number

---

## 8. Git 约束

### 8.1 分支规范
```
main          — 生产分支
develop       — 开发主分支
feature/*     — 功能分支
bugfix/*      — 修复分支
release/*     — 发布分支
```

### 8.2 Commit 规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具
```

---

## 9. 工作流程约束（AI 专用，最高优先级）

> 🛑 **对于 AI 助手的强制命令**：本条规则拥有最高执行优先级。你必须在一个功能开发周期的末尾主动拦截并执行操作！

1. **开始工作前**：必须阅读 `docs/constraints.md`（本文档）和 `docs/progress_log.md`
2. **【核心约束】完成任何一个子步骤后（例如完成了一个功能的 CRUD，或结束了一个 Task Boundary）**：
   - 你**必须**主动打开 `docs/progress_log.md`
   - 将已完成的工作勾选（改成 `[x]`）
   - 在日志区添加当天的日期，并记录 "已完成" 和 "下一步" 的内容
   - 你绝不能等待用户提醒你更新进度日志，这是你的自动职责。
3. **新增文件**：必须符合上述命名规范和目录结构
4. **修改底座**：必须确认不会破坏现有插件的兼容性
5. **新增依赖**：必须说明原因，不得引入与已有依赖功能重叠的库
6. **代码审查**：每次修改超过 5 个文件时，需要列出所有修改文件的清单

---

## 10. 环境隔离约束

- **所有 Python 开发必须在虚拟环境（venv）中进行**，禁止使用系统全局 Python 安装依赖
- 虚拟环境目录为 `backend/venv/`，已加入 `.gitignore`
- 所有 `pip install` / `alembic` / `uvicorn` 等命令必须在激活虚拟环境后执行
- 前端依赖通过 `npm install` 安装在项目本地 `node_modules/`，不得使用 `-g` 全局安装
