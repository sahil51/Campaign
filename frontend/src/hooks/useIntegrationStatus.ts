import { useState, useEffect } from 'react';
import axios from 'axios';

export type StatusType = "connected" | "disconnected" | "warning";

export interface IntegrationStatus {
    id: number;
    name: string;
    type: string;
    status: StatusType;
    statusText: string;
    lastSync: string;
}

export const useIntegrationStatus = () => {
    const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        try {
            // In a real app, this would be your actual API endpoint
            // const response = await axios.get('http://localhost:8000/api/integrations');
            // For now, we'll simulate the API response based on the backend logic we just wrote

            // Simulating API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockData: IntegrationStatus[] = [
                {
                    id: 1,
                    name: "Meta Lead Ads",
                    type: "meta",
                    status: "connected",
                    statusText: "Active",
                    lastSync: "Just now"
                },
                {
                    id: 2,
                    name: "Incoming Webhook",
                    type: "webhook",
                    status: "warning",
                    statusText: "Idle (No events in 24h)",
                    lastSync: "2 days ago"
                },
                {
                    id: 3,
                    name: "SMTP Email",
                    type: "smtp",
                    status: "disconnected",
                    statusText: "Not Configured",
                    lastSync: "Never"
                }
            ];

            setIntegrations(mockData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch integration status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Poll every 30 seconds
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    return { integrations, loading, error, refresh: fetchStatus };
};
