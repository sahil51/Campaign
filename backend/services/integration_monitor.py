import asyncio
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Integration, IntegrationStatus, IntegrationStatusEnum
from datetime import datetime, timedelta

class IntegrationMonitor:
    def __init__(self):
        self.running = False

    async def start(self):
        self.running = True
        while self.running:
            await self.check_all_integrations()
            await asyncio.sleep(300) # Check every 5 minutes

    def stop(self):
        self.running = False

    async def check_all_integrations(self):
        db = SessionLocal()
        try:
            integrations = db.query(Integration).filter(Integration.is_active == True).all()
            for integration in integrations:
                await self.check_integration_health(db, integration)
        finally:
            db.close()

    async def check_integration_health(self, db: Session, integration: Integration):
        # Get or create status record
        status = integration.status
        if not status:
            status = IntegrationStatus(integration_id=integration.id)
            db.add(status)
            db.commit()
            db.refresh(status)

        result = {
            "status": IntegrationStatusEnum.DISCONNECTED,
            "status_text": "Unknown Type",
            "error": "Unsupported integration type"
        }

        try:
            if integration.type == "meta":
                from .meta_service import meta_service
                result = await meta_service.check_connection_status(integration)
            
            elif integration.type == "webhook":
                from .webhook_service import webhook_service
                result = webhook_service.check_health(db, integration)
            
            elif integration.type == "smtp":
                from .smtp_service import smtp_service
                # SMTP check is synchronous/blocking, might want to run in executor in production
                result = smtp_service.check_connection(integration)
                
        except Exception as e:
            result = {
                "status": IntegrationStatusEnum.DISCONNECTED,
                "status_text": "System Error",
                "error": str(e)
            }

        # Update status record
        status.status = result["status"]
        status.status_text = result["status_text"]
        status.last_error_message = result.get("error")
        status.updated_at = datetime.now()
        
        if result["status"] == IntegrationStatusEnum.CONNECTED:
            status.last_sync_time = datetime.now()
            # Reset error count if connected
            status.error_count = 0
        else:
            status.error_count += 1
        
        db.commit()

monitor = IntegrationMonitor()
