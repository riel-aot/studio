'use client';

import React from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebhook } from "@/lib/hooks";
import type { HealthCheckData } from "@/lib/events";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function StatusIndicator({ status, text }: { status: boolean; text: string }) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="font-medium">{text}</span>
            <div className={cn(
                "flex items-center gap-2 text-sm",
                status ? "text-green-600" : "text-destructive"
            )}>
                {status ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
                {status ? "Connected" : "Error"}
            </div>
        </div>
    )
}

function StatusSkeleton() {
    return <Skeleton className="h-[58px] w-full" />
}

export default function IntegrationsPage() {
    const { data, isLoading, error, trigger } = useWebhook<{}, HealthCheckData>({ 
        eventName: 'HEALTH_CHECK',
        manual: true // We will trigger it with a button
    });
    
    // Trigger on first load
    React.useEffect(() => {
        trigger();
    }, [trigger]);

    return (
        <div>
        <PageHeader
            title="Integration Status"
            description="Health check for connected services (for developer use)."
            actions={
                <Button variant="outline" onClick={() => trigger()} disabled={isLoading}>
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            }
        />
        <Card className="max-w-2xl">
            <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
                This page is for developers to debug the connection status of backend services. It is not intended for end users.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading && (
                    <>
                        <StatusSkeleton />
                        <StatusSkeleton />
                        <StatusSkeleton />
                    </>
                )}
                {error && <p className="text-destructive">Failed to fetch health status: {error.message}</p>}
                {data && (
                    <>
                        <StatusIndicator status={data.authConfigured} text="Authentication Provider" />
                        <StatusIndicator status={data.webhookConfigured} text="Webhook Gateway (n8n)" />
                        <StatusIndicator status={data.databaseConnected} text="Database Connection" />
                        {data.lastSuccessfulCall && (
                            <div className="text-sm text-muted-foreground pt-2">
                                Last successful webhook call: {new Date(data.lastSuccessfulCall).toLocaleString()}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
        </div>
    );
}
