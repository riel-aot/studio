import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center transition-all duration-200", className)}>
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center shadow-lg shrink-0 border-2",
        light 
          ? "bg-transparent text-primary border-primary" 
          : "bg-primary text-white border-transparent"
      )}>
        <span className="text-xl font-black tracking-tighter leading-none select-none">A</span>
      </div>
      <span className={cn(
        "ml-3 text-xl font-bold tracking-tight transition-all duration-200 group-data-[state=collapsed]:hidden whitespace-nowrap",
        light ? "text-white" : "text-primary"
      )}>
        ATHΞNA
      </span>
    </div>
  );
}
