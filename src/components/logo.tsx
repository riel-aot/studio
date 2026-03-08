import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-0.5 font-sans", className)}>
      <span className="text-xl font-bold text-[#2F5BEA] tracking-tight">
        ATHENA
      </span>
    </div>
  );
}