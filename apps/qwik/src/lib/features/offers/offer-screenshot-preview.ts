const PREVIEW_MAX_LONG_EDGE_PX = 256;
const PREVIEW_QUALITY = 0.78;

const readDataUrl = async (blob: Blob): Promise<string> => {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error('Unable to process screenshot preview.'));
    };
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to process screenshot preview.'));
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
      reject(new Error('Unable to read screenshot image.'));
    };
    image.src = src;
  });
};

const renderPreviewBlob = async (image: HTMLImageElement): Promise<Blob> => {
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longestEdge > PREVIEW_MAX_LONG_EDGE_PX
    ? PREVIEW_MAX_LONG_EDGE_PX / longestEdge
    : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  return await new Promise<Blob>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Unable to process screenshot preview.'));
      return;
    }

    context.drawImage(image, 0, 0, width, height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to process screenshot preview.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      PREVIEW_QUALITY,
    );
  });
};

export const createOfferScreenshotPreviewDataUrl = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid screenshot image file.');
  }
  const image = await decodeImage(file);
  const previewBlob = await renderPreviewBlob(image);
  return await readDataUrl(previewBlob);
};
