"""部门管理 API 路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import success
from app.core.security import get_current_user
from app.schemas.user import DepartmentCreate, DepartmentUpdate
from app.services.department_service import DepartmentService

router = APIRouter(prefix="/departments", tags=["部门管理"], dependencies=[Depends(get_current_user)])


@router.get("/tree")
async def get_department_tree(db: AsyncSession = Depends(get_db)):
    """获取部门树。"""
    tree = await DepartmentService.get_tree(db)
    return success(data=tree)


@router.post("")
async def create_department(body: DepartmentCreate, db: AsyncSession = Depends(get_db)):
    """创建部门。"""
    dept = await DepartmentService.create(db, body)
    return success(data={"id": dept.id, "name": dept.name}, message="创建成功")


@router.put("/{dept_id}")
async def update_department(
    dept_id: int, body: DepartmentUpdate, db: AsyncSession = Depends(get_db)
):
    """更新部门。"""
    dept = await DepartmentService.update(db, dept_id, body)
    return success(data={"id": dept.id}, message="更新成功")


@router.delete("/{dept_id}")
async def delete_department(dept_id: int, db: AsyncSession = Depends(get_db)):
    """删除部门。"""
    await DepartmentService.delete(db, dept_id)
    return success(message="删除成功")
