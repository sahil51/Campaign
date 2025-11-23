from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class IntegrationStatusEnum(str, Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    WARNING = "warning"

class IntegrationBase(BaseModel):
    name: str
    type: str
    config: Optional[Dict[str, Any]] = None
    is_active: bool = True

class IntegrationCreate(IntegrationBase):
    campaign_id: Optional[int] = None

class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class IntegrationStatus(BaseModel):
    status: IntegrationStatusEnum
    status_text: Optional[str] = None
    last_sync_time: Optional[datetime] = None
    next_sync_time: Optional[datetime] = None
    error_count: int = 0
    last_error_message: Optional[str] = None

    class Config:
        orm_mode = True

class Integration(IntegrationBase):
    id: int
    campaign_id: Optional[int] = None
    created_at: datetime
    status: Optional[IntegrationStatus] = None

    class Config:
        orm_mode = True

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class LeadBase(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    status: str = "new"
    source: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class LeadCreate(LeadBase):
    campaign_id: int

class Lead(LeadBase):
    id: int
    campaign_id: int
    created_at: datetime

    class Config:
        orm_mode = True
