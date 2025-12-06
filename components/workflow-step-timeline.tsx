'use client';

import { useState } from 'react';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Check, X, Circle } from 'lucide-react';

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
      <div className="text-center py-8 text-slate-400">
        <p>No workflow steps to display</p>
      </div>
    );
  }

  return (
      <div className="relative">
      {/* Single continuous connector line behind all icons */}
      {steps.length > 1 && (
        <div 
          className="absolute left-[31px] top-[52px] w-[2px] bg-slate-200 -z-0"
          style={{ height: `calc(100% - 88px)` }}
        />
      )}

      <div className="space-y-1 relative z-10">
          {steps.map((step, index) => (
          <div key={step.stepId}>
            {/* Step row */}
                <button
                  onClick={() => setExpandedStep(
                    expandedStep === step.stepId ? null : step.stepId
                  )}
              className="w-full text-left flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
              {/* Status icon */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${getStatusBg(step.status)}
              `}>
              {step.status === 'running' ? (
                <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : step.status === 'success' ? (
                <Check className="w-5 h-5 text-white" />
              ) : step.status === 'error' ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400" />
              )}
                    </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-medium text-slate-900">{step.stepLabel}</h3>
                    {step.duration && (
                  <span className="text-xs text-slate-400 tabular-nums flex-shrink-0">
                        {(step.duration / 1000).toFixed(1)}s
                      </span>
                )}
              </div>
              {step.status === 'running' ? (
                <TextShimmer
                  duration={1.5}
                  className="text-sm [--base-color:theme(colors.slate.400)] [--base-gradient-color:theme(colors.slate.600)]"
                >
                  Processing...
                </TextShimmer>
              ) : (
                <p className={`text-sm ${getStatusText(step.status)}`}>
                  {getStatusLabel(step.status)}
                </p>
                    )}
                  </div>
                </button>

                {/* Expandable details */}
            {expandedStep === step.stepId && (step.detail || step.error) && (
              <div className="ml-14 mr-3 mb-3 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                    {step.detail && (
                      <div>
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Details</h4>
                    <pre className="text-xs bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto text-slate-700 font-mono">
                          {JSON.stringify(step.detail, null, 2)}
                        </pre>
                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(JSON.stringify(step.detail, null, 2));
                      }}
                      className="mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                      Copy to clipboard
                        </button>
                      </div>
                    )}
                    {step.error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                    <h4 className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Error</h4>
                    <p className="text-sm text-red-700 font-mono">{step.error}</p>
                  </div>
                )}
              </div>
            )}
            </div>
          ))}
      </div>
    </div>
  );
}

function getStatusBg(status: Step['status']) {
  const styles = {
    pending: 'bg-slate-100',
    running: 'bg-black',
    success: 'bg-emerald-500',
    error: 'bg-red-500',
  };
  return styles[status];
}

function getStatusText(status: Step['status']) {
  const styles = {
    pending: 'text-slate-400',
    running: 'text-slate-600',
    success: 'text-emerald-600',
    error: 'text-red-600',
  };
  return styles[status];
}

function getStatusLabel(status: Step['status']) {
  const labels = {
    pending: 'Waiting',
    running: 'Processing...',
    success: 'Complete',
    error: 'Failed',
  };
  return labels[status];
}
