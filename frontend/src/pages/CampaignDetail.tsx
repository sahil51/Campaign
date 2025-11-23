import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";

interface CampaignStats {
    campaign: {
        id: number;
        name: string;
        description: string;
        owner: string;
        source: string;
    };
    stats: {
        total_leads: number;
        leads_today: number;
        new_leads: number;
        contacted_leads: number;
        conversion_rate: number;
    };
}

interface Lead {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    status: string;
    source: string;
    created_at: string;
}

interface Automation {
    id: number;
    name: string;
    trigger_type: string;
    is_active: boolean;
    actions_count: number;
}

const CampaignDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [stats, setStats] = useState<CampaignStats | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [leadsOverTime, setLeadsOverTime] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [dateRange, setDateRange] = useState(30);

    useEffect(() => {
        fetchCampaignData();
    }, [id, statusFilter, dateRange]);

    const fetchCampaignData = async () => {
        try {
            // Mock data for now
            await new Promise(resolve => setTimeout(resolve, 500));

            setStats({
                campaign: {
                    id: Number(id),
                    name: "Summer Sale 2024",
                    description: "Q2 promotional campaign",
                    owner: "John Doe",
                    source: "Meta Lead Ads"
                },
                stats: {
                    total_leads: 342,
                    leads_today: 12,
                    new_leads: 156,
                    contacted_leads: 118,
                    conversion_rate: 34.5
                }
            });

            // Mock time series
            const mockTimeData = [];
            for (let i = dateRange; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                mockTimeData.push({
                    date: date.toISOString().split('T')[0],
                    count: Math.floor(Math.random() * 20) + 5
                });
            }
            setLeadsOverTime(mockTimeData);

            setLeads([
                {
                    id: 1,
                    email: "john@example.com",
                    full_name: "John Doe",
                    phone: "+1234567890",
                    status: "new",
                    source: "meta",
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    email: "jane@example.com",
                    full_name: "Jane Smith",
                    phone: "+1234567891",
                    status: "contacted",
                    source: "webhook",
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    email: "bob@example.com",
                    full_name: "Bob Johnson",
                    phone: "+1234567892",
                    status: "new",
                    source: "meta",
                    created_at: new Date().toISOString()
                }
            ]);

            setAutomations([
                {
                    id: 1,
                    name: "Welcome Email",
                    trigger_type: "new_lead",
                    is_active: true,
                    actions_count: 2
                },
                {
                    id: 2,
                    name: "Follow-up Sequence",
                    trigger_type: "status_change",
                    is_active: false,
                    actions_count: 3
                }
            ]);

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch campaign data", error);
            setLoading(false);
        }
    };

    const lineChartData = {
        labels: leadsOverTime.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: "Leads",
                data: leadsOverTime.map(d => d.count),
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    if (loading) {
        return <div className="p-6">Loading campaign...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <a href="/dashboard" className="hover:underline">Dashboard</a>
                    <span>/</span>
                    <span>Campaign Detail</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{stats?.campaign.name}</h1>
                <p className="text-muted-foreground">{stats?.campaign.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                    <span><strong>Owner:</strong> {stats?.campaign.owner}</span>
                    <span><strong>Source:</strong> {stats?.campaign.source}</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Total Leads</p>
                    <p className="text-2xl font-bold">{stats?.stats.total_leads}</p>
                </div>
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Today</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.stats.leads_today}</p>
                </div>
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">New</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.stats.new_leads}</p>
                </div>
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Contacted</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.stats.contacted_leads}</p>
                </div>
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Conversion</p>
                    <p className="text-2xl font-bold">{stats?.stats.conversion_rate}%</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-card border rounded-lg p-6 shadow-sm mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Leads Over Time</h3>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(Number(e.target.value))}
                        className="px-3 py-1 border rounded-md text-sm"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                </div>
                <div style={{ height: "250px" }}>
                    <Line data={lineChartData} options={chartOptions} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leads Table */}
                <div className="lg:col-span-2 bg-card border rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Leads</h3>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1 border rounded-md text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium">{lead.full_name}</td>
                                        <td className="px-4 py-3 text-sm">{lead.email}</td>
                                        <td className="px-4 py-3 text-sm">{lead.phone}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${lead.status === 'new'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
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

                {/* Automation Summary Widget */}
                <div className="bg-card border rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-lg mb-4">Linked Automations</h3>
                    <div className="space-y-3">
                        {automations.map((auto) => (
                            <div key={auto.id} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-sm">{auto.name}</p>
                                    <div className={`w-2 h-2 rounded-full ${auto.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Trigger: {auto.trigger_type.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {auto.actions_count} action{auto.actions_count !== 1 ? 's' : ''}
                                </p>
                            </div>
                        ))}
                        {automations.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No automations linked
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
