# 插件开发指南

## 快速开始

1. 复制 `_template/` 目录并重命名为你的插件名（如 `my-plugin/`）
2. 修改 `manifest.json` 中的 `name`、`displayName` 等信息
3. 在 `router.py` 中实现你的 API 路由
4. 重启后端服务，插件将被自动发现并加载

## 目录结构

```
my-plugin/
├── manifest.json    # 插件元数据（必须）
├── router.py        # FastAPI APIRouter（必须，导出名为 router 的变量）
├── models.py        # SQLAlchemy ORM 模型（可选）
├── schemas.py       # Pydantic 校验模型（可选）
├── services.py      # 业务逻辑（可选）
└── events.py        # 事件监听（可选）
```

## 路由挂载

插件路由会被自动挂载到: `POST /api/v1/plugins/{plugin-name}/...`

## 注意事项

- 目录名以 `_` 开头的会被忽略（如 `_template`）
- `manifest.json` 中的 `name` 必须与目录名一致
- `router.py` 必须导出一个名为 `router` 的 `APIRouter` 实例
