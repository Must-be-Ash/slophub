'use client';

import { useState } from 'react';

interface Step {
  stepId: string;
  stepLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp?: number;
  duration?: number;
  detail?: any;
  error?: string;
}

interface WorkflowStepTimelineProps {
  steps: Step[];
}

export function WorkflowStepTimeline({ steps }: WorkflowStepTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>No workflow steps to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Gradient timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-slate-200 to-slate-200 dark:from-blue-800 dark:via-slate-700 dark:to-slate-700" />

        {/* Step items */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.stepId} className="relative">
              {/* Status icon with pulsing animation for running state */}
              <div className={`
                absolute left-0 w-12 h-12 rounded-full flex items-center justify-center
                ${getStatusStyles(step.status).bg}
                ${step.status === 'running' ? 'animate-ping opacity-75' : ''}
              `}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${getStatusStyles(step.status).bg}
                  ${step.status === 'running' ? 'animate-spin' : ''}
                  shadow-lg
                `}>
                  {getStatusIcon(step.status)}
                </div>
              </div>

              {/* Step content */}
              <div className="ml-16">
                <button
                  onClick={() => setExpandedStep(
                    expandedStep === step.stepId ? null : step.stepId
                  )}
                  className="w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg p-2 -ml-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{step.stepLabel}</h3>
                      <p className={`text-sm ${getStatusStyles(step.status).text}`}>
                        {getStatusText(step.status)}
                      </p>
                    </div>
                    {step.duration && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {(step.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </button>

                {/* Expandable details */}
                {expandedStep === step.stepId && (
                  <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-3 transition-all">
                    {step.detail && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-foreground">Details</h4>
                        <pre className="text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto text-foreground">
                          {JSON.stringify(step.detail, null, 2)}
                        </pre>
                        <button
                          onClick={() => navigator.clipboard.writeText(
                            JSON.stringify(step.detail, null, 2)
                          )}
                          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          📋 Copy to clipboard
                        </button>
                      </div>
                    )}
                    {step.error && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3">
                        <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">Error</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 font-mono">{step.error}</p>
                      </div>
                    )}
                    {step.timestamp && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <span>Timestamp: {new Date(step.timestamp).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getStatusStyles(status: Step['status']) {
  const styles = {
    pending: { bg: 'bg-slate-300 dark:bg-slate-600', text: 'text-slate-600 dark:text-slate-400' },
    running: { bg: 'bg-blue-500 dark:bg-blue-600', text: 'text-blue-700 dark:text-blue-400' },
    success: { bg: 'bg-emerald-500 dark:bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-400' },
    error: { bg: 'bg-red-500 dark:bg-red-600', text: 'text-red-700 dark:text-red-400' },
  };
  return styles[status];
}

function getStatusIcon(status: Step['status']) {
  const icons = {
    pending: <span className="text-white text-sm">○</span>,
    running: <span className="text-white text-sm">↻</span>,
    success: <span className="text-white text-sm font-bold">✓</span>,
    error: <span className="text-white text-sm font-bold">✕</span>,
  };
  return icons[status];
}

function getStatusText(status: Step['status']) {
  const text = {
    pending: 'Waiting...',
    running: 'In progress...',
    success: 'Completed',
    error: 'Failed',
  };
  return text[status];
}
