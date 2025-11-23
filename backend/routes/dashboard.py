from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Campaign, Lead, Integration

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get overall workspace statistics for main dashboard
    """
    # Total leads
    total_leads = db.query(Lead).count()
    
    # Leads today
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    leads_today = db.query(Lead).filter(Lead.created_at >= today_start).count()
    
    # Active campaigns (campaigns with at least one lead)
    active_campaigns = db.query(Campaign).join(Lead).distinct().count()
    
    # Conversion rate (contacted / total)
    contacted_leads = db.query(Lead).filter(Lead.status == "contacted").count()
    conversion_rate = (contacted_leads / total_leads * 100) if total_leads > 0 else 0
    
    return {
        "total_leads": total_leads,
        "leads_today": leads_today,
        "active_campaigns": active_campaigns,
        "conversion_rate": round(conversion_rate, 1)
    }

@router.get("/leads-over-time")
def get_leads_over_time(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get leads count grouped by date for chart
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # Query leads grouped by date
    results = db.query(
        func.date(Lead.created_at).label('date'),
        func.count(Lead.id).label('count')
    ).filter(
        Lead.created_at >= start_date
    ).group_by(
        func.date(Lead.created_at)
    ).order_by('date').all()
    
    # Format for frontend
    data = [
        {
            "date": str(result.date),
            "count": result.count
        }
        for result in results
    ]
    
    return data

@router.get("/leads-by-campaign")
def get_leads_by_campaign(db: Session = Depends(get_db)):
    """
    Get leads count grouped by campaign for bar chart
    """
    results = db.query(
        Campaign.name,
        func.count(Lead.id).label('count')
    ).join(
        Lead, Campaign.id == Lead.campaign_id
    ).group_by(
        Campaign.id, Campaign.name
    ).order_by(
        func.count(Lead.id).desc()
    ).limit(10).all()
    
    data = [
        {
            "campaign": result.name,
            "count": result.count
        }
        for result in results
    ]
    
    return data

@router.get("/campaigns-overview")
def get_campaigns_overview(db: Session = Depends(get_db)):
    """
    Get campaign overview table data
    """
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    campaigns = db.query(Campaign).all()
    
    overview = []
    for campaign in campaigns:
        # Total leads for this campaign
        total_leads = db.query(Lead).filter(Lead.campaign_id == campaign.id).count()
        
        # Leads today
        leads_today = db.query(Lead).filter(
            and_(
                Lead.campaign_id == campaign.id,
                Lead.created_at >= today_start
            )
        ).count()
        
        # Get integration status
        integration = db.query(Integration).filter(
            Integration.campaign_id == campaign.id
        ).first()
        
        status = "active" if total_leads > 0 else "inactive"
        
        overview.append({
            "id": campaign.id,
            "name": campaign.name,
            "description": campaign.description,
            "total_leads": total_leads,
            "leads_today": leads_today,
            "owner": campaign.owner or "Unassigned",
            "status": status,
            "created_at": campaign.created_at.isoformat() if campaign.created_at else None
        })
    
    return overview
