import React, { useState, useEffect } from "react";
import axios from "axios";

interface WebhookEndpoint {
    id: number;
    campaign_id: number;
    key: string;
    secret: string;
    name: string;
    is_active: boolean;
    last_received_at: string | null;
    total_received: number;
    created_at: string;
}

const WebhookIntegration: React.FC = () => {
    const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const fetchWebhooks = async () => {
        try {
            // Mock data for now
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockData: WebhookEndpoint[] = [
                {
                    id: 1,
                    campaign_id: 1,
                    key: "abc123-def456",
                    secret: "secret_xyz789",
                    name: "Contact Form",
                    is_active: true,
                    last_received_at: new Date().toISOString(),
                    total_received: 42,
                    created_at: new Date().toISOString()
                }
            ];
            setWebhooks(mockData);
        } catch (error) {
            console.error("Failed to fetch webhooks", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const getWebhookUrl = (key: string) => {
        return `${window.location.origin}/api/webhooks/incoming/${key}`;
    };

    const getStatusColor = (webhook: WebhookEndpoint) => {
        if (!webhook.last_received_at) return "bg-gray-500";
        const hoursSinceLastEvent = (Date.now() - new Date(webhook.last_received_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastEvent < 24) return "bg-green-500";
        if (hoursSinceLastEvent < 168) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Incoming Webhooks</h1>
                    <p className="text-muted-foreground">
                        Receive leads from external sources like Google Forms, Webflow, and Zapier
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    + Create Webhook
                </button>
            </div>

            {loading && <div>Loading webhooks...</div>}

            <div className="space-y-4">
                {webhooks.map((webhook) => (
                    <div key={webhook.id} className="border rounded-lg p-6 bg-card shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(webhook)}`} />
                                <div>
                                    <h3 className="text-lg font-semibold">{webhook.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Campaign ID: {webhook.campaign_id} • {webhook.total_received} events received
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedWebhook(webhook)}
                                    className="px-3 py-1 text-sm border rounded-md hover:bg-muted"
                                >
                                    View Details
                                </button>
                                <button className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50">
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Webhook URL</label>
                                <div className="flex gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={getWebhookUrl(webhook.key)}
                                        readOnly
                                        className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(getWebhookUrl(webhook.key))}
                                        className="px-3 py-2 border rounded-md hover:bg-muted"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Secret Key</label>
                                <div className="flex gap-2 mt-1">
                                    <input
                                        type="password"
                                        value={webhook.secret}
                                        readOnly
                                        className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(webhook.secret)}
                                        className="px-3 py-2 border rounded-md hover:bg-muted"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Include as query parameter: ?secret={webhook.secret} or header: X-Webhook-Secret
                                </p>
                            </div>

                            {webhook.last_received_at && (
                                <div className="text-sm text-muted-foreground">
                                    Last event: {new Date(webhook.last_received_at).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {webhooks.length === 0 && !loading && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No webhooks created yet.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Create Your First Webhook
                        </button>
                    </div>
                )}
            </div>

            {/* Example Payloads Section */}
            <div className="mt-8 border rounded-lg p-6 bg-muted/50">
                <h3 className="font-semibold mb-4">Example Payloads</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium mb-2">Google Forms:</p>
                        <pre className="bg-card p-3 rounded text-xs overflow-x-auto">
                            {`{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890"
}`}
                        </pre>
                    </div>
                    <div>
                        <p className="text-sm font-medium mb-2">Webflow:</p>
                        <pre className="bg-card p-3 rounded text-xs overflow-x-auto">
                            {`{
  "data": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebhookIntegration;
