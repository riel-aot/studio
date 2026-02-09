'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from './user-nav';
import { Logo } from './logo';
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
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>{navItems}</SidebarContent>
        </Sidebar>
        
        <SidebarInset>
          <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
            <header className="flex h-14 items-center justify-between">
              <SidebarTrigger className="md:hidden"/>
              <div className="flex-1" /> 
              <UserNav />
            </header>
            <main className="flex-1">
                {children}
            </main>
          </div>
        </SidebarInset>

      </div>
    </SidebarProvider>
  );
}
