import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-bold text-[#6B7280] uppercase tracking-wider">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#2F5BEA]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#111827] tracking-tight">{value}</div>
        {description && <p className="text-xs text-[#6B7280] mt-1 font-medium">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
    return (
        <Card className="border-[#E5E7EB]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-9 w-16" />
                <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
        </Card>
    )
}