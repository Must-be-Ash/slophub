'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type WorkflowStatus = 'running' | 'completed' | 'failed' | 'error';

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
  const [result, setResult] = useState(initialData.result);
  const [error, setError] = useState(initialData.error);
  const router = useRouter();

  useEffect(() => {
    // Don't poll if already in terminal state
    if (status === 'completed' || status === 'failed' || status === 'error') {
      return;
    }

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/workflows/untitled-4/status?runId=${runId}`
        );

        if (!response.ok) {
          setStatus('error');
          setError('Failed to check workflow status');
          return;
        }

        const data = await response.json();
        setStatus(data.status);

        if (data.status === 'completed') {
          setResult(data.result);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setStatus('error');
        setError('Network error while checking status');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [runId, status]);

  // Render different UI based on status
  if (status === 'error' || status === 'failed') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
            Workflow Failed
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error || 'An error occurred while generating the blog post.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Generating Blog Post...</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Workflow is running
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              This may take a few minutes. The workflow includes:
            </p>

            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Scraping the website
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Searching for industry news
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Generating blog specification
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Creating the blog page
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'completed' && result) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-200">
            ✓ Blog Post Generated Successfully!
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <h3 className="text-xl font-bold mb-4">Generated Content</h3>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Generate Another Blog
          </button>
        </div>
      </div>
    );
  }

  return null;
}
