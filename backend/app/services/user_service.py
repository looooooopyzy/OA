"""用户服务 — 用户 CRUD 操作。"""

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictException, NotFoundException
from app.core.security import hash_password
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """用户管理业务逻辑。"""

    @staticmethod
    async def get_list(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        keyword: Optional[str] = None,
        department_id: Optional[int] = None,
    ) -> tuple[list[User], int]:
        """分页查询用户列表。"""
        query = select(User).options(
            selectinload(User.roles),
            selectinload(User.department),
        )

        if keyword:
            query = query.where(
                User.username.ilike(f"%{keyword}%")
                | User.real_name.ilike(f"%{keyword}%")
            )
        if department_id:
            query = query.where(User.department_id == department_id)

        # 统计总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # 分页
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        users = result.scalars().all()

        return list(users), total

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: int) -> User:
        """根据 ID 获取用户。"""
        result = await db.execute(
            select(User)
            .options(selectinload(User.roles), selectinload(User.department))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundException("用户不存在")
        return user

    @staticmethod
    async def create(db: AsyncSession, data: UserCreate) -> User:
        """创建用户。"""
        existing = await db.execute(
            select(User).where(User.username == data.username)
        )
        if existing.scalar_one_or_none():
            raise ConflictException("用户名已存在")

        user = User(
            username=data.username,
            email=data.email,
            phone=data.phone,
            real_name=data.real_name,
            avatar=data.avatar,
            department_id=data.department_id,
            hashed_password=hash_password(data.password),
        )

        # 关联角色
        if data.role_ids:
            roles_result = await db.execute(
                select(Role).where(Role.id.in_(data.role_ids))
            )
            user.roles = list(roles_result.scalars().all())

        db.add(user)
        await db.flush()
        return user

    @staticmethod
    async def update(
        db: AsyncSession, user_id: int, data: UserUpdate
    ) -> User:
        """更新用户信息。"""
        user = await UserService.get_by_id(db, user_id)
        update_data = data.model_dump(exclude_unset=True)

        if "role_ids" in update_data:
            role_ids = update_data.pop("role_ids")
            if role_ids is not None:
                roles_result = await db.execute(
                    select(Role).where(Role.id.in_(role_ids))
                )
                user.roles = list(roles_result.scalars().all())

        for field, value in update_data.items():
            setattr(user, field, value)

        await db.flush()
        return user

    @staticmethod
    async def delete(db: AsyncSession, user_id: int) -> None:
        """删除用户。"""
        user = await UserService.get_by_id(db, user_id)
        await db.delete(user)
