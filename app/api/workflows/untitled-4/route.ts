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

    // Validate campaign description
    if (!body.campaignDescription || typeof body.campaignDescription !== 'string') {
      return NextResponse.json(
        { error: 'Campaign description is required and must be a string' },
        { status: 400 }
      );
    }

    if (body.campaignDescription.trim().length < 20) {
      return NextResponse.json(
        { error: 'Campaign description must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Optional imageUrl validation
    if (body.imageUrl && typeof body.imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'imageUrl must be a string if provided' },
        { status: 400 }
      );
    }

    // Start the workflow execution (we'll get runId from the result)
    const run = await start(untitled4Workflow, [body]);

    // Import cache to initialize the workflow
    const { addStepUpdate } = await import('@/lib/workflow-cache');

    // Initialize an empty cache entry for this workflow
    // The workflow will populate it as it runs
    addStepUpdate(run.runId, {
      stepId: '_init',
      stepLabel: 'Initializing',
      status: 'pending',
      timestamp: Date.now(),
    });

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
