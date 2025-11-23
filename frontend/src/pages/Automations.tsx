import React, { useState, useEffect } from "react";
import AutomationBuilder from "../../components/automations/AutomationBuilder";
import axios from "axios";

interface Automation {
    id: number;
    name: string;
    trigger_type: string;
    is_active: boolean;
    created_at: string;
}

const AutomationsPage: React.FC = () => {
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [showBuilder, setShowBuilder] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAutomations();
    }, []);

    const fetchAutomations = async () => {
        try {
            // Mock data for now
            await new Promise(resolve => setTimeout(resolve, 500));
            const mockData: Automation[] = [
                {
                    id: 1,
                    name: "Welcome Email Flow",
                    trigger_type: "new_lead",
                    is_active: true,
                    created_at: new Date().toISOString(),
                },
                {
                    id: 2,
                    name: "Follow-up Reminder",
                    trigger_type: "status_change",
                    is_active: false,
                    created_at: new Date().toISOString(),
                },
            ];
            setAutomations(mockData);
        } catch (error) {
            console.error("Failed to fetch automations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAutomation = async (automation: any) => {
        try {
            // In real app: await axios.post('http://localhost:8000/api/automations', automation);
            console.log("Saving automation:", automation);
            setShowBuilder(false);
            fetchAutomations();
        } catch (error) {
            console.error("Failed to save automation", error);
        }
    };

    const toggleActive = async (id: number) => {
        // In real app: await axios.patch(`http://localhost:8000/api/automations/${id}`, { is_active: !current });
        setAutomations(automations.map(a =>
            a.id === id ? { ...a, is_active: !a.is_active } : a
        ));
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Automations</h1>
                    <p className="text-muted-foreground">Create no-code workflows to automate your lead management.</p>
                </div>
                <button
                    onClick={() => setShowBuilder(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    + Create Automation
                </button>
            </div>

            {loading && <div>Loading automations...</div>}

            <div className="space-y-4">
                {automations.map((automation) => (
                    <div key={automation.id} className="border rounded-lg p-4 bg-card shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">{automation.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${automation.is_active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}>
                                        {automation.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Trigger: <span className="font-medium">{automation.trigger_type.replace("_", " ")}</span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleActive(automation.id)}
                                    className="px-3 py-1 text-sm border rounded-md hover:bg-muted"
                                >
                                    {automation.is_active ? "Disable" : "Enable"}
                                </button>
                                <button className="px-3 py-1 text-sm border rounded-md hover:bg-muted">
                                    Edit
                                </button>
                                <button className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {automations.length === 0 && !loading && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No automations created yet.</p>
                        <button
                            onClick={() => setShowBuilder(true)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Create Your First Automation
                        </button>
                    </div>
                )}
            </div>

            {showBuilder && (
                <AutomationBuilder
                    onSave={handleSaveAutomation}
                    onCancel={() => setShowBuilder(false)}
                />
            )}
        </div>
    );
};

export default AutomationsPage;
