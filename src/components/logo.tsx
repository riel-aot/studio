import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-0.5 font-sans", className)}>
      <span className="text-2xl font-black text-[#3b7ddd] tracking-tighter">
        ATHENA
      </span>
    </div>
  );
}
