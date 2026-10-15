import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * The login / register surface — deliberately not a Card. A pane of
 * deep-space glass floating in the DnaFieldCanvas nebula (see the auth
 * layout): translucent enough that the strand keeps moving behind it,
 * dark-tinted enough that the form stays AA-readable even where
 * backdrop-blur isn't supported. Always dark, like the rest of that screen.
 */
export function AuthPanel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#0e0b18]/60 p-8 shadow-[0_10px_50px_-15px_rgba(0,0,0,0.65)] backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
