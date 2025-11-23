import React from "react";
import { useNavigate } from "react-router-dom";
import { IntegrationCard } from "../../components/ui/IntegrationCard";
import { useIntegrationStatus } from "../../hooks/useIntegrationStatus";

const IntegrationsPage: React.FC = () => {
  const { integrations, loading, error } = useIntegrationStatus();
  const navigate = useNavigate();

  const getLogo = (type: string) => {
    switch (type) {
      case "meta": return <span className="text-xl">∞</span>;
      case "webhook": return <span className="text-xl">🔗</span>;
      case "smtp": return <span className="text-xl">📧</span>;
      default: return <span className="text-xl">🔌</span>;
    }
  };

  const handleManage = (type: string) => {
    navigate(`/settings/integrations/${type}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-muted-foreground">Manage your connections to external services.</p>
      </div>

      {loading && <div>Loading status...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            name={integration.name}
            status={integration.status}
            statusText={integration.statusText}
            lastSync={integration.lastSync}
            logo={getLogo(integration.type)}
            onManage={() => handleManage(integration.type)}
          />
        ))}

        {/* Placeholders for future integrations */}
        <IntegrationCard
          name="Google Sheets"
          status="disconnected"
          statusText="Coming Soon"
          logo={<span className="text-xl">📊</span>}
        />
        <IntegrationCard
          name="WhatsApp API"
          status="disconnected"
          statusText="Coming Soon"
          logo={<span className="text-xl">💬</span>}
        />
      </div>
    </div>
  );
};

export default IntegrationsPage;
