"""认证相关 Pydantic Schema。"""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    """登录请求。"""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Token 响应。"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """刷新 Token 请求。"""
    refresh_token: str
