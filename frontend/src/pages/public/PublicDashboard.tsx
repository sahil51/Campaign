import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const PublicDashboard: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const [data, setData] = useState<any>(null);
    const [password, setPassword] = useState("");
    const [needsPassword, setNeedsPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async (pwd?: string) => {
        try {
            // In real app: const response = await axios.get(`http://localhost:8000/api/public-links/${uuid}`, { params: { password: pwd } });

            // Mock data
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockData = {
                campaign: {
                    id: 1,
                    name: "Summer Campaign 2024",
                    description: "Lead generation for summer products"
                },
                leads: [
                    { id: 1, email: "john@example.com", full_name: "John Doe", status: "new", created_at: new Date().toISOString() },
                    { id: 2, email: "jane@example.com", full_name: "Jane Smith", status: "contacted", created_at: new Date().toISOString() },
                ],
                stats: {
                    total_leads: 2,
                    new_leads: 1
                }
            };

            setData(mockData);
            setLoading(false);
        } catch (err: any) {
            if (err.response?.status === 401) {
                setNeedsPassword(true);
            } else {
                setError("Failed to load dashboard");
            }
            setLoading(false);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDashboard(password);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (needsPassword && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4">Password Required</h2>
                    <p className="text-muted-foreground mb-4">This dashboard is password protected.</p>
                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md mb-4"
                            placeholder="Enter password"
                        />
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Access Dashboard
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>🔗</span>
                        <span>Public Dashboard (Read-Only)</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{data?.campaign.name}</h1>
                    <p className="text-muted-foreground">{data?.campaign.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card p-6 rounded-lg shadow-sm border">
                        <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
                        <p className="text-3xl font-bold">{data?.stats.total_leads}</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg shadow-sm border">
                        <p className="text-sm text-muted-foreground mb-1">New Leads</p>
                        <p className="text-3xl font-bold text-green-600">{data?.stats.new_leads}</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg shadow-sm border">
                        <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                        <p className="text-3xl font-bold">45%</p>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Leads</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.leads.map((lead: any) => (
                                    <tr key={lead.id} className="border-b">
                                        <td className="px-4 py-3">{lead.full_name}</td>
                                        <td className="px-4 py-3">{lead.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicDashboard;
