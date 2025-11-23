import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from ..main import app

# Dummy session to replace DB dependency
class DummySession:
    def query(self, model):
        class QueryResult:
            def count(self):
                return 0
            def filter(self, *args, **kwargs):
                return self
        return QueryResult()

def test_get_dashboard_stats(monkeypatch):
    # Patch the get_db dependency to return a dummy session
    from ..routes import dashboard as dashboard_router
    monkeypatch.setattr(dashboard_router, "get_db", lambda: DummySession())
    client = TestClient(app)
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    # Verify expected keys are present
    expected_keys = {"total_leads", "leads_today", "active_campaigns", "conversion_rate"}
    assert expected_keys.issubset(data.keys())
