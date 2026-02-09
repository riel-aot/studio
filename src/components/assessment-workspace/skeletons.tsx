'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AssessmentWorkspaceSkeleton() {
    return (
        <div className="w-full">
            {/* Header Skeleton */}
            <div className="mb-6">
                <div className="mb-4">
                    <Skeleton className="h-9 w-36" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-11 w-40" />
                    </div>
                </div>
            </div>

            {/* Body Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel */}
                <div className="lg:col-span-3">
                    <Card className="h-full">
                        <CardHeader>
                            <Skeleton className="h-6 w-20 mb-2" />
                            <Skeleton className="h-4 w-40" />
                        </CardHeader>
                        <CardContent>
                             <Tabs defaultValue="typed">
                                <TabsList className="grid w-full grid-cols-2">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                </TabsList>
                                <TabsContent value="typed" className="pt-4 space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-64 w-full" />
                                    <Skeleton className="h-11 w-28" />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
                {/* Center Panel */}
                <div className="lg:col-span-5">
                    <Card className="h-full">
                        <CardHeader>
                            <Skeleton className="h-6 w-24 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border p-4 space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Right Panel */}
                <div className="lg:col-span-4">
                    <Card className="h-full">
                        <CardHeader>
                            <Skeleton className="h-6 w-36 mb-2" />
                            <Skeleton className="h-4 w-52" />
                        </CardHeader>
                        <CardContent>
                             <Tabs defaultValue="suggestions">
                                <TabsList className="grid w-full grid-cols-2">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                </TabsList>
                                <TabsContent value="suggestions" className="pt-4 space-y-4">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
