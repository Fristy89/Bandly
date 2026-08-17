"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/shared/lib/cn";
import {
  BACKGROUND_TONES,
  type Appearance,
  type BackgroundTone,
  getStoredAppearance,
  getStoredBackground,
  setAppearance,
  setBackground,
  subscribeToTheme,
} from "@/shared/lib/theme";

const APPEARANCE_OPTIONS: { value: Appearance; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

// Swatch previews are hand-picked, not read from the live CSS variables —
// the customer should see all three tones at once regardless of which one
// is currently active.
const SWATCH_PAPER: Record<BackgroundTone, string> = {
  warm: "#f1ede3",
  slate: "#eef0f2",
  contrast: "#ffffff",
};
const SWATCH_INK: Record<BackgroundTone, string> = {
  warm: "#24201a",
  slate: "#1b2027",
  contrast: "#101010",
};

const SERVER_APPEARANCE: Appearance = "system";
const SERVER_BACKGROUND: BackgroundTone = "warm";

/**
 * Appearance controls, meant to live inside a menu/panel that's already
 * open (UserMenu). Applies changes immediately via direct DOM mutation —
 * see shared/lib/theme.ts.
 */
export function ThemePicker() {
  // useSyncExternalStore, not useState+useEffect: the source of truth is
  // localStorage/matchMedia, not React state, and this avoids both the
  // set-state-in-effect lint error and any hydration mismatch (the server
  // snapshot always matches the no-flash init script's default).
  const appearance = useSyncExternalStore(
    subscribeToTheme,
    getStoredAppearance,
    () => SERVER_APPEARANCE,
  );
  const background = useSyncExternalStore(
    subscribeToTheme,
    getStoredBackground,
    () => SERVER_BACKGROUND,
  );

  return (
    <div className="border-t border-border px-3 py-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        Appearance
      </p>

      <div className="mb-3 flex gap-1 rounded-md bg-paper p-1">
        {APPEARANCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setAppearance(option.value)}
            className={cn(
              "flex-1 rounded px-2 py-1 text-xs font-medium transition-colors",
              appearance === option.value
                ? "bg-surface-raised text-ink shadow-sm"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        Background
      </p>
      <div className="flex gap-2.5">
        {BACKGROUND_TONES.map((tone) => (
          <button
            key={tone.value}
            type="button"
            onClick={() => setBackground(tone.value)}
            title={tone.blurb}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full border transition-shadow",
                background === tone.value
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-border-strong",
              )}
              style={{ background: SWATCH_PAPER[tone.value] }}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: SWATCH_INK[tone.value] }}
              />
            </span>
            <span
              className={cn(
                "text-[10px]",
                background === tone.value ? "text-ink" : "text-ink-faint",
              )}
            >
              {tone.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
