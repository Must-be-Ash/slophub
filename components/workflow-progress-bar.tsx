'use client';

import { TextShimmer } from '@/components/ui/text-shimmer';

interface WorkflowProgressBarProps {
  total: number;
  completed: number;
  currentStep?: string;
}

export function WorkflowProgressBar({
  total,
  completed,
  currentStep
}: WorkflowProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentStep && (
            <>
              <svg className="w-4 h-4 text-slate-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <TextShimmer
                duration={1.5}
                className="text-sm [--base-color:theme(colors.slate.400)] [--base-gradient-color:theme(colors.slate.700)]"
              >
                {currentStep}
              </TextShimmer>
            </>
          )}
        </div>
        <span className="text-2xl font-semibold text-slate-900 tabular-nums">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-black rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step count */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{completed} of {total} steps</span>
        {percentage < 100 && percentage > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>
        )}
      </div>
    </div>
  );
}
