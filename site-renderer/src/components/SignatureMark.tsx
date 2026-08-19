import type { CSSProperties } from "react";
import { fontVariableFor } from "@/lib/fonts";
import type { LogoMark } from "@/lib/types";

/**
 * Renders the artist's name as their AI-generated signature wordmark when
 * one exists (see LogoService on the backend), or plain Fraunces italic —
 * the same fallback the rest of the site already uses — when it doesn't.
 * Real text, not an image: scales cleanly, no upload/storage involved.
 */
export function SignatureMark({
  name,
  logoMark,
  className,
}: {
  name: string;
  logoMark: LogoMark | null;
  className?: string;
}) {
  if (!logoMark) {
    return <span className={`font-display italic text-ink ${className ?? ""}`}>{name}</span>;
  }

  const style: CSSProperties = {
    fontFamily: fontVariableFor(logoMark.fontFamily),
    color: logoMark.colorHex,
    fontStyle: logoMark.italic ? "italic" : "normal",
  };

  return (
    <span className={className} style={style}>
      {name}
    </span>
  );
}
