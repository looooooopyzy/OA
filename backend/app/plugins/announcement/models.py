from typing import Optional
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin
from app.models.user import User

class Announcement(Base, IdMixin, TimestampMixin):
    """公告模型。"""
    
    __tablename__ = "announcements"

    title: Mapped[str] = mapped_column(String(255), nullable=False, comment="公告标题")
    content: Mapped[str] = mapped_column(Text, nullable=False, comment="公告内容(富文本)")
    author_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, comment="发布人ID"
    )
    read_count: Mapped[int] = mapped_column(Integer, default=0, comment="阅读次数")

    # 关系
    author: Mapped[Optional[User]] = relationship("User", foreign_keys=[author_id])
