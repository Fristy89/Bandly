import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type BadgeTone = "neutral" | "accent" | "good" | "attention";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  neutral: "border border-border bg-surface-raised text-ink-muted",
  accent: "bg-accent-soft text-accent-strong",
  good: "bg-good-soft text-good",
  attention: "bg-attention-soft text-attention",
};

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
