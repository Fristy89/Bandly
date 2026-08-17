import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type NavItemProps = {
  href?: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function NavItem({
  href,
  icon,
  active,
  disabled,
  onClick,
  children,
}: NavItemProps) {
  const classes = cn(
    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
    active
      ? "bg-accent-soft font-medium text-accent-strong"
      : disabled
        ? "cursor-not-allowed text-ink-faint"
        : "text-ink-muted hover:bg-surface-raised hover:text-ink",
  );

  const iconClasses = cn(
    "shrink-0",
    active
      ? "text-accent"
      : disabled
        ? "text-ink-faint"
        : "text-ink-muted group-hover:text-ink",
  );

  const content = (
    <>
      <span className={iconClasses}>{icon}</span>
      <span className="flex-1 truncate">{children}</span>
    </>
  );

  if (disabled || !href) {
    return (
      <div
        className={classes}
        aria-disabled="true"
        title={disabled ? "Not built yet" : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
