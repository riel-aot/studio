import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-0.5", className)}>
      <span 
        style={{ fontFamily: "'Playfair Display', serif" }} 
        className="text-2xl font-bold text-slate-900 tracking-tight"
      >
        Ath
      </span>
      <span className="text-xl text-blue-600/80 font-serif leading-none">
        Ξ
      </span>
      <span 
        style={{ fontFamily: "'Playfair Display', serif" }} 
        className="text-2xl font-bold text-slate-900 tracking-tight"
      >
        na
      </span>
    </div>
  );
}
