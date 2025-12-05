import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 10MB' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(
      `user-uploads/reference-${Date.now()}.${file.name.split('.').pop()}`,
      file,
      {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );

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
