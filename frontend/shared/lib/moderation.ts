// Mirrors backend/.../artistdna/application/ChatModeration.kt's word list —
// the backend is the real enforcement boundary (this check is trivially
// bypassed client-side), this just avoids a blocked message ever flashing
// into the transcript before the API call rejects it. Keep the two lists
// in sync by hand; see that file for why this stays a small, blunt list
// rather than trying to be exhaustive.

const BLOCKED_WORDS = new Set([
  // Dutch
  "eikel", "klootzak", "kutwijf", "kanker", "hoerenzoon", "lul", "kut", "trut", "debiel",
  // German
  "arschloch", "wichser", "hurensohn", "fotze", "schlampe", "missgeburt",
  // English
  "asshole", "bitch", "bastard", "cunt", "motherfucker", "dickhead",
]);

export function containsProfanity(text: string): boolean {
  const normalized = ` ${text.toLowerCase().replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim()} `;
  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(` ${word} `)) return true;
  }
  return false;
}
