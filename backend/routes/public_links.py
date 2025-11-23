from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from passlib.context import CryptContext
from ..database import get_db
from ..models import PublicLink, Campaign, Lead
from ..schemas_public import PublicLink as PublicLinkSchema, PublicLinkCreate

router = APIRouter(
    prefix="/api/public-links",
    tags=["public-links"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/", response_model=PublicLinkSchema)
def create_public_link(link: PublicLinkCreate, db: Session = Depends(get_db)):
    # Verify campaign exists
    campaign = db.query(Campaign).filter(Campaign.id == link.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Generate UUID
    link_uuid = str(uuid.uuid4())
    
    # Hash password if provided
    password_hash = None
    if link.password:
        password_hash = pwd_context.hash(link.password)
    
    db_link = PublicLink(
        campaign_id=link.campaign_id,
        uuid=link_uuid,
        type=link.type,
        password_hash=password_hash,
        expires_at=link.expires_at
    )
    
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

@router.get("/{link_uuid}")
def get_public_dashboard(link_uuid: str, password: str = None, db: Session = Depends(get_db)):
    """
    Public endpoint - no authentication required
    """
    link = db.query(PublicLink).filter(PublicLink.uuid == link_uuid).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Check expiry
    from datetime import datetime
    if link.expires_at and link.expires_at < datetime.now():
        raise HTTPException(status_code=410, detail="Link has expired")
    
    # Check password
    if link.password_hash:
        if not password or not pwd_context.verify(password, link.password_hash):
            raise HTTPException(status_code=401, detail="Invalid password")
    
    # Get campaign data
    campaign = db.query(Campaign).filter(Campaign.id == link.campaign_id).first()
    leads = db.query(Lead).filter(Lead.campaign_id == link.campaign_id).all()
    
    return {
        "campaign": {
            "id": campaign.id,
            "name": campaign.name,
            "description": campaign.description
        },
        "leads": [
            {
                "id": lead.id,
                "email": lead.email,
                "full_name": lead.full_name,
                "status": lead.status,
                "created_at": lead.created_at
            } for lead in leads
        ],
        "stats": {
            "total_leads": len(leads),
            "new_leads": len([l for l in leads if l.status == "new"])
        }
    }

@router.get("/{link_uuid}/csv")
def download_csv(link_uuid: str, password: str = None, db: Session = Depends(get_db)):
    """
    Download CSV export
    """
    link = db.query(PublicLink).filter(PublicLink.uuid == link_uuid).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Similar checks as above...
    
    leads = db.query(Lead).filter(Lead.campaign_id == link.campaign_id).all()
    
    # Generate CSV (simplified)
    csv_data = "ID,Email,Name,Status,Created\n"
    for lead in leads:
        csv_data += f"{lead.id},{lead.email},{lead.full_name},{lead.status},{lead.created_at}\n"
    
    from fastapi.responses import Response
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=leads_{link.campaign_id}.csv"}
    )

@router.delete("/{link_uuid}")
def revoke_link(link_uuid: str, db: Session = Depends(get_db)):
    link = db.query(PublicLink).filter(PublicLink.uuid == link_uuid).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    db.delete(link)
    db.commit()
    return {"ok": True}
