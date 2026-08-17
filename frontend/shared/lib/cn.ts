/**
 * Joins class names, dropping falsy values. Intentionally not a full
 * clsx/tailwind-merge replacement — the primitives in this project don't
 * need conflict resolution, just tidy conditional composition.
 */
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
