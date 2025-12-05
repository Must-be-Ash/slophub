import { WorkflowStatusClient } from '@/components/workflow-status-client';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function WorkflowPage({
  params
}: {
  params: Promise<{ runId: string }>
}) {
  // Unwrap params Promise
  const { runId } = await params;

  // Determine base URL for server-side fetch
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_URL ||
                  (process.env.VERCEL_URL ? `${protocol}://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  console.log('[Workflow Page] Base URL:', baseUrl, 'RunID:', runId);

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
    console.error('[Workflow Page] Failed to fetch initial status:', error);
    // Don't fail on initial fetch - let client polling handle it
    initialData = { status: 'running', error: undefined };
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Subtle grid pattern background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.03) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Header */}
      <header className="relative py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">
              Landing Page Generator
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 px-6 pb-12 relative">
        <WorkflowStatusClient
          runId={runId}
          initialData={initialData}
        />
      </div>
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
    title: `Landing Page Generation - ${runId.slice(0, 8)}`,
    description: 'Creating your conversion-focused landing page',
  };
}
