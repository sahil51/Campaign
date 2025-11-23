from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Automation
from ..schemas_automation import Automation as AutomationSchema, AutomationCreate, AutomationUpdate

router = APIRouter(
    prefix="/api/automations",
    tags=["automations"]
)

@router.get("/", response_model=List[AutomationSchema])
def get_automations(campaign_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Automation)
    if campaign_id:
        query = query.filter(Automation.campaign_id == campaign_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=AutomationSchema)
def create_automation(automation: AutomationCreate, db: Session = Depends(get_db)):
    db_automation = Automation(**automation.dict())
    db.add(db_automation)
    db.commit()
    db.refresh(db_automation)
    return db_automation

@router.get("/{automation_id}", response_model=AutomationSchema)
def get_automation(automation_id: int, db: Session = Depends(get_db)):
    automation = db.query(Automation).filter(Automation.id == automation_id).first()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    return automation

@router.patch("/{automation_id}", response_model=AutomationSchema)
def update_automation(automation_id: int, automation: AutomationUpdate, db: Session = Depends(get_db)):
    db_automation = db.query(Automation).filter(Automation.id == automation_id).first()
    if not db_automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    update_data = automation.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_automation, key, value)
    
    db.commit()
    db.refresh(db_automation)
    return db_automation

@router.delete("/{automation_id}")
def delete_automation(automation_id: int, db: Session = Depends(get_db)):
    db_automation = db.query(Automation).filter(Automation.id == automation_id).first()
    if not db_automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    
    db.delete(db_automation)
    db.commit()
    return {"ok": True}
