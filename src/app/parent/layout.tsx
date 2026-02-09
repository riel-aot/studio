'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/main-layout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart, LayoutDashboard } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';

const navLinks = [
  { href: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/parent/reports', icon: BarChart, label: 'Reports' },
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'parent')) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'parent') {
    return <LoadingSpinner fullScreen />;
  }

  const navItems = (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium">
      {navLinks.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname.startsWith(href) && 'bg-accent text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return <MainLayout navItems={navItems}>{children}</MainLayout>;
}
