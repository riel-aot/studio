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
    <Card className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">{title}</CardTitle>
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-blue-50 border border-slate-100 group-hover:border-blue-100">
          <Icon className="h-5 w-5 text-slate-400 group-hover:text-[#2F5BEA] transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-[#111827] tracking-tight mb-1">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
    return (
        <Card className="border-[#E5E7EB] rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    )
}
