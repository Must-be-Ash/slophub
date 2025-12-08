import { put } from '@vercel/blob';
import { validateAndResizeImage, getImageDimensions } from '../../lib/image-utils';

export async function screenshotStep({
  url,
}: {
  url: string;
}): Promise<{ screenshotUrl: string; dimensions: { width: number; height: number } }> {
  'use step';

  console.log('[Screenshot] Starting screenshot capture for URL:', url);

  // Use a screenshot API service (Screenshotone, ScreenshotAPI, etc.)
  // We'll use ScreenshotAPI.net which has a generous free tier

  const screenshotApiUrl = new URL('https://shot.screenshotapi.net/screenshot');
  screenshotApiUrl.searchParams.set('url', url);
  screenshotApiUrl.searchParams.set('output', 'image');
  screenshotApiUrl.searchParams.set('file_type', 'png');
  screenshotApiUrl.searchParams.set('wait_for_event', 'load');
  screenshotApiUrl.searchParams.set('fresh', 'true');
  screenshotApiUrl.searchParams.set('width', '1280');
  screenshotApiUrl.searchParams.set('height', '720'); // Viewport height, not full page

  // Use screenshotapi token if available, otherwise try without auth
  const screenshotToken = process.env.SCREENSHOTAPI_TOKEN;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  console.log('[Screenshot] SCREENSHOTAPI_TOKEN configured:', !!screenshotToken);
  console.log('[Screenshot] BLOB_READ_WRITE_TOKEN configured:', !!blobToken);

  if (screenshotToken) {
    screenshotApiUrl.searchParams.set('token', screenshotToken);
  } else {
    console.warn('[Screenshot] No SCREENSHOTAPI_TOKEN - using free tier (may have limits)');
  }

  try {
    console.log('[Screenshot] Calling ScreenshotAPI.net...');
    const startTime = Date.now();

    // Fetch the screenshot
    const response = await fetch(screenshotApiUrl.toString());

    const apiDuration = Date.now() - startTime;
    console.log(`[Screenshot] ScreenshotAPI responded in ${apiDuration}ms with status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error body');
      console.error('[Screenshot] ScreenshotAPI error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.slice(0, 500),
      });
      throw new Error(`Screenshot API failed: ${response.status} - ${response.statusText} - ${errorText.slice(0, 200)}`);
    }

    const imageBuffer = await response.arrayBuffer();
    console.log(`[Screenshot] Received image: ${(imageBuffer.byteLength / 1024).toFixed(2)} KB`);

    // Extract dimensions BEFORE processing
    const originalDims = await getImageDimensions(Buffer.from(imageBuffer));
    console.log('[Screenshot] Original dimensions:', originalDims);

    // Validate and resize if needed (max 4096px - safe limit)
    const processed = await validateAndResizeImage(
      Buffer.from(imageBuffer),
      4096, // Safe limit with headroom
      85    // Slightly lower quality for screenshots (file size reduction)
    );

    if (processed.metadata.wasResized) {
      console.log(`[Screenshot] ⚠️ Image was resized from ${originalDims.width}x${originalDims.height} to ${processed.metadata.width}x${processed.metadata.height}`);
    }

    // Upload processed image to Vercel Blob
    const imageBlob = new Blob([new Uint8Array(processed.buffer)], { type: 'image/png' });
    const blobFilename = `screenshots/landing-${Date.now()}.png`;

    console.log('[Screenshot] Uploading to Vercel Blob:', blobFilename);

    const blobResult = await put(blobFilename, imageBlob, {
      access: 'public',
      token: blobToken,
    });

    console.log('[Screenshot] ✓ Upload successful:', blobResult.url);
    console.log('[Screenshot] Final dimensions:', {
      width: processed.metadata.width,
      height: processed.metadata.height,
    });

    return {
      screenshotUrl: blobResult.url,
      dimensions: {
        width: processed.metadata.width,
        height: processed.metadata.height,
      },
    };
  } catch (error) {
    console.error('[Screenshot] Screenshot capture failed:', error);
    console.error('[Screenshot] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Screenshot] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Screenshot] Error stack:', error instanceof Error ? error.stack : 'N/A');

    throw new Error(
      `Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
