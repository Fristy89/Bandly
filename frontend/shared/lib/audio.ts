// Reference-track upload for the "what's your sound" step before the
// Identity Chat starts — unlike shared/lib/image.ts there's no client-side
// re-encoding here (no simple Canvas equivalent for audio), just
// validation and base64 encoding. The backend enforces the real limits
// (IdentityChatController.ALLOWED_AUDIO_TYPES/MAX_AUDIO_BYTES); this
// mirrors them only so a bad file gets caught before a slow upload, not
// as the source of truth.

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"]);

export type EncodedAudio = { base64: string; mimeType: string };

export function readAudioFile(file: File): Promise<EncodedAudio> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.has(file.type)) {
      reject(new Error("That file type isn't supported — try an MP3, WAV, or M4A."));
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      reject(new Error("That track is too large — please use one under 15 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      resolve({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  });
}
