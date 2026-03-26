import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center transition-all duration-300", className)}>
      <div className="flex items-center select-none font-extrabold font-sans tracking-tight text-2xl md:text-3xl leading-none">
        <span className="text-primary transition-all duration-300 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:invisible group-data-[state=collapsed]:-translate-x-2">
          ATH
        </span>
        
        {/* Vector-constructed Xi character to ensure consistent rounded pill bars */}
        <div className="flex flex-col justify-between h-[16px] w-[16px] md:h-[18px] md:w-[18px] py-[1.5px] mx-[2px] transition-all duration-300 group-data-[state=collapsed]:mx-0 group-data-[state=collapsed]:scale-125">
          <div className="h-[3px] md:h-[3.5px] w-full rounded-full bg-primary" />
          <div className="h-[3px] md:h-[3.5px] w-full rounded-full bg-primary" />
          <div className="h-[3px] md:h-[3.5px] w-full rounded-full bg-primary" />
        </div>

        <span className="text-primary transition-all duration-300 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:invisible group-data-[state=collapsed]:translate-x-2">
          NA
        </span>
      </div>
    </div>
  );
}
