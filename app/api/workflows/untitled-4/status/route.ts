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

    // If streaming is requested or run not found, read step status from MongoDB
    if (stream || runNotFound) {
      console.log(`[Status API] Reading step status from MongoDB for ${runId}`);

      // Read step statuses from MongoDB (works across instances)
      const mongoUri = process.env.MONGODB_URI;
      let steps: any[] = [];

      if (mongoUri) {
        try {
          const { MongoClient } = await import('mongodb');
          const client = new MongoClient(mongoUri);
          await client.connect();

          const db = client.db('blog-agent');
          const collection = db.collection('workflow_step_status');

          // Get all step statuses for this run, sorted by timestamp
          steps = await collection
            .find({ runId })
            .sort({ timestamp: 1 })
            .toArray();

          await client.close();

          console.log(`[Status API] Found ${steps.length} step status records in MongoDB`);
        } catch (dbError) {
          console.error('[Status API] Failed to read from MongoDB:', dbError);
        }
      } else {
        console.warn('[Status API] MONGODB_URI not configured');
      }

      // If run not found, workflow might be initializing
      if (runNotFound) {
        console.log(`[Status API] Workflow not found in getRun(), assuming it's initializing`);
        return NextResponse.json({
          runId,
          steps,
          status: 'running',
          result: null,
        });
      }

      // Get workflow status
      if (run) {
        const status = await run.status;
        let result = null;
        if (status === 'completed') {
          result = await run.returnValue;
        }

        console.log(`[Status API] Workflow status: ${status}, steps: ${steps.length}`);

        return NextResponse.json({
          runId,
          steps,
          status,
          result,
        });
      }

      // No run object - truly not found
      console.error(`[Status API] Workflow ${runId} not found`);
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
