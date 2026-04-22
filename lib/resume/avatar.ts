export const AVATAR_MAX_DIMENSION = 256;
export const AVATAR_JPEG_QUALITY = 0.85;
export const AVATAR_MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB input cap

export type AvatarUploadResult = { ok: true; dataUrl: string; sizeBytes: number } | { ok: false; error: string };

export async function fileToResizedDataUrl(file: File): Promise<AvatarUploadResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Please choose an image file." };
  }
  if (file.size > AVATAR_MAX_FILE_BYTES) {
    return { ok: false, error: "Image is too large. Max 5 MB." };
  }

  const bitmap = await loadImage(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height, AVATAR_MAX_DIMENSION);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { ok: false, error: "Could not process image." };
  ctx.drawImage(bitmap, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY);
  const sizeBytes = Math.round((dataUrl.length * 3) / 4);
  return { ok: true, dataUrl, sizeBytes };
}

function fitWithin(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w / h;
  if (w >= h) return { width: max, height: Math.round(max / ratio) };
  return { width: Math.round(max * ratio), height: max };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
