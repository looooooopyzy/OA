"""角色管理 API 路由。"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import page_response, success
from app.core.security import get_current_user
from app.schemas.user import RoleCreate, RoleUpdate
from app.services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["角色管理"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_roles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """分页查询角色列表。"""
    roles, total = await RoleService.get_list(db, page=page, page_size=page_size, keyword=keyword)
    items = [
        {
            "id": r.id,
            "name": r.name,
            "code": r.code,
            "description": r.description,
            "data_scope": r.data_scope,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in roles
    ]
    return page_response(items=items, total=total, page=page, page_size=page_size)


@router.get("/{role_id}")
async def get_role(role_id: int, db: AsyncSession = Depends(get_db)):
    """获取角色详情。"""
    role = await RoleService.get_by_id(db, role_id)
    return success(data={
        "id": role.id,
        "name": role.name,
        "code": role.code,
        "description": role.description,
        "data_scope": role.data_scope,
        "permission_ids": [p.id for p in role.permissions],
        "menu_ids": [m.id for m in role.menus],
    })


@router.post("")
async def create_role(body: RoleCreate, db: AsyncSession = Depends(get_db)):
    """创建角色。"""
    role = await RoleService.create(db, body)
    return success(data={"id": role.id, "name": role.name}, message="创建成功")


@router.put("/{role_id}")
async def update_role(role_id: int, body: RoleUpdate, db: AsyncSession = Depends(get_db)):
    """更新角色。"""
    role = await RoleService.update(db, role_id, body)
    return success(data={"id": role.id}, message="更新成功")


@router.delete("/{role_id}")
async def delete_role(role_id: int, db: AsyncSession = Depends(get_db)):
    """删除角色。"""
    await RoleService.delete(db, role_id)
    return success(message="删除成功")
