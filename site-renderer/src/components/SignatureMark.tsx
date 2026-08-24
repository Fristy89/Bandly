import type { CSSProperties } from "react";
import { fontVariableFor } from "@/lib/fonts";
import type { LogoImage, LogoMark } from "@/lib/types";

/**
 * Renders the artist's name as, in priority order: their own uploaded logo
 * image (a real design — see SiteContentData.logoImage on the backend),
 * their AI-generated signature wordmark (LogoService), or plain Fraunces
 * italic when neither exists yet.
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
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={`data:${logoImage.mimeType};base64,${logoImage.base64}`}
        alt={name}
        className={`h-16 w-auto object-contain ${className ?? ""}`}
      />
    );
  }

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
