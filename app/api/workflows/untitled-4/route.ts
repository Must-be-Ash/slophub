import { start } from 'workflow/api';
import { untitled4Workflow } from '@/workflows/untitled-4';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Increase timeout for workflow execution (max 300s on Hobby/Pro, 900s on Enterprise)
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    // 1. CONTENT-TYPE VALIDATION
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    const body = await request.json();
    const { url, campaignDescription, imageUrl, userId } = body;

    // 2. RATE LIMITING
    const identifier = getClientIdentifier(request, userId);
    const rateLimit = checkRateLimit(identifier, {
      maxRequests: 10,
      windowMs: 3600000, // 10 requests per hour
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${new Date(rateLimit.reset).toISOString()}`,
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 3. INPUT VALIDATION
    if (!url || typeof url !== 'string' || url.length < 5 || url.length > 500) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    if (!campaignDescription || typeof campaignDescription !== 'string' || campaignDescription.length < 20 || campaignDescription.length > 1000) {
      return NextResponse.json(
        { error: 'Invalid campaign description (must be 20-1000 characters)' },
        { status: 400 }
      );
    }

    if (imageUrl && (typeof imageUrl !== 'string' || imageUrl.length > 500)) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      );
    }

    // 4. SANITIZATION (XSS prevention)
    const sanitizedUrl = url.replace(/<[^>]*>/g, '').trim();
    const sanitizedDescription = campaignDescription.replace(/<[^>]*>/g, '').trim();

    if (!sanitizedUrl || !sanitizedDescription) {
      return NextResponse.json(
        { error: 'Invalid input after sanitization' },
        { status: 400 }
      );
    }

    // 5. URL FORMAT VALIDATION
    try {
      new URL(sanitizedUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 6. START WORKFLOW (with sanitized inputs)
    console.log('[API] Starting workflow for:', sanitizedUrl);
    const run = await start(untitled4Workflow, [{
      url: sanitizedUrl,
      campaignDescription: sanitizedDescription,
      imageUrl: imageUrl, // Optional, already validated
      userId: userId, // For tracking
    }]);

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

    // 7. RETURN SUCCESS WITH RATE LIMIT HEADERS
    return NextResponse.json(
      {
        success: true,
        runId: run.runId,
        message: 'Landing page generation started',
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      }
    );
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
