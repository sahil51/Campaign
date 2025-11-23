from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class WebhookEndpointBase(BaseModel):
    campaign_id: int
    name: str
    field_mapping: Optional[Dict[str, str]] = None

class WebhookEndpointCreate(WebhookEndpointBase):
    pass

class WebhookEndpointUpdate(BaseModel):
    name: Optional[str] = None
    field_mapping: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class WebhookEndpoint(WebhookEndpointBase):
    id: int
    key: str
    secret: str
    is_active: bool
    last_received_at: Optional[datetime] = None
    total_received: int
    created_at: datetime

    class Config:
        orm_mode = True

class WebhookEventBase(BaseModel):
    payload: Dict[str, Any]
    normalized_data: Optional[Dict[str, Any]] = None
    status: str
    error_message: Optional[str] = None

class WebhookEvent(WebhookEventBase):
    id: int
    endpoint_id: int
    lead_id: Optional[int] = None
    created_at: datetime

    class Config:
        orm_mode = True
