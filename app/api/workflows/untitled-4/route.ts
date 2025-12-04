import { start } from 'workflow/api';
import { untitled4Workflow } from '@/workflows/untitled-4';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate URL
    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Start the workflow execution
    const run = await start(untitled4Workflow, [body]);

    return NextResponse.json({
      success: true,
      runId: run.runId,
      message: 'Workflow started successfully',
    });
  } catch (error) {
    console.error('Workflow start error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
