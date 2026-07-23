import sharp from 'sharp';

export const MOBILE_IMAGE_MAX_WIDTH = 750;
export const MOBILE_IMAGE_QUALITY = 75;

/** Full-size upload cap (desktop), still compressed. */
export const UPLOAD_MAX_WIDTH = 1600;
export const UPLOAD_QUALITY = 82;

export async function toMobileWebp(
  input: Buffer,
  maxWidth = MOBILE_IMAGE_MAX_WIDTH,
  quality = MOBILE_IMAGE_QUALITY,
): Promise<Buffer> {
  return sharp(input, { failOn: 'none' })
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality, effort: 4 })
    .toBuffer();
}

export async function compressUploadImage(
  input: Buffer,
  mimetype: string,
): Promise<{ buffer: Buffer; ext: string; mime: string }> {
  const pipeline = sharp(input, { failOn: 'none' })
    .rotate()
    .resize({
      width: UPLOAD_MAX_WIDTH,
      withoutEnlargement: true,
      fit: 'inside',
    });

  const preferWebp = !mimetype.includes('png');
  if (preferWebp || mimetype === 'image/webp') {
    const buffer = await pipeline.webp({ quality: UPLOAD_QUALITY, effort: 4 }).toBuffer();
    return { buffer, ext: '.webp', mime: 'image/webp' };
  }

  const buffer = await pipeline
    .png({ compressionLevel: 8, palette: false })
    .toBuffer();
  return { buffer, ext: '.png', mime: 'image/png' };
}
