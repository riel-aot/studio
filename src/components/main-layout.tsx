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
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>{navItems}</SidebarContent>
        </Sidebar>
        
        <SidebarInset>
          {/* This header will be full-width and sticky at the top */}
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden"/>
            {/* This spacer pushes the UserNav to the right */}
            <div className="flex-1" /> 
            <UserNav />
          </header>
          {/* This main area will contain the scrollable, centered content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto w-full max-w-6xl">
              {children}
            </div>
          </main>
        </SidebarInset>

      </div>
    </SidebarProvider>
  );
}
