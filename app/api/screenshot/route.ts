import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import {
  createPaymentRequirements,
  verifyPayment,
  settlePayment,
  create402Response,
} from '@/lib/payment-verification';
import type { Resource } from 'x402/types';

export async function POST(request: Request) {
  try {
    // PAYMENT VERIFICATION
    const paymentHeader = request.headers.get('X-PAYMENT');
    const requestUrl = `${new URL(request.url).origin}${new URL(request.url).pathname}` as Resource;

    const paymentRequirements = createPaymentRequirements(
      '$0.001',
      'base',
      requestUrl,
      'Take and store website screenshot'
    );

    const verificationResult = await verifyPayment(paymentHeader, paymentRequirements);

    if (!verificationResult.isValid) {
      console.log('[Screenshot] Payment required - returning 402');
      return NextResponse.json(
        create402Response(paymentRequirements, verificationResult.error, verificationResult.payer),
        { status: 402 }
      );
    }

    console.log('[Screenshot] ✓ Payment verified from:', verificationResult.payer);

    // Settle payment asynchronously
    settlePayment(paymentHeader!, paymentRequirements).then(result => {
      if (result.success) {
        console.log('[Screenshot] ✓ Payment settled:', result.txHash);
      }
    });

    const body = await request.json();

    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Build screenshot API URL
    const screenshotApiUrl = new URL('https://shot.screenshotapi.net/screenshot');
    screenshotApiUrl.searchParams.set('url', body.url);
    screenshotApiUrl.searchParams.set('output', 'image');
    screenshotApiUrl.searchParams.set('file_type', 'png');
    screenshotApiUrl.searchParams.set('wait_for_event', 'load');
    screenshotApiUrl.searchParams.set('full_page', 'true');
    screenshotApiUrl.searchParams.set('fresh', 'true');
    screenshotApiUrl.searchParams.set('width', '1280');
    screenshotApiUrl.searchParams.set('height', '720');

    // Add token if available
    const screenshotToken = process.env.SCREENSHOTAPI_TOKEN;
    if (screenshotToken) {
      screenshotApiUrl.searchParams.set('token', screenshotToken);
    }

    // Fetch the screenshot
    const screenshotResponse = await fetch(screenshotApiUrl.toString());

    if (!screenshotResponse.ok) {
      const errorText = await screenshotResponse.text();
      throw new Error(`Screenshot API failed: ${screenshotResponse.status} - ${errorText}`);
    }

    const imageBuffer = await screenshotResponse.arrayBuffer();
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

    return NextResponse.json({
      success: true,
      screenshotUrl: blobResult.url,
    });
  } catch (error) {
    console.error('Screenshot API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
