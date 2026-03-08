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
    <div className={cn("mb-12 space-y-6", className)}>
      {!hideBack && (
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#2F5BEA] transition-all tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          <span>Back to safety</span>
        </button>
      )}
      
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="flex-1 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">{title}</h1>
          {description && (
            <div className="text-lg md:text-xl text-[#6B7280] font-normal max-w-2xl leading-relaxed">{description}</div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-4 py-2">{actions}</div>}
      </div>
    </div>
  );
}
