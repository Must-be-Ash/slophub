import { put } from '@vercel/blob';
import { validateAndResizeImage, getImageDimensions } from '../../lib/image-utils';

export async function uploadAssetsStep({
  assets,
}: {
  assets: { name: string; url: string }[];
}) {
  'use step';

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }

  const uploadedAssets: {
    name: string;
    blobUrl: string;
    dimensions: { width: number; height: number };
    wasResized: boolean;
  }[] = [];

  for (const asset of assets) {
    try {
      // Fetch the image from the original URL
      console.log(`[Upload Assets] Fetching asset: ${asset.name} from ${asset.url}`);
      const imageResponse = await fetch(asset.url);

      if (!imageResponse.ok) {
        console.warn(`[Upload Assets] Failed to fetch asset ${asset.name} from ${asset.url}`);
        continue;
      }

      const imageBlob = await imageResponse.blob();

      // Determine content type
      const contentType = imageResponse.headers.get('content-type') || 'image/png';

      // Convert to Buffer for image processing
      const arrayBuffer = await imageBlob.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Extract original dimensions
      const originalDims = await getImageDimensions(imageBuffer);
      console.log(`[Upload Assets] ${asset.name} original dimensions: ${originalDims.width}x${originalDims.height}`);

      // Validate and resize if needed (max 4096px - safe limit)
      const processed = await validateAndResizeImage(
        imageBuffer,
        4096, // Safe limit with headroom
        90    // Good quality for assets
      );

      if (processed.metadata.wasResized) {
        console.log(`[Upload Assets] ⚠️ ${asset.name} was resized from ${originalDims.width}x${originalDims.height} to ${processed.metadata.width}x${processed.metadata.height}`);
      }

      // Generate filename with extension
      const extension = contentType.split('/')[1]?.replace(/;.*$/, '') || 'png';
      const pathname = `blog-assets/${asset.name}.${extension}`;

      // Upload processed image to Vercel Blob
      const processedBlob = new Blob([new Uint8Array(processed.buffer)], { type: contentType });
      const blob = await put(pathname, processedBlob, {
        access: 'public',
        addRandomSuffix: true,
        contentType,
        token: blobToken,
      });

      console.log(`[Upload Assets] ✓ ${asset.name} uploaded: ${blob.url}`);
      console.log(`[Upload Assets] Final dimensions: ${processed.metadata.width}x${processed.metadata.height}`);

      uploadedAssets.push({
        name: asset.name,
        blobUrl: blob.url,
        dimensions: {
          width: processed.metadata.width,
          height: processed.metadata.height,
        },
        wasResized: processed.metadata.wasResized,
      });
    } catch (error) {
      console.warn(`Error uploading asset ${asset.name}:`, error);
      // Continue with other assets even if one fails
    }
  }

  return {
    assets: uploadedAssets,
    count: uploadedAssets.length,
  };
}
