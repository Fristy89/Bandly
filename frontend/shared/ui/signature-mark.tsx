import type { CSSProperties } from "react";
import { fontVariableFor, signatureFontVariables } from "@/shared/lib/fonts";
import type { LogoMark } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";

/**
 * Renders an artist's name as their AI-generated signature wordmark when
 * one exists (see LogoService on the backend — the same component the
 * band's public site renders, site-renderer/src/components/SignatureMark.tsx),
 * or plain display-italic when it doesn't. Real text, not an image.
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
    return <span className={cn("font-display italic text-ink", className)}>{name}</span>;
  }

  const style: CSSProperties = {
    fontFamily: fontVariableFor(logoMark.fontFamily),
    color: logoMark.colorHex,
    fontStyle: logoMark.italic ? "italic" : "normal",
  };

  return (
    <span className={cn(signatureFontVariables, className)} style={style}>
      {name}
    </span>
  );
}
