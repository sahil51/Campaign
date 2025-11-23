from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AutomationBase(BaseModel):
    name: str
    trigger_type: str
    trigger_config: Optional[Dict[str, Any]] = None
    actions: List[Dict[str, Any]]
    is_active: bool = True

class AutomationCreate(AutomationBase):
    campaign_id: int

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None

class Automation(AutomationBase):
    id: int
    campaign_id: int
    created_at: datetime

    class Config:
        orm_mode = True
