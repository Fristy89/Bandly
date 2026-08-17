import { cn } from "@/shared/lib/cn";

type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  className?: string;
};

// Muted, paper-adjacent chip tones — deliberately not the accent hue, so
// avatars never compete with the "current focus" signal color.
const palette = [
  { bg: "#e2d3ac", fg: "#5a4620" },
  { bg: "#cddfc8", fg: "#3d5735" },
  { bg: "#e2c6bb", fg: "#794431" },
  { bg: "#c9d3d6", fg: "#3d4f53" },
  { bg: "#ddd2e0", fg: "#524062" },
];

const sizes: Record<AvatarSize, string> = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-12 text-base",
};

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const { bg, fg } = palette[hash(name) % palette.length];
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium",
        sizes[size],
        className,
      )}
      style={{ background: bg, color: fg }}
    >
      {getInitials(name)}
    </span>
  );
}
