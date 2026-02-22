# OA 系统 — 开发环境搭建指南

---

## 必备软件

| 软件 | 版本要求 | 用途 |
|------|---------|------|
| **Docker Desktop** | 最新版 | 运行 PostgreSQL + Redis 容器 |
| **Python** | 3.11+ | 后端运行时 |
| **Node.js** | 18 LTS 或 20 LTS | 前端构建 |
| **npm** | 9+ (随 Node 安装) | 前端包管理 |
| **Git** | 最新版 | 版本控制 |

---

## 一键环境检查

在终端中运行以下命令确认环境：

```powershell
# 检查 Docker
docker --version

# 检查 Python
python --version

# 检查 Node.js
node --version

# 检查 npm
npm --version

# 检查 Git
git --version
```

---

## 搭建步骤

> ⚠️ **强制要求**：所有 Python 相关操作（pip install / alembic / uvicorn 等）**必须在虚拟环境中执行**，禁止污染系统全局 Python 环境。前端依赖也禁止全局安装（不使用 `npm install -g`）。

### 1. 启动数据库容器

```powershell
cd c:\Users\sky\Desktop\OA
docker-compose up -d
```

这将启动：
- **PostgreSQL 15** — 端口 `5432`，用户 `oa_admin`，密码 `oa_password`，数据库 `oa_db`
- **Redis 7** — 端口 `6379`

### 2. 后端环境

```powershell
cd c:\Users\sky\Desktop\OA\backend

# 创建 Python 虚拟环境
python -m venv venv

# 激活虚拟环境 (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# 安装依赖
pip install -r requirements.txt

# 复制环境变量
copy ..\.env.example .env

# 运行数据库迁移
alembic upgrade head

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

验证：浏览器访问 `http://localhost:8000/docs` → 看到 Swagger 文档。

### 3. 前端环境

```powershell
cd c:\Users\sky\Desktop\OA\frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

验证：浏览器访问 `http://localhost:5173` → 看到登录页面。

---

## 环境变量 (.env)

```env
# 数据库
DATABASE_URL=postgresql+asyncpg://oa_admin:oa_password@localhost:5432/oa_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# 应用
APP_NAME=OA协同办公系统
APP_ENV=development
CORS_ORIGINS=http://localhost:5173

# 默认管理员
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

---

## 端口占用

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 (Vite) | 5173 | React 开发服务器 |
| 后端 (Uvicorn) | 8000 | FastAPI 服务器 |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |

---

## 常见问题

| 问题 | 解决方案 |
|------|---------|
| Docker 未启动 | 打开 Docker Desktop 等待启动完成 |
| 端口被占用 | `netstat -ano \| findstr :5432` 查找占用进程 |
| Python venv 激活失败 | PowerShell 执行 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| npm install 慢 | 设置淘宝镜像 `npm config set registry https://registry.npmmirror.com` |
