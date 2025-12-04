import { getRun } from 'workflow/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');

    if (!runId) {
      return NextResponse.json(
        { error: 'runId query parameter is required' },
        { status: 400 }
      );
    }

    // Retrieve the workflow run by ID
    const run = getRun(runId);

    // Get current status
    const status = await run.status;

    // If completed, get the result (non-blocking since already complete)
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
