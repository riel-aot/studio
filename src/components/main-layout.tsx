'use client';

import React, { useState, useEffect } from 'react';
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
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { LogOut, Bell, Sun, Moon, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';

function CustomSidebarTrigger() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="absolute -right-3.5 top-8 z-50 h-7 w-7 rounded-full bg-[#0F172A] border-2 border-white dark:border-[#0F172A] text-white flex items-center justify-center shadow-md hover:scale-110 transition-all"
    >
      {state === 'collapsed' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </button>
  );
}

export function MainLayout({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!user) return null;

  const dashboardLink = user.role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard';

  return (
    <SidebarProvider defaultOpen={false}>
        <div className="relative flex min-h-screen w-full">
          <Sidebar collapsible="icon" className="border-none shadow-2xl bg-[#0F172A] z-40 transition-all duration-300 ease-in-out group-data-[state=collapsed]:w-[4.5rem]" id="onboarding-sidebar">
            <CustomSidebarTrigger />
            
            <SidebarHeader className="h-24 flex items-center justify-center pt-8 mb-4">
              <Link href={dashboardLink} className="transition-transform hover:scale-105 active:scale-95">
                <Logo />
              </Link>
            </SidebarHeader>
            
            <SidebarContent className="px-0 overflow-visible">
              {navItems}
            </SidebarContent>

            <SidebarFooter className="p-4 mt-auto border-none flex justify-center pb-8">
              <button 
                className="flex items-center justify-center h-10 w-10 text-primary hover:text-white hover:bg-primary/20 rounded-full transition-all duration-300"
                onClick={logout}
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-1 flex-col h-screen min-w-0 bg-[#F1F2F6] dark:bg-[#0F172A] overflow-y-auto">
            <header className="flex h-16 items-center gap-4 px-4 sm:px-6 shrink-0">
                <div className="w-full flex-1" />
                <div className="flex items-center gap-3 pr-2">
                  {/* Floating Circular Theme Toggle */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 bg-white dark:bg-slate-800 shadow-sm rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-border/40"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? <Moon className="h-4.5 w-4.5 text-slate-600" /> : <Sun className="h-4.5 w-4.5 text-slate-300" />}
                  </Button>

                  {/* Floating Circular Notifications */}
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 bg-white dark:bg-slate-800 shadow-sm rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-border/40"
                    >
                      <Bell className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />
                    </Button>
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border border-[#F1F2F6] dark:border-[#0F172A]" />
                  </div>

                  <div className="h-5 w-px bg-slate-300/50 mx-1 hidden sm:block" />
                  
                  {/* Floating Pill Profile */}
                  <UserNav />
                </div>
            </header>
            <main className="flex-1">
              <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
    </SidebarProvider>
  );
}
