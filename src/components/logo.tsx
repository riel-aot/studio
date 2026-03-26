import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 font-sans transition-all duration-200", className)}>
      <div className={cn(
        "h-9 w-9 rounded-xl flex items-center justify-center shadow-lg shrink-0",
        light ? "bg-primary text-white border border-white/20" : "bg-primary text-white"
      )}>
        <GraduationCap className="h-5 w-5" />
      </div>
      <span className={cn(
        "text-xl font-bold tracking-tight transition-all duration-200 group-data-[state=collapsed]:hidden whitespace-nowrap",
        light ? "text-white" : "text-primary"
      )}>
        ATHΞNA
      </span>
    </div>
  );
}