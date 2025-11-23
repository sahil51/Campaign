import React from "react";
import { StatusIndicator, StatusType } from "./StatusIndicator";

interface IntegrationCardProps {
    name: string;
    logo?: React.ReactNode;
    status: StatusType;
    statusText?: string;
    lastSync?: string;
    onManage?: () => void;
    className?: string;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
    name,
    logo,
    status,
    statusText,
    lastSync,
    onManage,
    className,
}) => {
    return (
        <div className={`border rounded-lg p-4 bg-card shadow-sm ${className || ''}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {logo && <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">{logo}</div>}
                    <div>
                        <h3 className="font-semibold text-lg">{name}</h3>
                        <StatusIndicator status={status} text={statusText} size="sm" />
                    </div>
                </div>
                {onManage && (
                    <button
                        onClick={onManage}
                        className="px-3 py-1 text-sm border rounded-md hover:bg-muted transition-colors"
                    >
                        Manage
                    </button>
                )}
            </div>

            {lastSync && (
                <div className="text-xs text-muted-foreground mt-2">
                    Last synced: {lastSync}
                </div>
            )}
        </div>
    );
};
