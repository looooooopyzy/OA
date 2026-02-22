"""菜单服务 — 菜单树 CRUD。"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.user import Menu
from app.schemas.user import MenuCreate, MenuUpdate


class MenuService:
    """菜单管理业务逻辑。"""

    @staticmethod
    async def get_tree(db: AsyncSession) -> list[dict]:
        """获取完整菜单树。"""
        result = await db.execute(
            select(Menu).order_by(Menu.sort_order)
        )
        menus = result.scalars().all()
        return MenuService._build_tree(menus)

    @staticmethod
    def _build_tree(menus: list, parent_id: Optional[int] = None) -> list[dict]:
        """递归构建菜单树。"""
        tree = []
        for menu in menus:
            if menu.parent_id == parent_id:
                node = {
                    "id": menu.id,
                    "name": menu.name,
                    "path": menu.path,
                    "icon": menu.icon,
                    "parent_id": menu.parent_id,
                    "sort_order": menu.sort_order,
                    "is_visible": menu.is_visible,
                    "permission_code": menu.permission_code,
                    "plugin_id": menu.plugin_id,
                    "menu_type": menu.menu_type,
                    "children": MenuService._build_tree(menus, menu.id),
                }
                tree.append(node)
        return tree

    @staticmethod
    async def create(db: AsyncSession, data: MenuCreate) -> Menu:
        """创建菜单。"""
        menu = Menu(**data.model_dump())
        db.add(menu)
        await db.flush()
        return menu

    @staticmethod
    async def update(db: AsyncSession, menu_id: int, data: MenuUpdate) -> Menu:
        """更新菜单。"""
        result = await db.execute(select(Menu).where(Menu.id == menu_id))
        menu = result.scalar_one_or_none()
        if not menu:
            raise NotFoundException("菜单不存在")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(menu, field, value)

        await db.flush()
        return menu

    @staticmethod
    async def delete(db: AsyncSession, menu_id: int) -> None:
        """删除菜单（级联删除子菜单）。"""
        result = await db.execute(select(Menu).where(Menu.id == menu_id))
        menu = result.scalar_one_or_none()
        if not menu:
            raise NotFoundException("菜单不存在")
        await db.delete(menu)
