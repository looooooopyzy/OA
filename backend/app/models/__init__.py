"""模型包入口 — 导出所有模型以供 Alembic 发现。"""

from app.models.base import Base
from app.models.user import (
    User,
    Department,
    Role,
    Permission,
    Menu,
    user_roles,
    role_permissions,
    role_menus,
)
from app.models.plugin import PluginRecord

__all__ = [
    "Base",
    "User",
    "Department",
    "Role",
    "Permission",
    "Menu",
    "PluginRecord",
    "user_roles",
    "role_permissions",
    "role_menus",
]
