import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 font-sans", className)}>
      <div className={cn(
        "h-9 w-9 rounded-xl flex items-center justify-center shadow-lg",
        light ? "bg-white/10 border border-white/20 text-white" : "bg-[#2F5BEA] text-white"
      )}>
        <GraduationCap className="h-5 w-5" />
      </div>
      <span className={cn(
        "text-xl font-bold tracking-tight",
        light ? "text-white" : "text-[#2F5BEA]"
      )}>
        ATHΞNA
      </span>
    </div>
  );
}