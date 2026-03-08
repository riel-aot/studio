'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/main-layout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart,
  LayoutDashboard,
  Users,
  FileText,
  Home,
  MessageSquare,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const mainNavLinks = [
  { href: '/teacher/dashboard', icon: Home, label: 'Home' },
  { href: '/teacher/students', icon: Users, label: 'Students' },
  { href: '/teacher/assessments', icon: FileText, label: 'Assignments' },
  { href: '/teacher/reports', icon: BarChart, label: 'Reports' },
  { href: '/teacher/staff-room', icon: MessageSquare, label: 'Staff Room', hasBadge: true },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'teacher')) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'teacher') {
    return <LoadingSpinner fullScreen />;
  }

  const navItems = (
    <SidebarMenu className="gap-2">
      {mainNavLinks.map(({ href, icon: Icon, label, hasBadge }) => {
        const isActive = pathname.startsWith(href);
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={label}
              className={cn(
                "h-12 px-4 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-white/10 text-white font-bold shadow-sm" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Link href={href} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/60")} />
                  <span>{label}</span>
                </div>
                {hasBadge && (
                  <span className="h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white border-2 border-[#2F5BEA]">
                    4
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return <MainLayout navItems={navItems}>{children}</MainLayout>;
}
