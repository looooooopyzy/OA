"""API 路由包入口。"""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.roles import router as roles_router
from app.api.departments import router as departments_router
from app.api.menus import router as menus_router
from app.api.plugins import router as plugins_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(roles_router)
api_router.include_router(departments_router)
api_router.include_router(menus_router)
api_router.include_router(plugins_router)

@api_router.get("/health")
async def health_check():
    """健康检查端点。"""
    return {"code": 200, "message": "success", "data": {"status": "healthy"}}
