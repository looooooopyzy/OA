"""部门服务 — 部门树 CRUD。"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.models.user import Department
from app.schemas.user import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    """部门管理业务逻辑。"""

    @staticmethod
    async def get_tree(db: AsyncSession) -> list[dict]:
        """获取部门树。"""
        result = await db.execute(
            select(Department).order_by(Department.sort_order)
        )
        departments = result.scalars().all()
        return DepartmentService._build_tree(departments)

    @staticmethod
    def _build_tree(departments: list, parent_id: Optional[int] = None) -> list[dict]:
        """递归构建树形结构。"""
        tree = []
        for dept in departments:
            if dept.parent_id == parent_id:
                node = {
                    "id": dept.id,
                    "name": dept.name,
                    "parent_id": dept.parent_id,
                    "sort_order": dept.sort_order,
                    "leader_id": dept.leader_id,
                    "children": DepartmentService._build_tree(departments, dept.id),
                }
                tree.append(node)
        return tree

    @staticmethod
    async def create(db: AsyncSession, data: DepartmentCreate) -> Department:
        """创建部门。"""
        dept = Department(**data.model_dump())
        db.add(dept)
        await db.flush()
        return dept

    @staticmethod
    async def update(
        db: AsyncSession, dept_id: int, data: DepartmentUpdate
    ) -> Department:
        """更新部门。"""
        result = await db.execute(
            select(Department).where(Department.id == dept_id)
        )
        dept = result.scalar_one_or_none()
        if not dept:
            raise NotFoundException("部门不存在")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(dept, field, value)

        await db.flush()
        return dept

    @staticmethod
    async def delete(db: AsyncSession, dept_id: int) -> None:
        """删除部门。"""
        result = await db.execute(
            select(Department).where(Department.id == dept_id)
        )
        dept = result.scalar_one_or_none()
        if not dept:
            raise NotFoundException("部门不存在")
        await db.delete(dept)
