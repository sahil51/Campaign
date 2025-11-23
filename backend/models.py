from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class IntegrationStatusEnum(str, enum.Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    WARNING = "warning"

class LinkTypeEnum(str, enum.Enum):
    DASHBOARD = "dashboard"
    CSV = "csv"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    leads = relationship("Lead", back_populates="campaign")
    integrations = relationship("Integration", back_populates="campaign")
    automations = relationship("Automation", back_populates="campaign")
    public_links = relationship("PublicLink", back_populates="campaign")
    webhook_endpoints = relationship("WebhookEndpoint", back_populates="campaign")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    email = Column(String, index=True, nullable=True)
    phone = Column(String, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    status = Column(String, default="new")
    source = Column(String, nullable=True) # e.g., "meta", "webhook", "manual"
    data = Column(JSON, nullable=True) # Flexible field for extra data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    campaign = relationship("Campaign", back_populates="leads")

class WebhookEndpoint(Base):
    __tablename__ = "webhook_endpoints"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    key = Column(String, unique=True, index=True)  # UUID for URL
    secret = Column(String)  # Secret token for validation
    name = Column(String)  # User-friendly name
    field_mapping = Column(JSON, nullable=True)  # Custom field mappings
    is_active = Column(Boolean, default=True)
    last_received_at = Column(DateTime(timezone=True), nullable=True)
    total_received = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", back_populates="webhook_endpoints")
    events = relationship("WebhookEvent", back_populates="endpoint")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(Integer, primary_key=True, index=True)
    endpoint_id = Column(Integer, ForeignKey("webhook_endpoints.id"))
    payload = Column(JSON)  # Raw incoming payload
    normalized_data = Column(JSON)  # After mapping
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    status = Column(String)  # "success", "failed", "duplicate"
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    endpoint = relationship("WebhookEndpoint", back_populates="events")
    lead = relationship("Lead")

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True) # Some integrations might be global
    type = Column(String) # "meta", "webhook", "smtp", etc.
    name = Column(String)
    config = Column(JSON, nullable=True) # API keys, tokens, settings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", back_populates="integrations")
    status = relationship("IntegrationStatus", back_populates="integration", uselist=False)
    logs = relationship("SyncLog", back_populates="integration")

class IntegrationStatus(Base):
    __tablename__ = "integration_status"

    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), unique=True)
    status = Column(Enum(IntegrationStatusEnum), default=IntegrationStatusEnum.DISCONNECTED)
    status_text = Column(String, nullable=True) # "Active", "Token Expired", etc.
    last_sync_time = Column(DateTime(timezone=True), nullable=True)
    next_sync_time = Column(DateTime(timezone=True), nullable=True)
    error_count = Column(Integer, default=0)
    last_error_message = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    integration = relationship("Integration", back_populates="status")

class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"))
    status = Column(String) # "success", "failure"
    message = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    integration = relationship("Integration", back_populates="logs")

class Automation(Base):
    __tablename__ = "automations"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    name = Column(String)
    trigger_type = Column(String) # "new_lead", "status_change"
    trigger_config = Column(JSON, nullable=True)
    actions = Column(JSON) # List of actions to perform
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", back_populates="automations")

class PublicLink(Base):
    __tablename__ = "public_links"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    uuid = Column(String, unique=True, index=True)
    type = Column(Enum(LinkTypeEnum))
    password_hash = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", back_populates="public_links")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String)
    resource_type = Column(String)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
