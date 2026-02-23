# NexFlow OA 项目启动指南

本项目分为前端 (React + Vite) 和后端 (Python + FastAPI) 两个独立的部分。在开发和测试时，请开启两个不同的终端标签签页分别运行它们。

## 1. 启动后端 (Backend)

后端项目位于 `backend` 目录下，并使用 Python 虚拟环境运行。

**在终端 (PowerShell) 中执行以下命令：**

```powershell
# 1. 进入后端目录
cd backend

# 2. 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 3. 启动 FastAPI 接口服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> **成功标志**：看到 `Application startup complete.` 字样，表示后端已成功运行在 `http://localhost:8000`。您可以通过访问 `http://localhost:8000/docs` 查看 API 接口文档。

---

## 2. 启动前端 (Frontend)

前端项目位于 `frontend` 目录下，基于 Node.js 和 Vite 构建。

**打开另一个新的终端 (PowerShell)，执行以下命令：**

```powershell
# 1. 进入前端目录
cd frontend

# 2. 安装依赖 (如果已有 node_modules 可跳过此步)
npm install

# 3. 启动 Vite 本地开发服务器
npm run dev
```

> **成功标志**：看到 `VITE v7.x.x ready in xxx ms`，表明前端已正常启动。在浏览器访问 `http://localhost:5173/` 即可进入系统。

---

## 3. 默认登录账号

如果需要登录系统测试，请使用内置的超级管理员账号：

*   **账号**：`admin`
*   **密码**：`admin123`
