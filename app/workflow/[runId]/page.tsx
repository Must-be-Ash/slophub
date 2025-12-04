import { WorkflowStatusClient } from '@/components/workflow-status-client';

export default async function WorkflowPage({
  params
}: {
  params: Promise<{ runId: string }>
}) {
  // Unwrap params Promise
  const { runId } = await params;

  // Fetch initial status server-side
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  let initialData;
  try {
    const response = await fetch(
      `${baseUrl}/api/workflows/untitled-4/status?runId=${runId}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      initialData = { status: 'error', error: 'Workflow not found' };
    } else {
      initialData = await response.json();
    }
  } catch (error) {
    initialData = { status: 'error', error: 'Failed to fetch workflow status' };
  }

  return (
    <main className="min-h-screen p-8">
      <WorkflowStatusClient
        runId={runId}
        initialData={initialData}
      />
    </main>
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params
}: {
  params: Promise<{ runId: string }>
}) {
  const { runId } = await params;
  return {
    title: `Blog Generation - ${runId.slice(0, 8)}`,
    description: 'Generating your SEO-optimized blog post',
  };
}
