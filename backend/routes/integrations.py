from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Integration, IntegrationStatus
from ..schemas import Integration as IntegrationSchema, IntegrationCreate, IntegrationUpdate, IntegrationStatus as IntegrationStatusSchema

router = APIRouter(
    prefix="/api/integrations",
    tags=["integrations"]
)

@router.get("/", response_model=List[IntegrationSchema])
def get_integrations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    integrations = db.query(Integration).offset(skip).limit(limit).all()
    return integrations

@router.post("/", response_model=IntegrationSchema)
def create_integration(integration: IntegrationCreate, db: Session = Depends(get_db)):
    db_integration = Integration(**integration.dict())
    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)
    # Initialize status
    status = IntegrationStatus(integration_id=db_integration.id)
    db.add(status)
    db.commit()
    return db_integration

@router.get("/{integration_id}", response_model=IntegrationSchema)
def get_integration(integration_id: int, db: Session = Depends(get_db)):
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration

@router.get("/{integration_id}/status", response_model=IntegrationStatusSchema)
def get_integration_status(integration_id: int, db: Session = Depends(get_db)):
    status = db.query(IntegrationStatus).filter(IntegrationStatus.integration_id == integration_id).first()
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")
    return status
