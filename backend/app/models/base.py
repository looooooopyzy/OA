"""SQLAlchemy 模型基类和公共 Mixin。"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, func
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
)


class Base(DeclarativeBase):
    """所有 ORM 模型的基类。"""
    pass


class TimestampMixin:
    """时间戳 Mixin，自动维护 created_at 和 updated_at。"""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class IdMixin:
    """自增主键 Mixin。"""

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
