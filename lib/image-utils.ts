import sharp from 'sharp';

// Constants
export const MAX_DIMENSION = 8000; // Claude's Vision API limit
export const RECOMMENDED_MAX_DIMENSION = 4096; // Safe limit with headroom
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Supported formats
export const SUPPORTED_IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  isOversized: boolean;
  wasResized: boolean;
}

export interface ProcessedImage {
  buffer: Buffer;
  metadata: ImageMetadata;
}

/**
 * Extract image dimensions without loading full image into memory
 */
export async function getImageDimensions(
  input: Buffer | string
): Promise<{ width: number; height: number; format: string }> {
  const image = sharp(input);
  const metadata = await image.metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
  };
}

/**
 * Validate and resize image if needed
 * @param input - Buffer, URL, or file path
 * @param maxDimension - Maximum allowed dimension (default: RECOMMENDED_MAX_DIMENSION)
 * @param quality - JPEG/WebP quality 1-100 (default: 90)
 */
export async function validateAndResizeImage(
  input: Buffer | string,
  maxDimension: number = RECOMMENDED_MAX_DIMENSION,
  quality: number = 90
): Promise<ProcessedImage> {
  console.log('[ImageUtils] Processing image, maxDimension:', maxDimension);

  // Load image
  let imageBuffer: Buffer;
  if (typeof input === 'string') {
    // Download from URL
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    imageBuffer = Buffer.from(await response.arrayBuffer());
  } else {
    imageBuffer = input;
  }

  // Get original metadata
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const format = metadata.format || 'unknown';
  const originalSize = imageBuffer.byteLength;

  console.log('[ImageUtils] Original dimensions:', { width, height, format, size: originalSize });

  // Check if oversized
  const isOversized = width > maxDimension || height > maxDimension;

  if (!isOversized) {
    // No resizing needed - optimize only
    const optimizedBuffer = await image
      .jpeg({ quality, mozjpeg: true })
      .png({ compressionLevel: 9 })
      .webp({ quality })
      .toBuffer();

    console.log('[ImageUtils] Image within limits, optimized only');

    return {
      buffer: optimizedBuffer,
      metadata: {
        width,
        height,
        format,
        size: optimizedBuffer.byteLength,
        isOversized: false,
        wasResized: false,
      },
    };
  }

  // Calculate new dimensions (maintain aspect ratio)
  const aspectRatio = width / height;
  let newWidth: number;
  let newHeight: number;

  if (width > height) {
    newWidth = maxDimension;
    newHeight = Math.round(maxDimension / aspectRatio);
  } else {
    newHeight = maxDimension;
    newWidth = Math.round(maxDimension * aspectRatio);
  }

  console.log('[ImageUtils] Resizing to:', { newWidth, newHeight });

  // Resize with high-quality algorithm
  const resizedBuffer = await image
    .resize(newWidth, newHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality, mozjpeg: true })
    .png({ compressionLevel: 9 })
    .webp({ quality })
    .toBuffer();

  console.log('[ImageUtils] Resized successfully:', {
    originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
    newSize: `${(resizedBuffer.byteLength / 1024).toFixed(2)} KB`,
    reduction: `${(((originalSize - resizedBuffer.byteLength) / originalSize) * 100).toFixed(1)}%`,
  });

  return {
    buffer: resizedBuffer,
    metadata: {
      width: newWidth,
      height: newHeight,
      format,
      size: resizedBuffer.byteLength,
      isOversized: true,
      wasResized: true,
    },
  };
}

/**
 * Check if URL points to supported raster image
 */
export function isSupportedImageFormat(url: string): boolean {
  const urlLower = url.toLowerCase();
  return SUPPORTED_EXTENSIONS.some(ext => urlLower.includes(ext));
}

/**
 * Validate image meets requirements without processing
 */
export async function validateImageRequirements(
  input: Buffer | string,
  maxDimension: number = MAX_DIMENSION,
  maxSizeBytes: number = MAX_FILE_SIZE_BYTES
): Promise<{ valid: boolean; reason?: string; dimensions?: { width: number; height: number } }> {
  try {
    const dims = await getImageDimensions(input);

    if (dims.width > maxDimension || dims.height > maxDimension) {
      return {
        valid: false,
        reason: `Image dimensions ${dims.width}x${dims.height} exceed max ${maxDimension}px`,
        dimensions: dims,
      };
    }

    const size = typeof input === 'string'
      ? (await fetch(input)).headers.get('content-length')
      : input.byteLength;

    if (size && parseInt(size.toString()) > maxSizeBytes) {
      return {
        valid: false,
        reason: `Image size ${size} bytes exceeds max ${maxSizeBytes} bytes`,
        dimensions: dims,
      };
    }

    return { valid: true, dimensions: dims };
  } catch (error) {
    return {
      valid: false,
      reason: `Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
