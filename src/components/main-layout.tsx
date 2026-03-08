'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from './user-nav';
import { Logo } from './logo';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { LogOut, Bell, Sun, Settings } from 'lucide-react';

export function MainLayout({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  return (
    <SidebarProvider>
        <Sidebar collapsible="icon" className="border-none shadow-xl" id="onboarding-sidebar">
          <SidebarHeader className="h-24 flex items-center justify-center px-6">
            <Logo light />
          </SidebarHeader>
          <SidebarContent className="px-3">
            {navItems}
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/10 hover:text-white font-bold"
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5 text-orange-400" />
              <span>Sign Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white px-4 sm:px-8">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-slate-400 hover:text-slate-900" />
                <div className="h-6 w-px bg-slate-200" />
              </div>
              <div className="w-full flex-1" />
              <div className="flex items-center gap-4 pr-2">
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <Sun className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <Settings className="h-5 w-5" />
                </Button>
                <div className="h-6 w-px bg-slate-200 mx-2" />
                <UserNav />
              </div>
          </header>
          <main className="flex-1 bg-[#F1F2F6]">
            <div className="mx-auto w-full max-w-7xl p-6 sm:p-10">
              {children}
            </div>
          </main>
        </div>
    </SidebarProvider>
  );
}