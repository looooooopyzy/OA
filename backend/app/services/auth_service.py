"""认证服务 — 登录、注册、Token 刷新。"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import AppException, NotFoundException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User, Role, Permission, Menu
from app.schemas.auth import TokenResponse


class AuthService:
    """认证业务逻辑。"""

    @staticmethod
    async def login(
        db: AsyncSession, username: str, password: str
    ) -> TokenResponse:
        """用户登录，返回 Token 对。"""
        result = await db.execute(
            select(User).where(User.username == username)
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            raise AppException(code=401, message="用户名或密码错误")
        if not user.is_active:
            raise AppException(code=403, message="用户已被禁用")

        token_data = {"sub": str(user.id)}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )

    @staticmethod
    async def refresh(db: AsyncSession, refresh_token: str) -> TokenResponse:
        """通过 Refresh Token 换取新的 Token 对。"""
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise AppException(code=401, message="无效的 Refresh Token")

        user_id = payload.get("sub")
        result = await db.execute(
            select(User).where(User.id == int(user_id))
        )
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise AppException(code=401, message="用户不存在或已被禁用")

        token_data = {"sub": str(user.id)}
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )

    @staticmethod
    async def get_user_info(db: AsyncSession, user_id: int) -> dict:
        """获取当前用户完整信息（含权限和菜单树）。"""
        result = await db.execute(
            select(User)
            .options(
                selectinload(User.roles)
                .selectinload(Role.permissions),
                selectinload(User.roles)
                .selectinload(Role.menus),
            )
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundException("用户不存在")

        # 收集角色、权限、菜单
        role_names = []
        permission_codes = set()
        menu_ids = set()

        for role in user.roles:
            role_names.append(role.code)
            for perm in role.permissions:
                permission_codes.add(perm.code)
            for menu in role.menus:
                menu_ids.add(menu.id)

        # 查询完整菜单树
        menus_result = await db.execute(
            select(Menu).where(Menu.id.in_(menu_ids)).order_by(Menu.sort_order)
        )
        menus = menus_result.scalars().all()
        menu_list = [
            {
                "id": m.id,
                "name": m.name,
                "path": m.path,
                "icon": m.icon,
                "parent_id": m.parent_id,
                "sort_order": m.sort_order,
                "menu_type": m.menu_type,
                "plugin_id": m.plugin_id,
            }
            for m in menus
        ]

        return {
            "id": user.id,
            "username": user.username,
            "real_name": user.real_name,
            "avatar": user.avatar,
            "roles": role_names,
            "permissions": list(permission_codes),
            "menus": menu_list,
        }
