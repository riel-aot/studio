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
    <Card className="border-[#E5E7EB] dark:border-[#1F2937] shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl bg-white dark:bg-[#111827] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 border border-slate-100 dark:border-slate-800 group-hover:border-blue-100 dark:group-hover:border-blue-500/20">
          <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-[#2F5BEA] dark:group-hover:text-[#3B82F6] transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold text-[#111827] dark:text-[#E5E7EB] tracking-tight mb-1">{value}</div>
        {description && (
          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
    return (
        <Card className="border-[#E5E7EB] dark:border-[#1F2937] rounded-2xl bg-white dark:bg-[#111827]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-7 w-7 rounded-lg" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-14 mb-1.5" />
                <Skeleton className="h-2 w-20" />
            </CardContent>
        </Card>
    )
}