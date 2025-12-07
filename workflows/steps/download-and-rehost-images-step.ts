import { put } from '@vercel/blob';

interface DownloadAndRehostInput {
  imageUrls: string[];
}

interface DownloadAndRehostOutput {
  successfulUploads: Array<{
    originalUrl: string;
    blobUrl: string;
    name: string;
  }>;
  failedUrls: Array<{
    originalUrl: string;
    error: string;
  }>;
}

export async function downloadAndRehostImagesStep(
  input: DownloadAndRehostInput
): Promise<DownloadAndRehostOutput> {
  'use step';

  const successfulUploads: DownloadAndRehostOutput['successfulUploads'] = [];
  const failedUrls: DownloadAndRehostOutput['failedUrls'] = [];

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    console.error('[Download & Rehost] BLOB_READ_WRITE_TOKEN not configured');
    throw new Error('BLOB_READ_WRITE_TOKEN is required for image rehosting');
  }

  for (let i = 0; i < input.imageUrls.length; i++) {
    const url = input.imageUrls[i];

    try {
      console.log(`[Download & Rehost] Downloading image ${i + 1}/${input.imageUrls.length}: ${url}`);

      // Fetch with 10-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Slophub/1.0; +https://slophub.xyz)',
        },
      });

      clearTimeout(timeoutId);

      // Verify response
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Verify content type is an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content-type: ${contentType || 'unknown'}`);
      }

      // Download blob
      const blob = await response.blob();
      console.log(`[Download & Rehost] Downloaded ${blob.size} bytes, content-type: ${contentType}`);

      // Generate filename from URL or index
      const urlParts = new URL(url);
      const pathParts = urlParts.pathname.split('/');
      const filename = pathParts[pathParts.length - 1] || `brand-image-${i}`;
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '-');

      // Upload to Vercel Blob
      const uploadName = `brand-assets/${Date.now()}-${sanitizedFilename}`;
      console.log(`[Download & Rehost] Uploading to Vercel Blob as: ${uploadName}`);

      const { url: blobUrl } = await put(uploadName, blob, {
        access: 'public',
        token: blobToken,
      });

      console.log(`[Download & Rehost] ✓ Successfully rehosted: ${url} → ${blobUrl}`);

      successfulUploads.push({
        originalUrl: url,
        blobUrl: blobUrl,
        name: sanitizedFilename,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Download & Rehost] ✗ Failed to rehost ${url}:`, errorMessage);

      failedUrls.push({
        originalUrl: url,
        error: errorMessage,
      });
    }
  }

  console.log(`[Download & Rehost] Summary: ${successfulUploads.length} succeeded, ${failedUrls.length} failed`);

  return {
    successfulUploads,
    failedUrls,
  };
}
