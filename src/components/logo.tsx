import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center transition-all duration-200", className)}>
      <div className="flex items-center select-none font-bold tracking-tight text-2xl md:text-3xl leading-none">
        <span className="text-primary">ATH</span>
        {/* Vector-constructed Xi character to ensure consistent rounded pill bars */}
        <div className="flex flex-col justify-between h-[16px] w-[16px] md:h-[18px] md:w-[18px] py-[1.5px] mx-[2px]">
          <div className="h-[3px] md:h-[3.5px] w-full rounded-full bg-primary" />
          <div className="h-[3px] md:h-[3.5px] w-full rounded-full bg-primary" />
          <div className="h-[3px] md:h-[3.5px] w-full rounded-full bg-primary" />
        </div>
        <span className="text-primary">NA</span>
      </div>
    </div>
  );
}
