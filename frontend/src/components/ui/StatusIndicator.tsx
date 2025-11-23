import React from "react";
import { cn } from "../../lib/utils";

export type StatusType = "connected" | "disconnected" | "warning";

interface StatusIndicatorProps {
    status: StatusType;
    text?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const statusColors = {
    connected: "bg-green-500",
    disconnected: "bg-red-500",
    warning: "bg-yellow-500",
};

const statusTextDefault = {
    connected: "Active",
    disconnected: "Not Connected",
    warning: "Warning",
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    text,
    showText = true,
    size = "md",
    className,
}) => {
    const sizeClasses = {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div
                className={cn(
                    "rounded-full",
                    statusColors[status],
                    sizeClasses[size]
                )}
            />
            {showText && (
                <span className="text-sm text-muted-foreground">
                    {text || statusTextDefault[status]}
                </span>
            )}
        </div>
    );
};
