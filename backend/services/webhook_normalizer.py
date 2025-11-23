from typing import Dict, Any, Optional

class WebhookNormalizer:
    """
    Service to normalize diverse webhook payloads into standard lead format.
    Supports auto-detection of common fields and custom field mappings.
    """
    
    # Common field name variations
    EMAIL_FIELDS = [
        "email", "Email", "e-mail", "emailAddress", "email_address", 
        "user_email", "contact_email", "mail"
    ]
    NAME_FIELDS = [
        "name", "Name", "full_name", "fullName", "fullname", 
        "contact_name", "userName", "user_name"
    ]
    PHONE_FIELDS = [
        "phone", "Phone", "telephone", "mobile", "phone_number", 
        "phoneNumber", "contact_number", "tel"
    ]
    
    def normalize(self, payload: dict, custom_mapping: Optional[dict] = None) -> dict:
        """
        Normalize incoming webhook payload to standard lead format.
        
        Args:
            payload: Raw JSON from webhook
            custom_mapping: Optional custom field mappings
                Example: {"entry.123": "email", "entry.456": "full_name"}
        
        Returns:
            Normalized dict with keys: email, full_name, phone, data
        """
        if custom_mapping:
            return self._apply_custom_mapping(payload, custom_mapping)
        
        return self._auto_detect_fields(payload)
    
    def _apply_custom_mapping(self, payload: dict, mapping: dict) -> dict:
        """Apply user-defined custom field mappings"""
        flat_payload = self._flatten_dict(payload)
        
        normalized = {
            "email": None,
            "full_name": None,
            "phone": None,
            "data": payload
        }
        
        for source_field, target_field in mapping.items():
            if source_field in flat_payload and target_field in normalized:
                normalized[target_field] = str(flat_payload[source_field])
        
        return normalized
    
    def _auto_detect_fields(self, payload: dict) -> dict:
        """Auto-detect common fields from payload"""
        flat_payload = self._flatten_dict(payload)
        
        normalized = {
            "email": self._find_field(flat_payload, self.EMAIL_FIELDS),
            "full_name": self._find_field(flat_payload, self.NAME_FIELDS),
            "phone": self._find_field(flat_payload, self.PHONE_FIELDS),
            "data": payload  # Store full payload for reference
        }
        
        return normalized
    
    def _find_field(self, flat_dict: dict, field_names: list) -> Optional[str]:
        """Search for field in flattened dict using multiple possible names"""
        for field_name in field_names:
            if field_name in flat_dict:
                value = flat_dict[field_name]
                return str(value) if value is not None else None
        
        return None
    
    def _flatten_dict(self, d: dict, parent_key: str = '', sep: str = '.') -> dict:
        """
        Flatten nested dictionary.
        Example: {"data": {"email": "test@example.com"}} -> {"data.email": "test@example.com"}
        """
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)

webhook_normalizer = WebhookNormalizer()
