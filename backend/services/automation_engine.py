from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import Automation, Lead, Campaign
from ..schemas import Lead as LeadSchema
import logging

logger = logging.getLogger(__name__)

class AutomationEngine:
    def __init__(self):
        pass

    async def evaluate_triggers(self, db: Session, lead: Lead, trigger_type: str):
        """
        Evaluates all active automations for a given campaign and trigger type.
        """
        campaign_id = lead.campaign_id
        automations = db.query(Automation).filter(
            Automation.campaign_id == campaign_id,
            Automation.trigger_type == trigger_type,
            Automation.is_active == True
        ).all()

        for automation in automations:
            if self._check_conditions(automation.trigger_config, lead):
                await self._execute_actions(automation.actions, lead, db)

    def _check_conditions(self, config: Dict[str, Any], lead: Lead) -> bool:
        """
        Checks if the lead meets the automation conditions.
        Example config: {"field": "source", "operator": "equals", "value": "facebook"}
        """
        if not config or "conditions" not in config:
            return True # No conditions, always run

        conditions = config["conditions"]
        # Simple AND logic for now
        for condition in conditions:
            field = condition.get("field")
            operator = condition.get("operator")
            value = condition.get("value")
            
            lead_value = getattr(lead, field, None)
            
            if operator == "equals" and str(lead_value) != str(value):
                return False
            elif operator == "contains" and str(value).lower() not in str(lead_value).lower():
                return False
            # Add more operators as needed
            
        return True

    async def _execute_actions(self, actions: List[Dict[str, Any]], lead: Lead, db: Session):
        """
        Executes the defined actions.
        Example action: {"type": "send_email", "template_id": 1}
        """
        for action in actions:
            action_type = action.get("type")
            
            try:
                if action_type == "send_email":
                    await self._action_send_email(action, lead)
                elif action_type == "update_lead":
                    await self._action_update_lead(action, lead, db)
                elif action_type == "webhook":
                    await self._action_call_webhook(action, lead)
                
                logger.info(f"Executed action {action_type} for lead {lead.id}")
            except Exception as e:
                logger.error(f"Failed to execute action {action_type}: {str(e)}")

    async def _action_send_email(self, action: Dict[str, Any], lead: Lead):
        # Placeholder for email sending logic
        # Would use SMTPService here
        print(f"Sending email to {lead.email}")

    async def _action_update_lead(self, action: Dict[str, Any], lead: Lead, db: Session):
        # Update lead fields
        updates = action.get("updates", {})
        for key, value in updates.items():
            if hasattr(lead, key):
                setattr(lead, key, value)
        db.commit()

    async def _action_call_webhook(self, action: Dict[str, Any], lead: Lead):
        # Call external webhook
        url = action.get("url")
        # httpx.post(url, json=lead.dict())
        print(f"Calling webhook {url}")

automation_engine = AutomationEngine()
