"""插件模板路由。

复制整个 _template 目录，重命名后修改本文件实现你的插件 API。
注意：文件中必须导出名为 `router` 的 APIRouter 实例。
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/hello")
async def hello():
    """插件模板示例接口。"""
    return {"message": "Hello from plugin template!"}
