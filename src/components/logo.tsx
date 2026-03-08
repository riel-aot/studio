
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-0.5 font-sans", className)}>
      <span className="text-xl font-semibold text-[#3b7ddd] tracking-tight">
        ATHENA
      </span>
    </div>
  );
}
