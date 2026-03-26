import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  const colorClass = light ? "text-white" : "text-primary";
  const barColor = light ? "bg-white" : "bg-primary";

  return (
    <div className={cn("flex items-center justify-center transition-all duration-200", className)}>
      <div className="flex items-center gap-0.5 select-none">
        <span className={cn("text-2xl font-black tracking-tighter leading-none", colorClass)}>ATH</span>
        <div className="flex flex-col justify-between h-[14px] w-[16px] py-[1.5px] mx-[1px] group-data-[state=collapsed]:hidden">
          <div className={cn("h-[2.5px] rounded-full", barColor)} />
          <div className={cn("h-[2.5px] rounded-full", barColor)} />
          <div className={cn("h-[2.5px] rounded-full", barColor)} />
        </div>
        <span className={cn("text-2xl font-black tracking-tighter leading-none group-data-[state=collapsed]:hidden", colorClass)}>NA</span>
      </div>
    </div>
  );
}
