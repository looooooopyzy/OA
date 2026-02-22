"""认证 API 路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import success
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """用户登录。"""
    token = await AuthService.login(db, body.username, body.password)
    return success(data=token.model_dump())


@router.post("/refresh")
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """刷新 Token。"""
    token = await AuthService.refresh(db, body.refresh_token)
    return success(data=token.model_dump())


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取当前用户信息（含权限和菜单）。"""
    info = await AuthService.get_user_info(db, current_user.id)
    return success(data=info)
