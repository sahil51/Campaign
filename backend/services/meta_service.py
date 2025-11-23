import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from ..models import Integration, IntegrationStatus, IntegrationStatusEnum
from sqlalchemy.orm import Session

class MetaService:
    BASE_URL = "https://graph.facebook.com/v18.0"
    
    def __init__(self):
        pass

    async def check_connection_status(self, integration: Integration) -> Dict[str, Any]:
        """
        Checks the health of the Meta connection.
        Returns a dict with status, status_text, and error_message.
        """
        if not integration.config or "access_token" not in integration.config:
            return {
                "status": IntegrationStatusEnum.DISCONNECTED,
                "status_text": "Not Connected",
                "error": "No access token found"
            }

        access_token = integration.config["access_token"]
        
        try:
            # Verify token validity by calling debug_token endpoint
            # Note: In a real app, we need the App Access Token to call debug_token
            # For this implementation, we'll try to fetch the 'me' endpoint as a proxy check
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/me",
                    params={"access_token": access_token}
                )
                
                if response.status_code == 200:
                    return {
                        "status": IntegrationStatusEnum.CONNECTED,
                        "status_text": "Active",
                        "error": None
                    }
                elif response.status_code == 401:
                    return {
                        "status": IntegrationStatusEnum.WARNING,
                        "status_text": "Token Expired",
                        "error": "Access token has expired or is invalid"
                    }
                else:
                    return {
                        "status": IntegrationStatusEnum.WARNING,
                        "status_text": "API Error",
                        "error": f"Meta API returned {response.status_code}"
                    }
                    
        except Exception as e:
            return {
                "status": IntegrationStatusEnum.DISCONNECTED,
                "status_text": "Connection Failed",
                "error": str(e)
            }

    async def get_auth_url(self, app_id: str, redirect_uri: str) -> str:
        return (
            f"https://www.facebook.com/v18.0/dialog/oauth?"
            f"client_id={app_id}&redirect_uri={redirect_uri}&"
            f"scope=leads_retrieval,pages_show_list,pages_read_engagement,pages_manage_ads"
        )

meta_service = MetaService()
