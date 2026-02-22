"""菜单管理 API 路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import success
from app.core.security import get_current_user
from app.schemas.user import MenuCreate, MenuUpdate
from app.services.menu_service import MenuService

router = APIRouter(prefix="/menus", tags=["菜单管理"], dependencies=[Depends(get_current_user)])


@router.get("/tree")
async def get_menu_tree(db: AsyncSession = Depends(get_db)):
    """获取完整菜单树。"""
    tree = await MenuService.get_tree(db)
    return success(data=tree)


@router.post("")
async def create_menu(body: MenuCreate, db: AsyncSession = Depends(get_db)):
    """创建菜单。"""
    menu = await MenuService.create(db, body)
    return success(data={"id": menu.id, "name": menu.name}, message="创建成功")


@router.put("/{menu_id}")
async def update_menu(
    menu_id: int, body: MenuUpdate, db: AsyncSession = Depends(get_db)
):
    """更新菜单。"""
    menu = await MenuService.update(db, menu_id, body)
    return success(data={"id": menu.id}, message="更新成功")


@router.delete("/{menu_id}")
async def delete_menu(menu_id: int, db: AsyncSession = Depends(get_db)):
    """删除菜单。"""
    await MenuService.delete(db, menu_id)
    return success(message="删除成功")
