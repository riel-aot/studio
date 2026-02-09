'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from './user-nav';
import { Logo } from './logo';
import { Input } from '@/components/ui/input';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
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
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 bg-background px-4 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex flex-1 justify-center">
                <form>
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search students, assessments..."
                      className="w-full appearance-none rounded-lg bg-secondary pl-8 shadow-none"
                    />
                  </div>
                </form>
              </div>
              <UserNav />
          </header>
          <main className="w-full">
            <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
