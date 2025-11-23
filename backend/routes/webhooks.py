from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from typing import List
import uuid
import secrets
from datetime import datetime
from ..database import get_db
from ..models import WebhookEndpoint, WebhookEvent, Lead, Campaign
from ..schemas_webhook import (
    WebhookEndpoint as WebhookEndpointSchema,
    WebhookEndpointCreate,
    WebhookEndpointUpdate,
    WebhookEvent as WebhookEventSchema
)
from ..services.webhook_normalizer import webhook_normalizer

router = APIRouter(
    prefix="/api/webhooks",
    tags=["webhooks"]
)

# ============ Management Endpoints (Authenticated) ============

@router.post("/", response_model=WebhookEndpointSchema)
def create_webhook_endpoint(endpoint: WebhookEndpointCreate, db: Session = Depends(get_db)):
    """Create a new webhook endpoint for a campaign"""
    # Verify campaign exists
    campaign = db.query(Campaign).filter(Campaign.id == endpoint.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Generate unique key and secret
    key = str(uuid.uuid4())
    secret = secrets.token_urlsafe(32)
    
    db_endpoint = WebhookEndpoint(
        campaign_id=endpoint.campaign_id,
        key=key,
        secret=secret,
        name=endpoint.name,
        field_mapping=endpoint.field_mapping
    )
    db.add(db_endpoint)
    db.commit()
    db.refresh(db_endpoint)
    return db_endpoint

@router.get("/", response_model=List[WebhookEndpointSchema])
def list_webhook_endpoints(campaign_id: int = None, db: Session = Depends(get_db)):
    """List all webhook endpoints, optionally filtered by campaign"""
    query = db.query(WebhookEndpoint)
    if campaign_id:
        query = query.filter(WebhookEndpoint.campaign_id == campaign_id)
    return query.all()

@router.get("/{endpoint_id}", response_model=WebhookEndpointSchema)
def get_webhook_endpoint(endpoint_id: int, db: Session = Depends(get_db)):
    """Get webhook endpoint details"""
    endpoint = db.query(WebhookEndpoint).filter(WebhookEndpoint.id == endpoint_id).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Webhook endpoint not found")
    return endpoint

@router.patch("/{endpoint_id}", response_model=WebhookEndpointSchema)
def update_webhook_endpoint(
    endpoint_id: int, 
    updates: WebhookEndpointUpdate, 
    db: Session = Depends(get_db)
):
    """Update webhook endpoint configuration"""
    endpoint = db.query(WebhookEndpoint).filter(WebhookEndpoint.id == endpoint_id).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Webhook endpoint not found")
    
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(endpoint, key, value)
    
    db.commit()
    db.refresh(endpoint)
    return endpoint

@router.delete("/{endpoint_id}")
def delete_webhook_endpoint(endpoint_id: int, db: Session = Depends(get_db)):
    """Delete webhook endpoint"""
    endpoint = db.query(WebhookEndpoint).filter(WebhookEndpoint.id == endpoint_id).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Webhook endpoint not found")
    
    db.delete(endpoint)
    db.commit()
    return {"ok": True}

@router.post("/{endpoint_id}/regenerate-secret", response_model=WebhookEndpointSchema)
def regenerate_secret(endpoint_id: int, db: Session = Depends(get_db)):
    """Regenerate webhook secret"""
    endpoint = db.query(WebhookEndpoint).filter(WebhookEndpoint.id == endpoint_id).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Webhook endpoint not found")
    
    endpoint.secret = secrets.token_urlsafe(32)
    db.commit()
    db.refresh(endpoint)
    return endpoint

@router.get("/{endpoint_id}/events", response_model=List[WebhookEventSchema])
def get_webhook_events(endpoint_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """Get recent webhook events for debugging"""
    events = db.query(WebhookEvent).filter(
        WebhookEvent.endpoint_id == endpoint_id
    ).order_by(WebhookEvent.created_at.desc()).limit(limit).all()
    return events

# ============ Public Endpoint (No Authentication) ============

@router.post("/incoming/{key}")
async def receive_webhook(
    key: str,
    request: Request,
    secret: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Public webhook receiver endpoint.
    External platforms POST to: /api/webhooks/incoming/{key}?secret={secret}
    Or include X-Webhook-Secret header
    """
    # Find webhook endpoint
    endpoint = db.query(WebhookEndpoint).filter(WebhookEndpoint.key == key).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    if not endpoint.is_active:
        raise HTTPException(status_code=403, detail="Webhook is disabled")
    
    # Validate secret (support both query param and header)
    header_secret = request.headers.get("X-Webhook-Secret")
    provided_secret = secret or header_secret
    
    if provided_secret != endpoint.secret:
        # Log failed attempt
        payload = await request.json()
        event = WebhookEvent(
            endpoint_id=endpoint.id,
            payload=payload,
            status="failed",
            error_message="Invalid secret"
        )
        db.add(event)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid secret")
    
    # Parse payload
    try:
        payload = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
    
    # Normalize payload
    normalized = webhook_normalizer.normalize(payload, endpoint.field_mapping)
    
    # Create lead
    try:
        lead = Lead(
            campaign_id=endpoint.campaign_id,
            email=normalized.get("email"),
            full_name=normalized.get("full_name"),
            phone=normalized.get("phone"),
            source="webhook",
            status="new",
            data=normalized.get("data")
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)
        
        # Log successful event
        event = WebhookEvent(
            endpoint_id=endpoint.id,
            payload=payload,
            normalized_data=normalized,
            lead_id=lead.id,
            status="success"
        )
        db.add(event)
        
        # Update endpoint stats
        endpoint.last_received_at = datetime.now()
        endpoint.total_received += 1
        db.commit()
        
        # Trigger automations asynchronously
        from ..services.automation_engine import automation_engine
        await automation_engine.evaluate_triggers(db, lead, "new_lead")
        
        return {
            "success": True,
            "lead_id": lead.id,
            "message": "Lead created successfully"
        }
        
    except Exception as e:
        # Log failed event
        event = WebhookEvent(
            endpoint_id=endpoint.id,
            payload=payload,
            normalized_data=normalized,
            status="failed",
            error_message=str(e)
        )
        db.add(event)
        db.commit()
        
        raise HTTPException(status_code=500, detail=f"Failed to create lead: {str(e)}")
