import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  const colorClass = light ? "text-white" : "text-primary";
  const barColor = light ? "bg-white" : "bg-primary";

  return (
    <div className={cn("flex items-center justify-center transition-all duration-200", className)}>
      <div className="flex items-center select-none font-bold tracking-tight text-2xl md:text-3xl leading-none">
        <span className={colorClass}>ATH</span>
        {/* Vector-constructed Xi character to ensure consistent rounded pill bars across all systems */}
        <div className="flex flex-col justify-between h-[16px] w-[16px] md:h-[18px] md:w-[18px] py-[1.5px] mx-[2px] group-data-[state=collapsed]:hidden">
          <div className={cn("h-[2.5px] md:h-[3px] w-full rounded-full", barColor)} />
          <div className={cn("h-[2.5px] md:h-[3px] w-full rounded-full", barColor)} />
          <div className={cn("h-[2.5px] md:h-[3px] w-full rounded-full", barColor)} />
        </div>
        <span className={cn("group-data-[state=collapsed]:hidden", colorClass)}>NA</span>
      </div>
    </div>
  );
}
