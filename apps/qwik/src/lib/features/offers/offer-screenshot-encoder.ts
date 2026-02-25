const MAX_LONG_EDGE_PX = 1800;
const MAX_ENCODED_IMAGE_BYTES = 3_750_000;
const MIN_JPEG_QUALITY = 0.58;
const JPEG_QUALITY_STEP = 0.08;
const INITIAL_JPEG_QUALITY = 0.86;
const RESIZE_ATTEMPTS = 4;
const RESIZE_FACTOR = 0.85;

const readDataUrl = async (blob: Blob): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("Unable to process screenshot file."));
    };
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to process screenshot file."));
        return;
      }
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

const decodeImage = async (file: File): Promise<HTMLImageElement> => {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(src);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error("Unable to read screenshot image."));
    };
    image.src = src;
  });
};

const renderJpegBlob = async (
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> => {
  return await new Promise<Blob>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Unable to process screenshot file."));
      return;
    }
    context.drawImage(image, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to process screenshot file."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
};

const encodeImageBlob = async (blob: Blob): Promise<string> => {
  const dataUrl = await readDataUrl(blob);
  const separatorIndex = dataUrl.indexOf(",");
  if (separatorIndex < 0) {
    throw new Error("Unable to process screenshot file.");
  }
  return dataUrl.slice(separatorIndex + 1);
};

export const encodeScreenshotForAnalyze = async (
  file: File,
): Promise<{ imageBase64: string; mimeType: string }> => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid screenshot image file.");
  }

  const image = await decodeImage(file);
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const initialScale =
    longestEdge > MAX_LONG_EDGE_PX ? MAX_LONG_EDGE_PX / longestEdge : 1;
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));

  for (let resizeAttempt = 0; resizeAttempt < RESIZE_ATTEMPTS; resizeAttempt += 1) {
    for (
      let quality = INITIAL_JPEG_QUALITY;
      quality >= MIN_JPEG_QUALITY;
      quality -= JPEG_QUALITY_STEP
    ) {
      const blob = await renderJpegBlob(image, width, height, quality);
      if (blob.size > MAX_ENCODED_IMAGE_BYTES) {
        continue;
      }
      return {
        imageBase64: await encodeImageBlob(blob),
        mimeType: "image/jpeg",
      };
    }

    width = Math.max(1, Math.round(width * RESIZE_FACTOR));
    height = Math.max(1, Math.round(height * RESIZE_FACTOR));
  }

  throw new Error("Screenshot file is too large. Please crop and retry.");
};
