import { getRun } from 'workflow/api';
import { NextResponse } from 'next/server';

// Increase timeout for status checks
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');
    const stream = searchParams.get('stream') === 'true';

    if (!runId) {
      return NextResponse.json(
        { error: 'runId query parameter is required' },
        { status: 400 }
      );
    }

    // Try to get the workflow run
    let run;
    let runNotFound = false;

    try {
      run = getRun(runId);
    } catch (error) {
      // Workflow not found in this instance - might be running on different instance
      console.log('[Status API] getRun() failed, checking workflow cache:', runId);
      runNotFound = true;
    }

    // If streaming is requested or run not found, check workflow cache
    if (stream || runNotFound) {
      const { getStepUpdates } = await import('@/lib/workflow-cache');
      const steps = getStepUpdates(runId);

      // If we have steps in cache, workflow is running
      if (steps.length > 0) {
        const hasError = steps.some(s => s.status === 'error');
        const allComplete = steps.every(s => s.status === 'success' || s.status === 'error');

        let status: string;
        if (hasError) {
          status = 'failed';
        } else if (allComplete && steps.length >= 6) { // We have 6 steps total
          status = 'completed';
        } else {
          status = 'running';
        }

        console.log(`[Status API] Using cached steps for runId: ${runId}, count: ${steps.length}, status: ${status}`);

        return NextResponse.json({
          runId,
          steps,
          status,
          result: status === 'completed' ? { message: 'Check MongoDB for results' } : null,
        });
      }

      // No cached steps - if run exists, use it
      if (!runNotFound && run) {
        const status = await run.status;
        let result = null;
        if (status === 'completed') {
          result = await run.returnValue;
        }

        return NextResponse.json({
          runId,
          steps,
          status,
          result,
        });
      }

      // No run, no cache - workflow doesn't exist
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Non-streaming mode and run exists
    if (!run) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const status = await run.status;
    let result = null;
    if (status === 'completed') {
      result = await run.returnValue;
    }

    return NextResponse.json({
      status,
      result,
      runId,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Workflow not found',
      },
      { status: 404 }
    );
  }
}
