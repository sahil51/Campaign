from datetime import datetime, timedelta
from typing import Dict, Any
from ..models import Integration, IntegrationStatusEnum, WebhookEvent
from sqlalchemy.orm import Session
from sqlalchemy import desc

class WebhookService:
    def __init__(self):
        pass

    def check_health(self, db: Session, integration: Integration) -> Dict[str, Any]:
        """
        Checks if webhooks have been received recently.
        """
        # Get the last received event for this integration
        # Note: We assume integration.id links to the campaign's webhook config
        # For now, we'll look for events linked to this integration
        
        # This requires a WebhookEvent model which we defined in the plan but haven't created in models.py yet
        # Let's assume we'll add it. For now, we'll mock the query or use a placeholder.
        
        # Logic:
        # - Green: Event received < 24 hours ago
        # - Yellow: Event received < 7 days ago
        # - Red: No events or > 7 days
        
        # Placeholder logic until WebhookEvent model is fully hooked up
        last_sync = integration.status.last_sync_time if integration.status else None
        
        if not last_sync:
             return {
                "status": IntegrationStatusEnum.WARNING,
                "status_text": "No Data Yet",
                "error": None
            }
            
        time_since_last = datetime.now() - last_sync
        
        if time_since_last < timedelta(hours=24):
            return {
                "status": IntegrationStatusEnum.CONNECTED,
                "status_text": "Active",
                "error": None
            }
        elif time_since_last < timedelta(days=7):
            return {
                "status": IntegrationStatusEnum.WARNING,
                "status_text": "Idle (No events in 24h)",
                "error": None
            }
        else:
            return {
                "status": IntegrationStatusEnum.DISCONNECTED,
                "status_text": "Inactive",
                "error": "No events received in 7 days"
            }

webhook_service = WebhookService()
