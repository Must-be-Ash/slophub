'use client';

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Progress</h3>
          {currentStep && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Currently: {currentStep}
            </p>
          )}
        </div>
        <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
      </div>

      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{completed} of {total} steps completed</span>
        {percentage < 100 && percentage > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live updating</span>
          </div>
        )}
      </div>
    </div>
  );
}
