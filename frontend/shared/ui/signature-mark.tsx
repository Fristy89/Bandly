import type { CSSProperties } from "react";
import { fontVariableFor, signatureFontVariables } from "@/shared/lib/fonts";
import type { LogoImage, LogoMark } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";

/**
 * Renders an artist's name as, in priority order: their own uploaded logo
 * image (real design, takes precedence — see SiteContentData.logoImage on
 * the backend), their AI-generated signature wordmark (LogoService), or
 * plain display-italic text if neither exists yet. Same component the
 * band's public site renders, site-renderer/src/components/SignatureMark.tsx.
 */
export function SignatureMark({
  name,
  logoMark,
  logoImage,
  className,
}: {
  name: string;
  logoMark: LogoMark | null;
  logoImage?: LogoImage | null;
  className?: string;
}) {
  if (logoImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`data:${logoImage.mimeType};base64,${logoImage.base64}`}
        alt={name}
        className={cn("h-16 w-auto object-contain", className)}
      />
    );
  }

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
