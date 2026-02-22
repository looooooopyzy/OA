"""用户管理 API 路由。"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import page_response, success
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["用户管理"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    department_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """分页查询用户列表。"""
    users, total = await UserService.get_list(
        db, page=page, page_size=page_size, keyword=keyword, department_id=department_id
    )
    items = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "phone": u.phone,
            "real_name": u.real_name,
            "avatar": u.avatar,
            "is_active": u.is_active,
            "department_id": u.department_id,
            "department_name": u.department.name if u.department else None,
            "roles": [{"id": r.id, "name": r.name, "code": r.code} for r in u.roles],
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]
    return page_response(items=items, total=total, page=page, page_size=page_size)


@router.get("/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """获取用户详情。"""
    user = await UserService.get_by_id(db, user_id)
    return success(data={
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
        "real_name": user.real_name,
        "avatar": user.avatar,
        "is_active": user.is_active,
        "department_id": user.department_id,
        "roles": [{"id": r.id, "name": r.name, "code": r.code} for r in user.roles],
    })


@router.post("")
async def create_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    """创建用户。"""
    user = await UserService.create(db, body)
    return success(data={"id": user.id, "username": user.username}, message="创建成功")


@router.put("/{user_id}")
async def update_user(
    user_id: int, body: UserUpdate, db: AsyncSession = Depends(get_db)
):
    """更新用户。"""
    user = await UserService.update(db, user_id, body)
    return success(data={"id": user.id}, message="更新成功")


@router.delete("/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """删除用户。"""
    await UserService.delete(db, user_id)
    return success(message="删除成功")
