import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-0.5", className)}>
      <span 
        style={{ fontFamily: "'Pinyon Script', cursive" }} 
        className="text-2xl text-slate-900"
      >
        Ath
      </span>
      <span className="text-xl text-blue-600/80 font-serif leading-none">
        Ξ
      </span>
      <span 
        style={{ fontFamily: "'Pinyon Script', cursive" }} 
        className="text-2xl text-slate-900"
      >
        na
      </span>
    </div>
  );
}
