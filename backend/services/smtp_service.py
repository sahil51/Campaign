import smtplib
from typing import Dict, Any
from ..models import Integration, IntegrationStatusEnum

class SMTPService:
    def __init__(self):
        pass

    def check_connection(self, integration: Integration) -> Dict[str, Any]:
        """
        Tests the SMTP connection using the stored configuration.
        """
        if not integration.config:
            return {
                "status": IntegrationStatusEnum.DISCONNECTED,
                "status_text": "Not Configured",
                "error": "Missing configuration"
            }

        config = integration.config
        host = config.get("host")
        port = config.get("port", 587)
        username = config.get("username")
        password = config.get("password")
        use_tls = config.get("use_tls", True)

        if not host or not username or not password:
             return {
                "status": IntegrationStatusEnum.DISCONNECTED,
                "status_text": "Incomplete Config",
                "error": "Missing host, username, or password"
            }

        try:
            server = smtplib.SMTP(host, port, timeout=5)
            if use_tls:
                server.starttls()
            
            server.login(username, password)
            server.quit()
            
            return {
                "status": IntegrationStatusEnum.CONNECTED,
                "status_text": "Active",
                "error": None
            }
            
        except Exception as e:
            return {
                "status": IntegrationStatusEnum.DISCONNECTED,
                "status_text": "Connection Failed",
                "error": str(e)
            }

smtp_service = SMTPService()
