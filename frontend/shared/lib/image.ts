// Client-side resize before a photo ever leaves the browser — the backend
// caps attachments at 5MB (IdentityChatController.MAX_IMAGE_BYTES), but a
// phone camera photo is routinely 10-20MB, and there's no reason to make
// the artist wait on that upload when a 1024px JPEG carries the same
// visual-identity signal for Bandly to look at.

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.85;

export type ResizedImage = { base64: string; mimeType: string; dataUrl: string };

export function resizeImageFile(file: File): Promise<ResizedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That doesn't look like a valid image."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Couldn't process that image."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        const base64 = dataUrl.split(",")[1] ?? "";
        resolve({ base64, mimeType: "image/jpeg", dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
