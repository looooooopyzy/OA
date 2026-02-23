from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class AnnouncementBase(BaseModel):
    title: str = Field(..., max_length=255, description="公告标题")
    content: str = Field(..., description="公告富文本内容")

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None

class AnnouncementRead(AnnouncementBase):
    id: int
    author_id: Optional[int]
    read_count: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
