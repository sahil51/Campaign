from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PublicLinkBase(BaseModel):
    campaign_id: int
    type: str  # "dashboard" or "csv"
    password: Optional[str] = None
    expires_at: Optional[datetime] = None

class PublicLinkCreate(PublicLinkBase):
    pass

class PublicLink(BaseModel):
    id: int
    campaign_id: int
    uuid: str
    type: str
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        orm_mode = True
