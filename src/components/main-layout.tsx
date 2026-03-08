'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from './user-nav';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
  const router = useRouter();
  
  if (!user) return null;

  return (
    <SidebarProvider>
        <Sidebar collapsible="icon" className="border-r border-[#E5E7EB]">
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-[#E5E7EB]">
            <Logo />
          </SidebarHeader>
          <SidebarContent className="py-4">{navItems}</SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white px-4 sm:px-8">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-slate-400 hover:text-slate-900" />
                <div className="h-6 w-px bg-slate-200" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  aria-label="Go back"
                  className="text-slate-500 hover:text-slate-900 font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
              <div className="w-full flex-1" />
              <UserNav />
          </header>
          <main className="flex-1 bg-[#F7F8FB]">
            <div className="mx-auto w-full max-w-7xl p-6 sm:p-10">
              {children}
            </div>
          </main>
        </div>
    </SidebarProvider>
  );
}