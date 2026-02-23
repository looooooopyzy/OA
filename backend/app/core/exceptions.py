"""全局异常定义和处理器。"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.response import error


class AppException(Exception):
    """应用层自定义异常基类。"""

    def __init__(self, code: int = 400, message: str = "请求错误"):
        self.code = code
        self.message = message


class NotFoundException(AppException):
    """资源不存在。"""

    def __init__(self, message: str = "资源不存在"):
        super().__init__(code=404, message=message)


class ForbiddenException(AppException):
    """无权限访问。"""

    def __init__(self, message: str = "无权限访问"):
        super().__init__(code=403, message=message)


class ConflictException(AppException):
    """资源冲突（如用户名已存在）。"""

    def __init__(self, message: str = "资源已存在"):
        super().__init__(code=409, message=message)


def register_exception_handlers(app: FastAPI) -> None:
    """注册全局异常处理器到 FastAPI 应用。"""

    @app.exception_handler(AppException)
    async def app_exception_handler(_: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.code,
            content=error(code=exc.code, message=exc.message),
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(_: Request, exc: Exception):
        import logging
        logging.getLogger(__name__).error(f"Global Ex: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content=error(code=500, message="服务器内部错误"),
        )
