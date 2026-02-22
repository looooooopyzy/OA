"""统一 API 响应格式。"""

from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel


class ApiResponse(BaseModel):
    """标准 API 响应包装。"""

    code: int = 200
    message: str = "success"
    data: Optional[Any] = None
    timestamp: str = ""

    def __init__(self, **kwargs):
        if "timestamp" not in kwargs or not kwargs["timestamp"]:
            kwargs["timestamp"] = datetime.now(timezone.utc).isoformat()
        super().__init__(**kwargs)


class PageData(BaseModel):
    """分页数据包装。"""

    items: list[Any] = []
    total: int = 0
    page: int = 1
    page_size: int = 20


def success(data: Any = None, message: str = "success") -> dict:
    """构建成功响应。"""
    return ApiResponse(code=200, message=message, data=data).model_dump()


def error(code: int = 400, message: str = "error") -> dict:
    """构建错误响应。"""
    return ApiResponse(code=code, message=message).model_dump()


def page_response(
    items: list, total: int, page: int, page_size: int
) -> dict:
    """构建分页响应。"""
    return success(
        data=PageData(
            items=items, total=total, page=page, page_size=page_size
        ).model_dump()
    )
