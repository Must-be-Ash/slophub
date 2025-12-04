import { getRun } from 'workflow/api';
import { NextResponse } from 'next/server';

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

    // Retrieve the workflow run by ID
    const run = getRun(runId);

    // If streaming is requested, return step updates from cache
    if (stream) {
      // Import the cache dynamically
      const { getStepUpdates } = await import('@/lib/workflow-cache');
      const steps = getStepUpdates(runId);

      const status = await run.status;
      let result = null;
      if (status === 'completed') {
        result = await run.returnValue;
      }

      console.log('[Status API] Returning cached steps for runId:', runId, 'count:', steps.length);

      return NextResponse.json({
        runId,
        steps,
        status,
        result,
      });
    }

    // Default behavior: return overall status
    const status = await run.status;
    let result = null;
    if (status === 'completed') {
      result = await run.returnValue;
    }

    return NextResponse.json({
      status,  // 'running' | 'completed' | 'failed'
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
