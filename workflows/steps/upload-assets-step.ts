import { put } from '@vercel/blob';

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

  const uploadedAssets: { name: string; blobUrl: string }[] = [];

  for (const asset of assets) {
    try {
      // Fetch the image from the original URL
      const imageResponse = await fetch(asset.url);

      if (!imageResponse.ok) {
        console.warn(`Failed to fetch asset ${asset.name} from ${asset.url}`);
        continue;
      }

      const imageBlob = await imageResponse.blob();

      // Determine content type
      const contentType = imageResponse.headers.get('content-type') || 'image/png';

      // Generate filename with extension
      const extension = contentType.split('/')[1]?.replace(/;.*$/, '') || 'png';
      const pathname = `blog-assets/${asset.name}.${extension}`;

      // Upload to Vercel Blob using the SDK
      const blob = await put(pathname, imageBlob, {
        access: 'public',
        addRandomSuffix: true,
        contentType,
        token: blobToken,
      });

      uploadedAssets.push({
        name: asset.name,
        blobUrl: blob.url,
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
