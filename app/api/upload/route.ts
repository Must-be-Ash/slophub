import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { validateAndResizeImage, getImageDimensions } from '@/lib/image-utils';

export async function POST(request: Request) {
  try {
    // ORIGIN VALIDATION - Only allow uploads from your frontend
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    const allowedOrigins = [
      'https://www.slophub.xyz',
      'https://slophub.xyz',
      'http://localhost:3000', // For local development
    ];

    // Check origin header first (most reliable)
    const isValidOrigin = origin && allowedOrigins.includes(origin);

    // Fallback to referer header (in case origin is missing)
    const isValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));

    if (!isValidOrigin && !isValidReferer) {
      console.error('[Upload] ❌ Unauthorized origin:', { origin, referer });
      return NextResponse.json(
        { error: 'Unauthorized - uploads only allowed from slophub.xyz' },
        { status: 403 }
      );
    }

    console.log('[Upload] ✓ Valid origin:', origin || referer);
    console.log('[Upload] Received upload request');
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      console.error('[Upload] No image file in formData');
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log(`[Upload] File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('[Upload] Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('[Upload] File too large:', file.size);
      return NextResponse.json(
        { error: 'Image must be less than 10MB' },
        { status: 400 }
      );
    }

    // Check blob token
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    console.log('[Upload] BLOB_READ_WRITE_TOKEN present:', !!blobToken);

    if (!blobToken) {
      console.error('[Upload] ❌ BLOB_READ_WRITE_TOKEN not configured!');
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    console.log('[Upload] Processing image...');

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Extract original dimensions
    const originalDims = await getImageDimensions(imageBuffer);
    console.log(`[Upload] Original dimensions: ${originalDims.width}x${originalDims.height}`);

    // Validate and resize if needed (max 4096px - safe limit)
    const processed = await validateAndResizeImage(
      imageBuffer,
      4096, // Safe limit with headroom
      90    // Good quality for user uploads
    );

    if (processed.metadata.wasResized) {
      console.log(`[Upload] ⚠️ Image was resized from ${originalDims.width}x${originalDims.height} to ${processed.metadata.width}x${processed.metadata.height}`);
    }

    console.log('[Upload] Uploading to Vercel Blob...');

    // Upload processed image to Vercel Blob
    const processedBlob = new Blob([new Uint8Array(processed.buffer)], { type: file.type });
    const blob = await put(
      `user-uploads/reference-${Date.now()}.${file.name.split('.').pop()}`,
      processedBlob,
      {
        access: 'public',
        token: blobToken,
      }
    );

    console.log('[Upload] ✓ Upload successful:', blob.url);
    console.log(`[Upload] Final dimensions: ${processed.metadata.width}x${processed.metadata.height}`);

    return NextResponse.json({
      success: true,
      blobUrl: blob.url,
      dimensions: {
        width: processed.metadata.width,
        height: processed.metadata.height,
      },
      wasResized: processed.metadata.wasResized,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
