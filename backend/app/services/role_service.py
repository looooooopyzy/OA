"""角色服务 — 角色 CRUD。"""

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictException, NotFoundException
import uuid
from app.models.user import Role, Permission, Menu, Department
from app.schemas.user import RoleCreate, RoleUpdate


class RoleService:
    """角色管理业务逻辑。"""

    @staticmethod
    async def get_list(
        db: AsyncSession, page: int = 1, page_size: int = 20, keyword: Optional[str] = None
    ) -> tuple[list[Role], int]:
        """分页查询角色列表。"""
        query = select(Role).options(selectinload(Role.departments))
        if keyword:
            query = query.where(Role.name.ilike(f"%{keyword}%"))

        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        return list(result.scalars().all()), total

    @staticmethod
    async def get_by_id(db: AsyncSession, role_id: int) -> Role:
        """根据 ID 获取角色。"""
        result = await db.execute(
            select(Role)
            .options(
                selectinload(Role.permissions),
                selectinload(Role.menus),
                selectinload(Role.departments),
            )
            .where(Role.id == role_id)
        )
        role = result.scalar_one_or_none()
        if not role:
            raise NotFoundException("角色不存在")
        return role

    @staticmethod
    async def create(db: AsyncSession, data: RoleCreate) -> Role:
        """创建角色。"""
        if not data.code:
            data.code = f"role_{uuid.uuid4().hex[:8]}"

        existing = await db.execute(
            select(Role).where(Role.code == data.code)
        )
        if existing.scalar_one_or_none():
            raise ConflictException("角色代码已存在")

        role = Role(
            name=data.name,
            code=data.code,
            description=data.description,
            data_scope=data.data_scope,
        )

        if data.department_ids:
            depts = await db.execute(
                select(Department).where(Department.id.in_(data.department_ids))
            )
            role.departments = list(depts.scalars().all())

        if data.permission_ids:
            perms = await db.execute(
                select(Permission).where(Permission.id.in_(data.permission_ids))
            )
            role.permissions = list(perms.scalars().all())

        if data.menu_ids:
            menus = await db.execute(
                select(Menu).where(Menu.id.in_(data.menu_ids))
            )
            role.menus = list(menus.scalars().all())

        db.add(role)
        await db.flush()
        return role

    @staticmethod
    async def update(db: AsyncSession, role_id: int, data: RoleUpdate) -> Role:
        """更新角色。"""
        role = await RoleService.get_by_id(db, role_id)
        update_data = data.model_dump(exclude_unset=True)

        if "permission_ids" in update_data:
            perm_ids = update_data.pop("permission_ids")
            if perm_ids is not None:
                perms = await db.execute(
                    select(Permission).where(Permission.id.in_(perm_ids))
                )
                role.permissions = list(perms.scalars().all())

        if "menu_ids" in update_data:
            menu_ids = update_data.pop("menu_ids")
            if menu_ids is not None:
                menus = await db.execute(
                    select(Menu).where(Menu.id.in_(menu_ids))
                )
                role.menus = list(menus.scalars().all())

        if "department_ids" in update_data:
            dept_ids = update_data.pop("department_ids")
            if dept_ids is not None:
                depts = await db.execute(
                    select(Department).where(Department.id.in_(dept_ids))
                )
                role.departments = list(depts.scalars().all())

        for field, value in update_data.items():
            setattr(role, field, value)

        await db.flush()
        return role

    @staticmethod
    async def delete(db: AsyncSession, role_id: int) -> None:
        """删除角色。"""
        role = await RoleService.get_by_id(db, role_id)
        await db.delete(role)
