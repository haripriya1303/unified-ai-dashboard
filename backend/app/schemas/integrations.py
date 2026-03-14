"""Integrations request/response schemas."""
from pydantic import BaseModel


class IntegrationOut(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    status: str  # connected | disconnected | pending
    category: str
    lastSync: str | None = None  # frontend camelCase
    eventsCount: int | None = None


class IntegrationConnectIn(BaseModel):
    integration_id: str
    enabled_features: list[str] | None = None  # frontend may send as connectedApps
    connectedApps: list[str] | None = None  # alias from frontend
    email: str | None = None
    domain: str | None = None


class IntegrationDisconnectIn(BaseModel):
    integration_id: str
