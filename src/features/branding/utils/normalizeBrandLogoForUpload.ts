/**
 * pdf-lib embeds PNG/JPEG only. Convert WebP/SVG to PNG in the browser
 * before upload so organization logos appear on invoice/quotation PDFs.
 */

function isAlreadyPdfFriendly(file: File): boolean {
  const type = (file.type || '').toLowerCase();
  if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
    return true;
  }
  return /\.(png|jpe?g)$/i.test(file.name);
}

function needsRasterize(file: File): boolean {
  const type = (file.type || '').toLowerCase();
  if (type === 'image/webp' || type === 'image/svg+xml') return true;
  return /\.(webp|svg)$/i.test(file.name);
}

async function canvasToPngFile(
  source: CanvasImageSource,
  width: number,
  height: number,
  baseName: string,
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare logo for upload.');
  // Preserve black-background logos (e.g. KingFisher WebP) as opaque PNG.
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not convert logo to PNG.'))),
      'image/png',
    );
  });

  const safeBase = baseName.replace(/\.[^.]+$/, '') || 'logo';
  return new File([blob], `${safeBase}.png`, { type: 'image/png' });
}

/**
 * Return a PNG/JPEG file suitable for PDF embedding.
 * WebP (and SVG) are rasterized to PNG; other images pass through.
 */
export async function normalizeBrandLogoForUpload(file: File): Promise<File> {
  if (!file) throw new Error('Choose a logo file.');
  if (isAlreadyPdfFriendly(file) || !needsRasterize(file)) {
    return file;
  }

  const bitmap = typeof createImageBitmap === 'function'
    ? await createImageBitmap(file).catch(() => null)
    : null;

  if (bitmap) {
    try {
      return await canvasToPngFile(bitmap, bitmap.width, bitmap.height, file.name);
    } finally {
      bitmap.close();
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read WebP/SVG logo.'));
      el.src = objectUrl;
    });
    return await canvasToPngFile(
      img,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      file.name,
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
