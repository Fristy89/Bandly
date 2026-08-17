"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-10 rounded-lg border bg-paper px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          error
            ? "border-attention"
            : "border-border hover:border-border-strong",
          className,
        )}
        aria-invalid={!!error || undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-attention">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
