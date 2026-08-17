import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(36,32,26,0.05)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
