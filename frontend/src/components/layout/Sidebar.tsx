import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useIntegrationStatus } from "../../hooks/useIntegrationStatus";
import { StatusIndicator } from "../ui/StatusIndicator";

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { integrations } = useIntegrationStatus();

    const isActive = (path: string) => location.pathname === path;

    const getStatus = (type: string) => {
        const integration = integrations.find(i => i.type === type);
        return integration?.status || "disconnected";
    };

    return (
        <div className="w-64 border-r bg-card h-screen flex flex-col">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold">Campaign AI</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <Link
                    to="/dashboard"
                    className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                        isActive("/dashboard") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    Dashboard
                </Link>
                <Link
                    to="/campaigns"
                    className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                        isActive("/campaigns") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    Campaigns
                </Link>
                <Link
                    to="/automations"
                    className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                        isActive("/automations") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    Automations
                </Link>

                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Settings
                    </p>
                </div>

                <Link
                    to="/settings/integrations"
                    className={cn(
                        "flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md",
                        isActive("/settings/integrations") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    <span>Integrations</span>
                    <div className="flex gap-1">
                        <StatusIndicator status={getStatus("meta")} showText={false} size="sm" />
                        <StatusIndicator status={getStatus("webhook")} showText={false} size="sm" />
                    </div>
                </Link>

                <Link
                    to="/settings/team"
                    className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                        isActive("/settings/team") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    Team
                </Link>
            </nav>

            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        JD
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
