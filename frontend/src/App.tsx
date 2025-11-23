import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import CampaignDetail from "./pages/CampaignDetail";
import IntegrationsPage from "./pages/settings/Integrations";
import AutomationsPage from "./pages/Automations";
import PublicDashboard from "./pages/public/PublicDashboard";
import WebhookIntegration from "./pages/settings/integrations/WebhookIntegration";
import MetaIntegration from "./pages/settings/integrations/MetaIntegration";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (no sidebar) */}
        <Route path="/public/:uuid" element={<PublicDashboard />} />

        {/* Authenticated routes (with sidebar) */}
        <Route path="/*" element={
          <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/automations" element={<AutomationsPage />} />
                <Route path="/settings/integrations" element={<IntegrationsPage />} />
                <Route path="/settings/integrations/webhook" element={<WebhookIntegration />} />
                <Route path="/settings/integrations/meta" element={<MetaIntegration />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
