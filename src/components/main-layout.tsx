'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from './user-nav';
import { Logo } from './logo';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

export function MainLayout({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: React.ReactNode;
}) {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>{navItems}</SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="flex items-center gap-4">
               <SidebarTrigger className="md:hidden"/>
            </div>

            <div className="flex-1">
                <div className="relative w-full max-w-md mx-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search student or assessment…"
                        className="w-full rounded-lg bg-secondary pl-8 h-9"
                    />
                </div>
            </div>

            <UserNav />
          </header>
          <div className="flex-1 overflow-auto p-4 sm:px-6 sm:py-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
