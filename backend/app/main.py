"""OA 系统 FastAPI 应用入口。

微内核架构：
1. 注册核心路由（认证/用户/角色/部门/菜单/插件管理）
2. 自动发现并加载 plugins/ 目录下的所有插件
3. 首次启动时创建默认管理员和基础数据
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api import api_router
from app.core.config import get_settings
from app.core.database import async_session_factory
from app.core.exceptions import register_exception_handlers
from app.core.plugin_engine import plugin_engine
from app.core.security import hash_password
from app.models import Base, User, Role, Menu, Permission
from app.models.user import user_roles, role_menus
from app.core.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


async def seed_default_data() -> None:
    """首次启动时创建默认管理员、admin 角色和系统菜单。"""
    async with async_session_factory() as db:
        # 检查是否已有管理员
        result = await db.execute(
            select(User).where(User.username == settings.admin_username)
        )
        if result.scalar_one_or_none():
            return

        logger.info("首次启动，创建默认数据...")

        # 创建权限
        permissions = [
            Permission(name="用户查看", code="user:read", resource="user", action="read"),
            Permission(name="用户创建", code="user:create", resource="user", action="create"),
            Permission(name="用户编辑", code="user:update", resource="user", action="update"),
            Permission(name="用户删除", code="user:delete", resource="user", action="delete"),
            Permission(name="角色查看", code="role:read", resource="role", action="read"),
            Permission(name="角色管理", code="role:manage", resource="role", action="manage"),
            Permission(name="部门查看", code="dept:read", resource="department", action="read"),
            Permission(name="部门管理", code="dept:manage", resource="department", action="manage"),
            Permission(name="菜单查看", code="menu:read", resource="menu", action="read"),
            Permission(name="菜单管理", code="menu:manage", resource="menu", action="manage"),
            Permission(name="插件管理", code="plugin:manage", resource="plugin", action="manage"),
        ]
        db.add_all(permissions)
        await db.flush()

        # 创建系统菜单
        system_dir = Menu(
            name="系统管理", path=None, icon="SettingOutlined",
            sort_order=100, menu_type="directory",
        )
        db.add(system_dir)
        await db.flush()

        system_menus = [
            Menu(name="用户管理", path="/system/users", icon="UserOutlined",
                 parent_id=system_dir.id, sort_order=1, permission_code="user:read"),
            Menu(name="角色管理", path="/system/roles", icon="TeamOutlined",
                 parent_id=system_dir.id, sort_order=2, permission_code="role:read"),
            Menu(name="部门管理", path="/system/departments", icon="ApartmentOutlined",
                 parent_id=system_dir.id, sort_order=3, permission_code="dept:read"),
            Menu(name="菜单管理", path="/system/menus", icon="MenuOutlined",
                 parent_id=system_dir.id, sort_order=4, permission_code="menu:read"),
            Menu(name="插件管理", path="/system/plugins", icon="AppstoreOutlined",
                 parent_id=system_dir.id, sort_order=5, permission_code="plugin:manage"),
        ]
        db.add_all(system_menus)
        await db.flush()

        # 工作台菜单
        dashboard_menu = Menu(
            name="工作台", path="/dashboard", icon="DashboardOutlined",
            sort_order=0, menu_type="menu",
        )
        db.add(dashboard_menu)
        await db.flush()

        # 创建 admin 角色
        all_menus = [system_dir] + system_menus + [dashboard_menu]
        admin_role = Role(
            name="超级管理员",
            code="admin",
            description="拥有系统全部权限",
            data_scope="all",
            permissions=permissions,
            menus=all_menus,
        )
        db.add(admin_role)
        await db.flush()

        # 创建管理员用户
        admin_user = User(
            username=settings.admin_username,
            hashed_password=hash_password(settings.admin_password),
            real_name="系统管理员",
            is_active=True,
            roles=[admin_role],
        )
        db.add(admin_user)

        await db.commit()
        logger.info("默认数据创建完成: admin / %s", settings.admin_password)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理。"""
    # 启动：建表 + 种子数据 + 加载插件
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await seed_default_data()

    plugin_engine.discover()
    plugin_engine.load_all(app)
    logger.info("已加载 %d 个插件", len(plugin_engine.loaded_plugins))

    yield

    # 关闭
    await engine.dispose()


def create_app() -> FastAPI:
    """创建并配置 FastAPI 应用。"""
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册异常处理器
    register_exception_handlers(app)

    # 注册核心路由
    app.include_router(api_router)

    return app


app = create_app()
