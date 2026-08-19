// Voice I/O for the Identity Chat, built on the browser's own Web Speech
// API — no new backend service, no API key, works the moment the browser
// supports it (Chrome/Edge/Safari; feature-detected everywhere it's used,
// since Firefox doesn't implement SpeechRecognition and some browsers have
// zero synthesis voices installed).

export type LanguageCode = "nl" | "de" | "en";

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; bcp47: string }[] = [
  { code: "nl", label: "Nederlands", bcp47: "nl-NL" },
  { code: "de", label: "Deutsch", bcp47: "de-DE" },
  { code: "en", label: "English", bcp47: "en-US" },
];

export function bcp47For(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.bcp47 ?? "en-US";
}

// Common female-voice names across macOS, Windows, Android, and Chrome's
// own network voices, per language — there's no reliable "gender" field on
// SpeechSynthesisVoice in the spec, so this is a best-effort name match,
// not a guarantee. Falls back to the first voice for the language if none
// of these are installed, which is a real possibility on some systems.
const FEMALE_VOICE_HINTS: Record<LanguageCode, string[]> = {
  nl: ["Xander", "Claire", "Ellen", "Google Nederlands"],
  de: ["Anna", "Petra", "Google Deutsch"],
  en: ["Samantha", "Victoria", "Karen", "Moira", "Tessa", "Google US English"],
};

export function pickVoice(language: LanguageCode): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = language;
  const candidates = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  if (candidates.length === 0) return null;

  const hints = FEMALE_VOICE_HINTS[language];
  const preferred = candidates.find((v) => hints.some((hint) => v.name.includes(hint)));
  return preferred ?? candidates[0];
}

export function speak(text: string, language: LanguageCode) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // one voice at a time — a new reply shouldn't queue behind an old one
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = bcp47For(language);
  utterance.rate = 1;
  utterance.pitch = 1;
  const voice = pickVoice(language);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// --- Speech-to-text (the microphone side) ---

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechRecognitionSupported(): boolean {
  return getRecognitionConstructor() !== null;
}

/**
 * Starts listening for one utterance. Calls onInterim as words are
 * recognized (so the UI can show a live transcript), then onFinal once
 * with the finished sentence, then stops itself — a single press-to-talk
 * turn, not continuous background listening. onError fires for anything
 * that isn't a clean result (permission denied, no speech detected, …) so
 * the caller can show a real message instead of failing silently.
 */
export function listenOnce(
  language: LanguageCode,
  handlers: { onInterim?: (text: string) => void; onFinal: (text: string) => void; onError: (message: string) => void; onEnd?: () => void },
): { stop: () => void } {
  const Recognition = getRecognitionConstructor();
  if (!Recognition) {
    handlers.onError("Voice input isn't supported in this browser.");
    return { stop: () => {} };
  }

  const recognition = new Recognition();
  recognition.lang = bcp47For(language);
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const results = (event as { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }).results;
    let interim = "";
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.isFinal) {
        handlers.onFinal(result[0].transcript.trim());
      } else {
        interim += result[0].transcript;
      }
    }
    if (interim && handlers.onInterim) handlers.onInterim(interim.trim());
  };

  recognition.onerror = (event) => {
    const error = (event as { error?: string }).error ?? "unknown";
    const message =
      error === "not-allowed" || error === "permission-denied"
        ? "Microphone access was denied — check your browser's site permissions."
        : error === "no-speech"
          ? "Didn't catch that — try again."
          : "Voice input hit a problem — try again.";
    handlers.onError(message);
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  recognition.start();
  return { stop: () => recognition.stop() };
}
