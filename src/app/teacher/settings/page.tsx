
'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebhook } from "@/lib/hooks";
import type { HealthCheckData } from "@/lib/events";
import { CheckCircle2, AlertCircle, RefreshCw, Server, Database, Lock, User, Bell, ShieldCheck, Globe, Clock, BookOpen, GraduationCap, Calendar, ExternalLink, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { isWebhookConfigured } from '@/lib/webhook-config';
import { OnboardingTour } from '@/components/onboarding-tour';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function AccountTabContent() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        setFullName(user?.name ?? '');
    }, [user?.name]);

    return (
         <div className="space-y-6">
            <Card className="border-border/50 shadow-sm bg-card overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-secondary/5 border-b border-border/50 pb-8 pt-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-xl">
                                <AvatarImage src={user?.avatarUrl} />
                                <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                                    {user?.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                            <CardTitle className="text-2xl font-bold">{fullName}</CardTitle>
                            <CardDescription className="text-sm font-medium">{user?.email}</CardDescription>
                            <Badge variant="secondary" className="mt-2 uppercase tracking-widest px-3">{user?.role}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                    <div className="grid gap-8 sm:grid-cols-2">
                        <div className="space-y-3">
                            <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Display Name</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-secondary/20 h-12 rounded-xl border-border/50 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Time Zone</Label>
                            <Select defaultValue="utc-8">
                                <SelectTrigger className="h-12 bg-secondary/20 rounded-xl border-border/50">
                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="utc-8">Pacific Time (PT)</SelectItem>
                                    <SelectItem value="utc-5">Eastern Time (ET)</SelectItem>
                                    <SelectItem value="utc-0">Greenwich Mean Time (GMT)</SelectItem>
                                    <SelectItem value="utc+8">Singapore Standard Time (SGT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Interface Language</Label>
                            <Select defaultValue="en">
                                <SelectTrigger className="h-12 bg-secondary/20 rounded-xl border-border/50">
                                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="en">English (US)</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="zh">中文</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Security</Label>
                            <Button variant="outline" className="w-full h-12 rounded-xl justify-between px-4 font-bold border-border/50 bg-secondary/10 hover:bg-secondary/20">
                                <span>Update Password</span>
                                <ExternalLink className="h-4 w-4 opacity-50" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-secondary/5 p-8 border-t border-border/50 flex justify-end">
                    <Button onClick={() => toast({title: "Profile Saved", description: "Your account settings have been updated."})} className="font-bold rounded-xl h-12 px-10 shadow-lg shadow-primary/20">
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
         </div>
    )
}

function PreferencesTabContent() {
    const { toast } = useToast();

    return (
        <div className="space-y-6">
            <Card className="border-border/50 shadow-sm bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bell className="h-4 w-4 text-primary" />
                        </div>
                        Automated Delivery
                    </CardTitle>
                    <CardDescription>Configure when and how performance data is synchronized.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-secondary/10 rounded-2xl">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold">Weekly Digest Schedule</Label>
                            <p className="text-xs text-muted-foreground">When should we compile and send your weekly summary?</p>
                        </div>
                        <Select defaultValue="friday">
                            <SelectTrigger className="w-[180px] bg-background rounded-xl border-border/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="thursday">Every Thursday</SelectItem>
                                <SelectItem value="friday">Every Friday</SelectItem>
                                <SelectItem value="monday">Every Monday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-secondary/10 rounded-2xl">
                        <div className="space-y-1">
                            <Label className="text-sm font-bold">AI Assistant Language</Label>
                            <p className="text-xs text-muted-foreground">Default tone and language for generated student feedback.</p>
                        </div>
                        <Select defaultValue="encouraging">
                            <SelectTrigger className="w-[180px] bg-background rounded-xl border-border/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="encouraging">Encouraging (EN)</SelectItem>
                                <SelectItem value="formal">Formal (EN)</SelectItem>
                                <SelectItem value="concise">Concise (EN)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Parent View Notifications</Label>
                                <p className="text-xs text-muted-foreground">Alert me when a parent/guardian opens a progress report.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Grading Queue Alerts</Label>
                                <p className="text-xs text-muted-foreground">Notify me when new submissions are ready for review.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-secondary/5 p-8 border-t border-border/50 flex justify-end">
                    <Button onClick={() => toast({title: "Preferences Updated"})} className="font-bold rounded-xl h-12 px-10">
                        Update Preferences
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

function ClassroomTabContent() {
    const { toast } = useToast();
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setStartDateEnd] = useState<Date | undefined>();

    return (
        <div className="space-y-6">
            <Card className="border-border/50 shadow-sm bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        Academic Configuration
                    </CardTitle>
                    <CardDescription>Establish global standards for your student roster and grading scale.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Default Proficiency Band</Label>
                            <Select defaultValue="cefr">
                                <SelectTrigger className="h-12 bg-secondary/20 rounded-xl border-border/50">
                                    <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="cefr">CEFR (A1-C2)</SelectItem>
                                    <SelectItem value="eal">EAL Levels 1-6</SelectItem>
                                    <SelectItem value="percent">Standard Percentage</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground italic px-1">Applied to new student enrollments automatically.</p>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Grade Display Format</Label>
                            <Select defaultValue="descriptor">
                                <SelectTrigger className="h-12 bg-secondary/20 rounded-xl border-border/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="descriptor">Descriptor (e.g. Mastered)</SelectItem>
                                    <SelectItem value="band">Band (e.g. B2)</SelectItem>
                                    <SelectItem value="both">Combined (Band + Descriptor)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="space-y-6">
                        <div>
                            <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary block mb-4">Active Academic Term</Label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium">Term Start</Label>
                                    <DatePicker date={startDate} setDate={setStartDate} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium">Term End</Label>
                                    <DatePicker date={endDate} setDate={setStartDateEnd} className="h-12 rounded-xl" placeholder="Select end date" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-secondary/5 p-8 border-t border-border/50 flex justify-end">
                    <Button onClick={() => toast({title: "Classroom Updated"})} className="font-bold rounded-xl h-12 px-10">
                        Update Classroom Standards
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

function IntegrationsTabContent() {
    const { data, isLoading, trigger: checkHealth } = useWebhook<{}, HealthCheckData>({ 
        eventName: 'HEALTH_CHECK',
        manual: true,
    });

    function StatusIndicator({ status, text, icon: Icon }: { status: boolean; text: string; icon: any }) {
        return (
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-secondary/10 p-5 transition-all hover:bg-secondary/20">
                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl shadow-sm", status ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20")}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="font-bold text-base block">{text}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{status ? 'Operational' : 'Sync Interrupted'}</span>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border shadow-sm",
                    status ? "text-green-500 bg-green-500/5 border-green-500/20" : "text-destructive bg-destructive/5 border-destructive/20"
                )}>
                    {status ? <CheckCircle2 className="h-3 w-3"/> : <AlertCircle className="h-3 w-3"/>}
                    {status ? "Online" : "Action Needed"}
                </div>
            </div>
        )
    }

    return (
        <Card className="border-border/50 shadow-sm overflow-hidden bg-card rounded-[2.5rem]">
            <CardHeader className="bg-secondary/5 border-b border-border/50 pb-8 pt-8 px-10">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Infrastructure Health</CardTitle>
                <CardDescription className="text-sm font-medium">
                    Diagnostic view for system administrators. Monitor live connectivity between Athena and your backend n8n nodes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-10">
                <div className="grid gap-6">
                    <StatusIndicator status={isWebhookConfigured('STUDENT_LIST')} text="Workflow Gateway" icon={Server} />
                    <StatusIndicator status={data?.databaseConnected ?? false} text="Supabase Data Engine" icon={Database} />
                    <StatusIndicator status={true} text="Identity Protocol" icon={Lock} />
                </div>
            </CardContent>
             <CardFooter className='flex items-center justify-between bg-secondary/5 p-10 border-t border-border/50'>
                <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Last Connectivity Pulse</p>
                    <p className="text-xs font-bold text-foreground">
                        {data?.lastSuccessfulCall ? new Date(data.lastSuccessfulCall).toLocaleString() : 'System check pending...'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => checkHealth()} disabled={isLoading} className="font-bold rounded-xl h-12 px-8 border-border shadow-sm bg-background hover:bg-secondary/10 transition-all">
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                    Run Live Diagnostics
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function SettingsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-24">
            <OnboardingTour />
            <PageHeader
                title="Workspace Settings"
                description="Manage your professional profile, classroom academic standards, and personal notification preferences."
                hideBack
            />
            
            <Tabs defaultValue="account" className="w-full">
                <TabsList className="flex overflow-x-auto bg-secondary/30 p-1.5 rounded-2xl border border-border/50 h-16 w-fit mb-12 gap-1 custom-scrollbar">
                    <TabsTrigger value="account" className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-12 px-6 data-[state=active]:shadow-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <User className="h-3.5 w-3.5 mr-2" />
                        Account
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-12 px-6 data-[state=active]:shadow-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <Bell className="h-3.5 w-3.5 mr-2" />
                        Preferences
                    </TabsTrigger>
                    <TabsTrigger value="classroom" className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-12 px-6 data-[state=active]:shadow-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                        <BookOpen className="h-3.5 w-3.5 mr-2" />
                        Classroom
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger value="integrations" className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-12 px-6 data-[state=active]:shadow-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                            <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                            Admin Console
                        </TabsTrigger>
                    )}
                </TabsList>
                
                <div className="mt-8">
                    <TabsContent value="account" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AccountTabContent />
                    </TabsContent>
                    
                    <TabsContent value="preferences" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PreferencesTabContent />
                    </TabsContent>

                    <TabsContent value="classroom" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ClassroomTabContent />
                    </TabsContent>
                    
                    {isAdmin && (
                        <TabsContent value="integrations" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <IntegrationsTabContent />
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

