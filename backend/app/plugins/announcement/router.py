from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.response import success, page_response, error
from app.models.user import User
from app.plugins.announcement.models import Announcement
from app.plugins.announcement.schemas import AnnouncementCreate, AnnouncementRead, AnnouncementUpdate

router = APIRouter()

@router.get("/list", summary="分页获取公告列表")
async def get_announcements(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    skip = (page - 1) * page_size
    
    stmt = select(Announcement).order_by(desc(Announcement.created_at)).offset(skip).limit(page_size)
    result = await db.execute(stmt)
    items = result.scalars().all()
    
    count_stmt = select(func.count()).select_from(Announcement)
    total = await db.scalar(count_stmt)
    
    parsed_items = [AnnouncementRead.model_validate(item).model_dump() for item in items]
    return page_response(items=parsed_items, total=total, page=page, page_size=page_size)


@router.post("/publish", summary="发布新公告")
async def create_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    # 鉴权：需要 announcement:write 权限 (在此简化，依赖网关或底座路由过滤)
    # 微服务/插件化最佳实践下，此处的 current_user 必须持有正确角色，这层可由中间件拦截。
    new_announcement = Announcement(
        title=data.title,
        content=data.content,
        author_id=current_user.id
    )
    db.add(new_announcement)
    await db.commit()
    await db.refresh(new_announcement)
    
    return success(AnnouncementRead.model_validate(new_announcement).model_dump(), message="发布成功")


@router.get("/{announcement_id}", summary="获取公告详情")
async def get_announcement(
    announcement_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    announcement = result.scalar_one_or_none()
    
    if not announcement:
        return error(code=404, message="公告不存在")
        
    # 增加阅读数
    announcement.read_count += 1
    await db.commit()
    await db.refresh(announcement)
    
    return success(AnnouncementRead.model_validate(announcement).model_dump())
