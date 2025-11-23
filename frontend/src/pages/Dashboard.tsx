import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { dashboardApi } from "../api/client";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DashboardStats {
    total_leads: number;
    leads_today: number;
    active_campaigns: number;
    conversion_rate: number;
}

interface LeadOverTime {
    date: string;
    count: number;
}

interface LeadByCampaign {
    campaign: string;
    count: number;
}

interface CampaignOverview {
    id: number;
    name: string;
    description: string;
    total_leads: number;
    leads_today: number;
    owner: string;
    status: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [leadsOverTime, setLeadsOverTime] = useState<LeadOverTime[]>([]);
    const [leadsByCampaign, setLeadsByCampaign] = useState<LeadByCampaign[]>([]);
    const [campaigns, setCampaigns] = useState<CampaignOverview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState(30);

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsRes, leadsTimeRes, leadsCampaignRes, campaignsRes] = await Promise.all([
                dashboardApi.getStats(),
                dashboardApi.getLeadsOverTime(dateRange),
                dashboardApi.getLeadsByCampaign(),
                dashboardApi.getCampaignsOverview(),
            ]);

            setStats(statsRes.data);
            setLeadsOverTime(leadsTimeRes.data);
            setLeadsByCampaign(leadsCampaignRes.data);
            setCampaigns(campaignsRes.data);
            setLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch dashboard data", err);
            setError(err.response?.data?.detail || "Failed to load dashboard. Backend may not be running.");
            setLoading(false);

            // Fallback to empty data
            setStats({
                total_leads: 0,
                leads_today: 0,
                active_campaigns: 0,
                conversion_rate: 0
            });
            setLeadsOverTime([]);
            setLeadsByCampaign([]);
            setCampaigns([]);
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

    const barChartData = {
        labels: leadsByCampaign.map(d => d.campaign),
        datasets: [
            {
                label: "Leads",
                data: leadsByCampaign.map(d => d.count),
                backgroundColor: "rgba(59, 130, 246, 0.8)",
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
        return <div className="p-6">Loading dashboard...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your lead generation workspace</p>
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
                    <p className="text-3xl font-bold">{stats?.total_leads.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-2">↑ All time</p>
                </div>

                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1">Leads Today</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.leads_today}</p>
                    <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
                </div>

                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1">Active Campaigns</p>
                    <p className="text-3xl font-bold">{stats?.active_campaigns}</p>
                    <p className="text-xs text-muted-foreground mt-2">Currently running</p>
                </div>

                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.conversion_rate}%</p>
                    <p className="text-xs text-muted-foreground mt-2">Contacted / Total</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-card border rounded-lg p-6 shadow-sm">
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
                    <div style={{ height: "300px" }}>
                        {leadsOverTime.length > 0 ? (
                            <Line data={lineChartData} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Leads by Campaign</h3>
                    <div style={{ height: "300px" }}>
                        {leadsByCampaign.length > 0 ? (
                            <Bar data={barChartData} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="font-semibold text-lg">Campaign Overview</h3>
                </div>
                <div className="overflow-x-auto">
                    {campaigns.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Campaign Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Total Leads</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Today</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Owner</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign) => (
                                    <tr
                                        key={campaign.id}
                                        className="border-b hover:bg-muted/50 cursor-pointer"
                                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium">{campaign.name}</p>
                                                <p className="text-sm text-muted-foreground">{campaign.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{campaign.total_leads}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-blue-600 font-medium">+{campaign.leads_today}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{campaign.owner}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${campaign.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                className="text-sm text-primary hover:underline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/campaigns/${campaign.id}`);
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">
                            <p>No campaigns found. Create your first campaign to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
