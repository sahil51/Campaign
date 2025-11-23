import React, { useState } from "react";

interface MetaConfig {
    access_token: string;
    app_id: string;
    app_secret: string;
    page_id: string;
}

const MetaIntegration: React.FC = () => {
    const [config, setConfig] = useState<MetaConfig>({
        access_token: "",
        app_id: "",
        app_secret: "",
        page_id: ""
    });
    const [isConnected, setIsConnected] = useState(false);
    const [testing, setTesting] = useState(false);

    const handleSave = async () => {
        try {
            // In real app: await axios.post('/api/integrations/meta/configure', config);
            console.log("Saving Meta config:", config);
            alert("Meta configuration saved!");
            setIsConnected(true);
        } catch (error) {
            console.error("Failed to save Meta config", error);
            alert("Failed to save configuration");
        }
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            // In real app: await axios.post('/api/integrations/meta/test');
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert("Connection test successful!");
        } catch (error) {
            alert("Connection test failed");
        } finally {
            setTesting(false);
        }
    };

    const handleDisconnect = () => {
        if (confirm("Are you sure you want to disconnect Meta integration?")) {
            setConfig({
                access_token: "",
                app_id: "",
                app_secret: "",
                page_id: ""
            });
            setIsConnected(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">Meta Lead Ads Integration</h1>
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <p className="text-muted-foreground">
                    Connect your Meta (Facebook) account to automatically sync leads from Lead Ads
                </p>
            </div>

            <div className="border rounded-lg p-6 bg-card shadow-sm space-y-6">
                <div>
                    <h3 className="font-semibold mb-4">Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Access Token</label>
                            <input
                                type="password"
                                value={config.access_token}
                                onChange={(e) => setConfig({ ...config, access_token: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Enter your Meta access token"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Get your access token from{" "}
                                <a
                                    href="https://developers.facebook.com/tools/accesstoken/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Meta Developer Tools
                                </a>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">App ID</label>
                            <input
                                type="text"
                                value={config.app_id}
                                onChange={(e) => setConfig({ ...config, app_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Your Meta App ID"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">App Secret</label>
                            <input
                                type="password"
                                value={config.app_secret}
                                onChange={(e) => setConfig({ ...config, app_secret: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Your Meta App Secret"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Page ID (Optional)</label>
                            <input
                                type="text"
                                value={config.page_id}
                                onChange={(e) => setConfig({ ...config, page_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Facebook Page ID"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Save Configuration
                    </button>
                    <button
                        onClick={handleTest}
                        disabled={testing || !config.access_token}
                        className="px-4 py-2 border rounded-md hover:bg-muted disabled:opacity-50"
                    >
                        {testing ? "Testing..." : "Test Connection"}
                    </button>
                    {isConnected && (
                        <button
                            onClick={handleDisconnect}
                            className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                        >
                            Disconnect
                        </button>
                    )}
                </div>
            </div>

            {/* Status Section */}
            {isConnected && (
                <div className="mt-6 border rounded-lg p-6 bg-card shadow-sm">
                    <h3 className="font-semibold mb-4">Connection Status</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="text-green-600 font-medium">✓ Connected</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Sync:</span>
                            <span>Just now</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Leads Synced (Today):</span>
                            <span className="font-medium">12</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-6 border rounded-lg p-6 bg-muted/50">
                <h3 className="font-semibold mb-3">Setup Instructions</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Create a Meta App at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com</a></li>
                    <li>Add the "Leads Retrieval" permission to your app</li>
                    <li>Generate a User Access Token with leads_retrieval permission</li>
                    <li>Copy your App ID and App Secret from the app dashboard</li>
                    <li>Paste the credentials above and click "Save Configuration"</li>
                    <li>Click "Test Connection" to verify the setup</li>
                </ol>
            </div>
        </div>
    );
};

export default MetaIntegration;
