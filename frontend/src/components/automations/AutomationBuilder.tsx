import React, { useState } from "react";
import { cn } from "../../lib/utils";

interface AutomationBuilderProps {
    onSave: (automation: any) => void;
    onCancel: () => void;
    initialData?: any;
}

const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ onSave, onCancel, initialData }) => {
    const [name, setName] = useState(initialData?.name || "");
    const [triggerType, setTriggerType] = useState(initialData?.trigger_type || "new_lead");
    const [conditions, setConditions] = useState(initialData?.trigger_config?.conditions || []);
    const [actions, setActions] = useState(initialData?.actions || []);

    const addCondition = () => {
        setConditions([...conditions, { field: "source", operator: "equals", value: "" }]);
    };

    const updateCondition = (index: number, key: string, value: string) => {
        const updated = [...conditions];
        updated[index][key] = value;
        setConditions(updated);
    };

    const removeCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const addAction = (type: string) => {
        const newAction: any = { type };
        if (type === "send_email") {
            newAction.template_id = 1;
            newAction.to = "{{email}}";
        } else if (type === "update_lead") {
            newAction.updates = { status: "contacted" };
        } else if (type === "webhook") {
            newAction.url = "";
        }
        setActions([...actions, newAction]);
    };

    const updateAction = (index: number, data: any) => {
        const updated = [...actions];
        updated[index] = { ...updated[index], ...data };
        setActions(updated);
    };

    const removeAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const automation = {
            name,
            trigger_type: triggerType,
            trigger_config: { conditions },
            actions,
            is_active: true,
        };
        onSave(automation);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">Automation Builder</h2>
                    <p className="text-sm text-muted-foreground">Create a no-code workflow</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Automation Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="e.g., Welcome Email Flow"
                        />
                    </div>

                    {/* Trigger */}
                    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <span className="text-blue-600">⚡</span> Trigger
                        </h3>
                        <select
                            value={triggerType}
                            onChange={(e) => setTriggerType(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="new_lead">When a new lead is created</option>
                            <option value="status_change">When lead status changes</option>
                            <option value="field_update">When a field is updated</option>
                        </select>
                    </div>

                    {/* Conditions */}
                    <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Conditions (Optional)</h3>
                            <button
                                onClick={addCondition}
                                className="text-sm px-3 py-1 border rounded-md hover:bg-muted"
                            >
                                + Add Condition
                            </button>
                        </div>
                        {conditions.map((condition: any, index: number) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <select
                                    value={condition.field}
                                    onChange={(e) => updateCondition(index, "field", e.target.value)}
                                    className="px-3 py-2 border rounded-md"
                                >
                                    <option value="source">Source</option>
                                    <option value="status">Status</option>
                                    <option value="email">Email</option>
                                </select>
                                <select
                                    value={condition.operator}
                                    onChange={(e) => updateCondition(index, "operator", e.target.value)}
                                    className="px-3 py-2 border rounded-md"
                                >
                                    <option value="equals">Equals</option>
                                    <option value="contains">Contains</option>
                                </select>
                                <input
                                    type="text"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, "value", e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-md"
                                    placeholder="Value"
                                />
                                <button
                                    onClick={() => removeCondition(index)}
                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="text-green-600">⚙️</span> Actions
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => addAction("send_email")}
                                    className="text-sm px-3 py-1 border rounded-md hover:bg-muted"
                                >
                                    + Email
                                </button>
                                <button
                                    onClick={() => addAction("update_lead")}
                                    className="text-sm px-3 py-1 border rounded-md hover:bg-muted"
                                >
                                    + Update
                                </button>
                                <button
                                    onClick={() => addAction("webhook")}
                                    className="text-sm px-3 py-1 border rounded-md hover:bg-muted"
                                >
                                    + Webhook
                                </button>
                            </div>
                        </div>
                        {actions.map((action: any, index: number) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-md mb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium capitalize">{action.type.replace("_", " ")}</span>
                                    <button
                                        onClick={() => removeAction(index)}
                                        className="text-red-600 hover:bg-red-50 px-2 rounded"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {action.type === "send_email" && (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={action.to || ""}
                                            onChange={(e) => updateAction(index, { to: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="To: {{email}}"
                                        />
                                    </div>
                                )}
                                {action.type === "webhook" && (
                                    <input
                                        type="text"
                                        value={action.url || ""}
                                        onChange={(e) => updateAction(index, { url: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                        placeholder="Webhook URL"
                                    />
                                )}
                            </div>
                        ))}
                        {actions.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No actions added yet. Click a button above to add one.
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border rounded-md hover:bg-muted"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Save Automation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutomationBuilder;
