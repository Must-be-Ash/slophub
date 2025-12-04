// Simple in-memory cache for workflow step updates
// This allows us to store step progress without blocking on stream reads

interface StepUpdate {
  stepId: string;
  stepLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
  detail?: any;
  error?: string;
  duration?: number;
}

const workflowStepsCache = new Map<string, StepUpdate[]>();

export function addStepUpdate(runId: string, step: StepUpdate) {
  if (!workflowStepsCache.has(runId)) {
    workflowStepsCache.set(runId, []);
  }

  const steps = workflowStepsCache.get(runId)!;

  // Find if this step already exists and update it, or add new
  const existingIndex = steps.findIndex(s =>
    s.stepId === step.stepId && s.status !== step.status
  );

  if (existingIndex >= 0 && step.status !== 'pending') {
    // Update existing step (e.g., pending -> running -> success)
    steps[existingIndex] = step;
  } else {
    // Add new step
    steps.push(step);
  }
}

export function getStepUpdates(runId: string): StepUpdate[] {
  return workflowStepsCache.get(runId) || [];
}

export function clearStepUpdates(runId: string) {
  workflowStepsCache.delete(runId);
}

// Clear old entries after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  for (const [runId, steps] of workflowStepsCache.entries()) {
    const latestTimestamp = Math.max(...steps.map(s => s.timestamp));
    if (latestTimestamp < oneHourAgo) {
      workflowStepsCache.delete(runId);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes
