from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Campaign, Lead, Automation

router = APIRouter(
    prefix="/api/campaigns",
    tags=["campaign-detail"]
)

@router.get("/{campaign_id}/stats")
def get_campaign_stats(campaign_id: int, db: Session = Depends(get_db)):
    """
    Get statistics for a specific campaign
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Total leads
    total_leads = db.query(Lead).filter(Lead.campaign_id == campaign_id).count()
    
    # Leads today
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    leads_today = db.query(Lead).filter(
        and_(
            Lead.campaign_id == campaign_id,
            Lead.created_at >= today_start
        )
    ).count()
    
    # Status breakdown
    new_leads = db.query(Lead).filter(
        and_(Lead.campaign_id == campaign_id, Lead.status == "new")
    ).count()
    
    contacted_leads = db.query(Lead).filter(
        and_(Lead.campaign_id == campaign_id, Lead.status == "contacted")
    ).count()
    
    # Conversion rate
    conversion_rate = (contacted_leads / total_leads * 100) if total_leads > 0 else 0
    
    return {
        "campaign": {
            "id": campaign.id,
            "name": campaign.name,
            "description": campaign.description,
            "owner": campaign.owner or "Unassigned",
            "source": campaign.source or "Multiple"
        },
        "stats": {
            "total_leads": total_leads,
            "leads_today": leads_today,
            "new_leads": new_leads,
            "contacted_leads": contacted_leads,
            "conversion_rate": round(conversion_rate, 1)
        }
    }

@router.get("/{campaign_id}/leads-over-time")
def get_campaign_leads_over_time(
    campaign_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get leads count over time for a specific campaign
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    start_date = datetime.now() - timedelta(days=days)
    
    results = db.query(
        func.date(Lead.created_at).label('date'),
        func.count(Lead.id).label('count')
    ).filter(
        and_(
            Lead.campaign_id == campaign_id,
            Lead.created_at >= start_date
        )
    ).group_by(
        func.date(Lead.created_at)
    ).order_by('date').all()
    
    data = [
        {
            "date": str(result.date),
            "count": result.count
        }
        for result in results
    ]
    
    return data

@router.get("/{campaign_id}/leads")
def get_campaign_leads(
    campaign_id: int,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get leads for a specific campaign with filters
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    query = db.query(Lead).filter(Lead.campaign_id == campaign_id)
    
    # Apply filters
    if status:
        query = query.filter(Lead.status == status)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.filter(Lead.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.filter(Lead.created_at <= end_dt)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "leads": [
            {
                "id": lead.id,
                "email": lead.email,
                "full_name": lead.full_name,
                "phone": lead.phone,
                "status": lead.status,
                "source": lead.source,
                "created_at": lead.created_at.isoformat() if lead.created_at else None
            }
            for lead in leads
        ]
    }

@router.get("/{campaign_id}/automations")
def get_campaign_automations(campaign_id: int, db: Session = Depends(get_db)):
    """
    Get automations linked to a specific campaign
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    automations = db.query(Automation).filter(
        Automation.campaign_id == campaign_id
    ).all()
    
    return [
        {
            "id": auto.id,
            "name": auto.name,
            "trigger_type": auto.trigger_type,
            "is_active": auto.is_active,
            "actions_count": len(auto.actions) if auto.actions else 0
        }
        for auto in automations
    ]
