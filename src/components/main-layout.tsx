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
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { LogOut, Bell, Sun, Moon, Settings } from 'lucide-react';
import Link from 'next/link';

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
    // Initial theme check
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
    <SidebarProvider>
        <Sidebar collapsible="icon" className="border-none shadow-xl bg-[#2F5BEA] dark:bg-[#020617]" id="onboarding-sidebar">
          <SidebarHeader className="h-24 flex items-start justify-center px-8 pt-8 transition-all duration-200 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:items-center">
            <Link href={dashboardLink} className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Logo light />
            </Link>
          </SidebarHeader>
          
          <div className="px-4 group-data-[state=collapsed]:px-2">
            <SidebarSeparator className="bg-white/10 dark:bg-slate-800" />
          </div>

          <SidebarContent className="px-4 py-6 group-data-[state=collapsed]:px-2">
            {navItems}
          </SidebarContent>

          <SidebarFooter className="p-8 mt-auto border-none transition-all duration-200 group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:items-center">
            <button 
              className="flex items-center gap-3 text-orange-400 hover:text-orange-300 dark:text-orange-500/80 dark:hover:text-orange-400 transition-colors font-bold text-sm group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:w-full"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="group-data-[state=collapsed]:hidden whitespace-nowrap">Sign Out</span>
            </button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#0F172A]/80 dark:backdrop-blur-md px-4 sm:px-8">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300" />
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-full flex-1" />
              <div className="flex items-center gap-4 pr-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 dark:text-slate-500"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
                <div className="relative">
                  <Button variant="ghost" size="icon" className="text-slate-400 dark:text-slate-500">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-[#0F172A]" />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 dark:text-slate-500"
                  asChild
                >
                  <Link href="/teacher/settings">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                <UserNav />
              </div>
          </header>
          <main className="flex-1 bg-[#F1F2F6] dark:bg-[#0F172A]">
            <div className="mx-auto w-full max-w-7xl p-6 sm:p-10">
              {children}
            </div>
          </main>
        </div>
    </SidebarProvider>
  );
}