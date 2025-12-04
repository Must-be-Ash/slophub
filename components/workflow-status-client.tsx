'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WorkflowStepTimeline } from './workflow-step-timeline';
import { WorkflowProgressBar } from './workflow-progress-bar';

type WorkflowStatus = 'running' | 'completed' | 'failed' | 'error';

interface Step {
  stepId: string;
  stepLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp?: number;
  duration?: number;
  detail?: any;
  error?: string;
}

interface WorkflowStatusClientProps {
  runId: string;
  initialData: {
    status: WorkflowStatus;
    result?: any;
    error?: string;
  };
}

export function WorkflowStatusClient({
  runId,
  initialData
}: WorkflowStatusClientProps) {
  const [status, setStatus] = useState<WorkflowStatus>(initialData.status);
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState(initialData.result);
  const [error, setError] = useState(initialData.error);
  const router = useRouter();

  console.log('[WorkflowStatusClient] Mounted with:', { runId, initialStatus: initialData.status, currentStatus: status });

  useEffect(() => {
    console.log('[WorkflowStatusClient] useEffect running, status:', status);

    // Don't poll if already in terminal state
    if (status === 'completed' || status === 'failed' || status === 'error') {
      console.log('[WorkflowStatusClient] Status is terminal, not polling');
      return;
    }

    console.log('[WorkflowStatusClient] Starting polling interval');

    // Define the polling function
    const pollStatus = async () => {
      try {
        console.log('[WorkflowStatusClient] Polling for runId:', runId);
        const response = await fetch(
          `/api/workflows/untitled-4/status?runId=${runId}&stream=true`
        );

        if (!response.ok) {
          console.error('[WorkflowStatusClient] Poll failed with status:', response.status);
          setStatus('error');
          setError('Failed to check workflow status');
          return;
        }

        const data = await response.json();
        console.log('[WorkflowStatusClient] Polling response:', { status: data.status, stepsCount: data.steps?.length, steps: data.steps });
        setStatus(data.status);
        setSteps(data.steps || []);

        if (data.status === 'completed') {
          setResult(data.result);
        }
      } catch (err) {
        console.error('[WorkflowStatusClient] Polling error:', err);
        setStatus('error');
        setError('Network error while checking status');
      }
    };

    // Poll immediately on mount
    pollStatus();

    // Then poll every 1 second
    const interval = setInterval(pollStatus, 1000);

    return () => clearInterval(interval);
  }, [runId, status]);

  // Error state
  if (status === 'error' || status === 'failed') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
            Workflow Failed
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error || 'An error occurred while generating the blog post.'}
          </p>

          {/* Show step timeline even on failure for debugging */}
          {steps.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-red-900 dark:text-red-200">Workflow Steps</h3>
              <WorkflowStepTimeline steps={steps} />
            </div>
          )}

          <button
            onClick={() => router.push('/')}
            className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Running state with visual timeline
  if (status === 'running') {
    const completedSteps = steps.filter(s => s.status === 'success' || s.status === 'error').length;
    const currentStep = steps.find(s => s.status === 'running');

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header card with progress bar */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Generating Blog Post</h2>

          {steps.length > 0 ? (
            <WorkflowProgressBar
              total={steps.length}
              completed={completedSteps}
              currentStep={currentStep?.stepLabel}
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Initializing workflow...
              </span>
            </div>
          )}
        </div>

        {/* Timeline card */}
        {steps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-6">Workflow Steps</h3>
            <WorkflowStepTimeline steps={steps} />
          </div>
        )}
      </div>
    );
  }

  // Success state with completed timeline
  if (status === 'completed' && result) {
    const liveUrl = result.liveUrl;
    const hasLiveUrl = liveUrl && typeof liveUrl === 'string';

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mb-2">
            ✓ Blog Post Generated & Deployed Successfully!
          </h2>
          {steps.length > 0 && (
            <p className="text-emerald-700 dark:text-emerald-300">
              All steps completed in {calculateTotalDuration(steps)}s
            </p>
          )}
        </div>

        {/* Show completed timeline */}
        {steps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-6">Workflow Steps</h3>
            <WorkflowStepTimeline steps={steps} />
          </div>
        )}

        {/* Live URL Card */}
        {hasLiveUrl && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">🚀 Your Blog is Live!</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-mono text-sm flex-1"
                >
                  {liveUrl}
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(liveUrl)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Copy URL
                </button>
              </div>

              {/* iframe preview */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <iframe
                  src={liveUrl}
                  className="w-full h-[600px]"
                  title="Blog Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>

              <div className="flex gap-3">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Generate Another Blog
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fallback if no live URL */}
        {!hasLiveUrl && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Generated Content</h3>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto max-h-[600px]">
              {JSON.stringify(result, null, 2)}
            </pre>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Generate Another Blog
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function calculateTotalDuration(steps: Step[]): string {
  const total = steps.reduce((sum, step) => sum + (step.duration || 0), 0);
  return (total / 1000).toFixed(1);
}
