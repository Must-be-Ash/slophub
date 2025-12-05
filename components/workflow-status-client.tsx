'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { WorkflowStepTimeline } from './workflow-step-timeline';
import { WorkflowProgressBar } from './workflow-progress-bar';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ArrowRight, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (status === 'completed' || status === 'failed' || status === 'error') {
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(
          `/api/workflows/untitled-4/status?runId=${runId}&stream=true`
        );

        if (!response.ok) {
          setStatus('error');
          setError('Failed to check workflow status');
          return;
        }

        const data = await response.json();
        setStatus(data.status);
        setSteps(data.steps || []);

        if (data.status === 'completed') {
          setResult(data.result);
        }
      } catch (err) {
        setStatus('error');
        setError('Network error while checking status');
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, [runId, status]);

  // Error state
  if (status === 'error' || status === 'failed') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Generation Failed
              </h2>
              <p className="text-slate-500">
                {error || 'An error occurred while generating the landing page.'}
              </p>
            </div>
          </div>

          {steps.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-6">Workflow Steps</h3>
              <WorkflowStepTimeline steps={steps} />
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-5 py-3 bg-black text-white font-medium rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Try Again
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push('/gallery')}
              className="px-5 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
            >
              View Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Running state
  if (status === 'running') {
    const completedSteps = steps.filter(s => s.status === 'success' || s.status === 'error').length;
    const currentStep = steps.find(s => s.status === 'running');

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Creating Your Landing Page
            </h1>
            <p className="text-slate-500">
              This usually takes 1-2 minutes
            </p>
          </div>

          {steps.length > 0 ? (
            <WorkflowProgressBar
              total={steps.length}
              completed={completedSteps}
              currentStep={currentStep?.stepLabel}
            />
          ) : (
            <div className="flex items-center justify-center gap-3 py-4">
              <svg className="w-5 h-5 text-slate-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <TextShimmer
                duration={1.5}
                className="text-base [--base-color:theme(colors.slate.400)] [--base-gradient-color:theme(colors.slate.600)]"
              >
                Initializing workflow...
              </TextShimmer>
            </div>
          )}
        </div>

        {/* Timeline card */}
        {steps.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-8">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-6">Workflow Steps</h3>
            <WorkflowStepTimeline steps={steps} />
          </div>
        )}
      </div>
    );
  }

  // Success state
  if (status === 'completed' && result) {
    const liveUrl = result.liveUrl;
    const standaloneUrl = result.standaloneUrl;
    const microfrontendPath = result.microfrontendPath;
    const screenshotUrl = result.screenshotUrl;
    const hasLiveUrl = liveUrl && typeof liveUrl === 'string';

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Success header */}
        <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-8">
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="h-7 w-7 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Landing Page Created Successfully
            </h1>
            {steps.length > 0 && (
              <p className="text-slate-500">
                Completed in {calculateTotalDuration(steps)}s
              </p>
            )}
          </div>
        </div>

        {/* Timeline (collapsed by default) */}
        {steps.length > 0 && (
          <details className="bg-white rounded-2xl shadow-sm shadow-black/5 group">
            <summary className="px-8 py-5 cursor-pointer list-none flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Workflow Steps</span>
              <span className="text-sm text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-8 pb-8">
              <WorkflowStepTimeline steps={steps} />
            </div>
          </details>
        )}

        {/* Live URL Card */}
        {hasLiveUrl && (
          <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Your landing page is live</h3>

            {/* Microfrontend URL (primary) */}
            {microfrontendPath && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Microfrontend URL</p>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-2">
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-mono text-sm flex-1 truncate transition-colors font-semibold"
                  >
                    {liveUrl}
                  </a>
                  <button
                    onClick={() => handleCopy(liveUrl)}
                    className="p-2 hover:bg-emerald-100 rounded-lg transition-colors flex-shrink-0"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-emerald-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Composed under parent application at: <code className="bg-slate-100 px-1 py-0.5 rounded">{microfrontendPath}</code>
                </p>
              </div>
            )}

            {/* Standalone URL (fallback) */}
            {standaloneUrl && (
              <details className="mb-6">
                <summary className="text-xs text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 mb-2">
                  Standalone URL (Fallback)
                </summary>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <a
                    href={standaloneUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 font-mono text-sm flex-1 truncate transition-colors"
                  >
                    {standaloneUrl}
                  </a>
                  <button
                    onClick={() => handleCopy(standaloneUrl)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                    title="Copy URL"
                  >
                    <Copy className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </details>
            )}

            {/* If no microfrontend, show single URL prominently */}
            {!microfrontendPath && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-6">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 font-mono text-sm flex-1 truncate transition-colors"
                >
                  {liveUrl}
                </a>
                <button
                  onClick={() => handleCopy(liveUrl)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            )}

            {/* Live Preview (iframe primary, screenshot as optional view) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <div className="bg-slate-100 px-4 py-2 flex items-center gap-2 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-400 font-mono truncate">
                    {liveUrl}
                  </div>
                </div>
                {screenshotUrl && (
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    View Screenshot
                  </a>
                )}
              </div>
              <div className="relative bg-white">
                <iframe
                  src={liveUrl}
                  className="w-full h-[700px] border-0"
                  title="Landing Page Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Live interactive preview
                </p>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
                >
                  Open in new tab
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-5 bg-black text-white font-medium rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Open Landing Page
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => router.push('/gallery')}
                className="py-3 px-5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                View Gallery
              </button>
              <button
                onClick={() => router.push('/')}
                className="py-3 px-5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {/* Fallback if no live URL */}
        {!hasLiveUrl && (
          <div className="bg-white rounded-2xl shadow-sm shadow-black/5 p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Generated Content</h3>
            <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto max-h-[500px] text-slate-700 font-mono">
              {JSON.stringify(result, null, 2)}
            </pre>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="py-3 px-5 bg-black text-white font-medium rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Generate Another
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push('/gallery')}
                className="py-3 px-5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                View Gallery
              </button>
            </div>
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
