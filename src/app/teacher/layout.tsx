'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/main-layout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart,
  BookCopy,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const navLinks = [
  { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/teacher/students', icon: Users, label: 'Students' },
  { href: '/teacher/assessments', icon: FileText, label: 'Assessments' },
  { href: '/teacher/reports', icon: BarChart, label: 'Reports' },
  { href: '/teacher/settings', icon: Settings, label: 'Settings' },
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
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'teacher') {
    return <LoadingSpinner fullScreen />;
  }

  const navItems = (
    <SidebarMenu>
      {navLinks.map(({ href, icon: Icon, label }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(href)}
            tooltip={label}
          >
            <Link href={href}>
              <Icon />
              <span>{label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return <MainLayout navItems={navItems}>{children}</MainLayout>;
}
