import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
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

    console.log('[Upload] Uploading to Vercel Blob...');

    // Upload to Vercel Blob
    const blob = await put(
      `user-uploads/reference-${Date.now()}.${file.name.split('.').pop()}`,
      file,
      {
        access: 'public',
        token: blobToken,
      }
    );

    console.log('[Upload] ✓ Upload successful:', blob.url);

    return NextResponse.json({
      success: true,
      blobUrl: blob.url,
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
