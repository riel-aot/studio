'use client';

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  hideBack?: boolean;
}

export function PageHeader({ title, description, actions, className, hideBack = false }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("mb-10 space-y-4", className)}>
      {!hideBack && (
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#2F5BEA] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>BACK</span>
        </button>
      )}
      
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">{title}</h1>
          {description && (
            <div className="text-lg text-[#6B7280] font-normal">{description}</div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
