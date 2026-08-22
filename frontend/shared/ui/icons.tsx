import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: 18,
  height: 18,
};

/** Focus — a held aim, not a to-do checkmark. */
export function IconFocus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="7.25" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Artist DNA — a mark of character, not a literal double helix. */
export function IconSpark(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c0 3.5 1.4 6.6 5 8.5-3.6 1.9-5 5-5 8.5 0-3.5-1.4-6.6-5-8.5 3.6-1.9 5-5 5-8.5Z" />
    </svg>
  );
}

/** Releases — a rollout, staged and ascending. */
export function IconReleases(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.75" y="14.5" width="4.5" height="6" rx="1" />
      <rect x="9.75" y="10" width="4.5" height="10.5" rx="1" />
      <rect x="15.75" y="5.5" width="4.5" height="15" rx="1" />
    </svg>
  );
}

/** Content — drafted lines. */
export function IconContent(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4.5h14" />
      <path d="M5 4.5v15h11.5L19 16.75V4.5" />
      <path d="M8.25 9.5h7.5" />
      <path d="M8.25 13.25h7.5" />
      <path d="M8.25 17h4.5" />
    </svg>
  );
}

/** Relationships — two circles held in overlap. */
export function IconRelationships(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.25" cy="12" r="5.25" />
      <circle cx="14.75" cy="12" r="5.25" />
    </svg>
  );
}

/** Rights & Admin — a paper, checked. */
export function IconRights(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3.75h7.75L18.5 8.5v11.75h-12V3.75Z" />
      <path d="M14 3.75V8.5h4.5" />
      <path d="M9 13.25l2 2 3.5-3.75" />
    </svg>
  );
}

/** Finance — a line finding its trend. */
export function IconFinance(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16.5 9.5 11l3.75 3.5L20 6.75" />
      <path d="M14.5 6.75H20v5.5" />
    </svg>
  );
}

/** Grants — something planted, worth tending. */
export function IconGrants(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.5V11" />
      <path d="M12 11c0-4-3-6.5-7-6.5C5 8.5 7.5 11 12 11Z" />
      <path d="M12 13.75c0-3.25 2.5-5.5 6-5.5.25 3.5-2.5 5.5-6 5.5Z" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9.5 12 15l6-5.5" />
    </svg>
  );
}

export function IconChevronUpDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 14.5 12 18l4-3.5" />
      <path d="M8 9.5 12 6l4 3.5" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8.25v4.5" />
      <circle cx="12" cy="15.75" r="0.15" fill="currentColor" />
    </svg>
  );
}

export function IconLogOut(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3.5" />
      <path d="M14.5 15.5 19 12l-4.5-3.5" />
      <path d="M19 12H9.5" />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.75v2.1M12 18.15v2.1M20.25 12h-2.1M5.85 12H3.75M17.66 6.34l-1.48 1.48M7.82 16.18l-1.48 1.48M17.66 17.66l-1.48-1.48M7.82 7.82 6.34 6.34" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 7h15" />
      <path d="M4.5 12h15" />
      <path d="M4.5 17h15" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="M13 6.5 18.5 12 13 17.5" />
    </svg>
  );
}

/** Microphone — a capsule and its stand, nothing more literal than that. */
export function IconMicrophone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M6 11.5a6 6 0 0 0 12 0" />
      <path d="M12 17.5v3.2" />
      <path d="M8.75 20.7h6.5" />
    </svg>
  );
}

/** Speaker — a cone and two arcs standing in for sound, not a literal icon. */
export function IconSpeaker(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 9.5h3.2L12 5.5v13l-4.3-4H4.5z" strokeLinejoin="round" />
      <path d="M15.8 9.2a4.6 4.6 0 0 1 0 5.6" />
      <path d="M18.4 6.8a8.4 8.4 0 0 1 0 10.4" />
    </svg>
  );
}

/** Camera — a body and a lens, the simplest possible reading of it. */
export function IconCamera(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 8.5A1.5 1.5 0 0 1 6 7h2l1-2h6l1 2h2a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18Z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.25" />
    </svg>
  );
}

/** Reference track — a single note, not a literal waveform. */
export function IconMusicNote(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 17.5V6.5L18 4.5v11" />
      <circle cx="7.25" cy="17.5" r="2.25" />
      <circle cx="15.75" cy="15.5" r="2.25" />
    </svg>
  );
}

/** Regenerate — a single circling arrow, not a full double-loop refresh
 * glyph, to stay quiet enough to sit inside a card's corner. */
export function IconRefresh(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12a7 7 0 0 1 11.5-5.3M19 12a7 7 0 0 1-11.5 5.3" />
      <path d="M16.5 5.5v3.2h-3.2" />
      <path d="M7.5 18.5v-3.2h3.2" />
    </svg>
  );
}

/** Edit — a nib mid-stroke. */
export function IconPencil(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 4.5 19.5 9 8 20.5H3.5V16Z" strokeLinejoin="round" />
      <path d="M13 6.5 17.5 11" />
    </svg>
  );
}

export function IconSpeakerMuted(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 9.5h3.2L12 5.5v13l-4.3-4H4.5z" strokeLinejoin="round" />
      <path d="M15.5 9.5 20 14" />
      <path d="M20 9.5 15.5 14" />
    </svg>
  );
}
