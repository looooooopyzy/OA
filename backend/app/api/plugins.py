"""插件管理 API 路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import success
from app.core.security import get_current_user
from app.services.plugin_service import PluginService

router = APIRouter(prefix="/plugins", tags=["插件管理"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_plugins(db: AsyncSession = Depends(get_db)):
    """获取所有插件列表。"""
    plugins = await PluginService.get_list(db)
    return success(data=plugins)


@router.put("/{plugin_name}/toggle")
async def toggle_plugin(plugin_name: str, db: AsyncSession = Depends(get_db)):
    """切换插件启用/禁用状态。"""
    result = await PluginService.toggle(db, plugin_name)
    return success(data=result, message="操作成功")
