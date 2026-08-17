export type Appearance = "system" | "light" | "dark";
export type BackgroundTone = "warm" | "slate" | "contrast";

export const BACKGROUND_TONES: { value: BackgroundTone; label: string; blurb: string }[] = [
  { value: "warm", label: "Warm", blurb: "Soft, uncoated paper" },
  { value: "slate", label: "Slate", blurb: "Cool and neutral" },
  { value: "contrast", label: "Contrast", blurb: "Crisp black and white" },
];

const APPEARANCE_KEY = "bandly:appearance";
const BACKGROUND_KEY = "bandly:background";

export function getStoredAppearance(): Appearance {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(APPEARANCE_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function getStoredBackground(): BackgroundTone {
  if (typeof window === "undefined") return "warm";
  const value = window.localStorage.getItem(BACKGROUND_KEY);
  return value === "warm" || value === "slate" || value === "contrast" ? value : "warm";
}

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Applies the current preferences to <html>. Safe to call on every change. */
export function applyTheme(appearance: Appearance, background: BackgroundTone) {
  const dark = appearance === "system" ? prefersDark() : appearance === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.setAttribute("data-bg", background);
}

const CHANGE_EVENT = "bandly:theme-change";

/** Subscribes to every source that can change the resolved theme: this
 * tab's own preference changes, other tabs' (native "storage" event), and
 * a live OS-level light/dark switch while "system" is selected. */
export function subscribeToTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function setAppearance(appearance: Appearance) {
  window.localStorage.setItem(APPEARANCE_KEY, appearance);
  applyTheme(appearance, getStoredBackground());
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setBackground(background: BackgroundTone) {
  window.localStorage.setItem(BACKGROUND_KEY, background);
  applyTheme(getStoredAppearance(), background);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * The pre-hydration script for the root layout, as a plain string — must
 * stay dependency-free (it runs before React, before any module graph).
 * Mirrors the logic above; keep the two in sync by hand if either changes.
 */
export const themeInitScript = `(function(){try{
  var a=localStorage.getItem('${APPEARANCE_KEY}')||'system';
  var b=localStorage.getItem('${BACKGROUND_KEY}')||'warm';
  var dark=a==='dark'||(a==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark',dark);
  document.documentElement.setAttribute('data-bg',b);
}catch(e){}})();`;
