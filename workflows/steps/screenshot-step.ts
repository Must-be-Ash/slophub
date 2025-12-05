import { put } from '@vercel/blob';

export async function screenshotStep({
  url,
}: {
  url: string;
}): Promise<{ screenshotUrl: string }> {
  'use step';

  // Use a screenshot API service (Screenshotone, ScreenshotAPI, etc.)
  // We'll use ScreenshotAPI.net which has a generous free tier

  const screenshotApiUrl = new URL('https://shot.screenshotapi.net/screenshot');
  screenshotApiUrl.searchParams.set('url', url);
  screenshotApiUrl.searchParams.set('output', 'image');
  screenshotApiUrl.searchParams.set('file_type', 'png');
  screenshotApiUrl.searchParams.set('wait_for_event', 'load');
  screenshotApiUrl.searchParams.set('full_page', 'true');
  screenshotApiUrl.searchParams.set('fresh', 'true');
  screenshotApiUrl.searchParams.set('width', '1280');
  screenshotApiUrl.searchParams.set('height', '720');

  // Use screenshotapi token if available, otherwise try without auth
  const screenshotToken = process.env.SCREENSHOTAPI_TOKEN;
  if (screenshotToken) {
    screenshotApiUrl.searchParams.set('token', screenshotToken);
  }

  try {
    // Fetch the screenshot
    const response = await fetch(screenshotApiUrl.toString());

    if (!response.ok) {
      throw new Error(`Screenshot API failed: ${response.status} - ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });

    // Upload to Vercel Blob
    const blobResult = await put(
      `screenshots/landing-${Date.now()}.png`,
      imageBlob,
      {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );

    return {
      screenshotUrl: blobResult.url,
    };
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw new Error(
      `Failed to capture screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
