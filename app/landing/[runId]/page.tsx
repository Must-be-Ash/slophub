import { MongoClient } from 'mongodb';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FloatingCTA } from '@/components/floating-cta';

interface PageProps {
  params: Promise<{
    runId: string;
  }>;
}

async function getLandingPageData(runId: string) {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    return null;
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('blog-agent');
    const collection = db.collection('workflows');

    const workflow = await collection.findOne({ runId });

    await client.close();

    return workflow;
  } catch (error) {
    console.error('Failed to fetch landing page data:', error);
    return null;
  }
}

async function checkWorkflowInProgress(runId: string): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    return false;
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('blog-agent');
    const stepStatusCollection = db.collection('workflow_step_status');

    // Check if any step records exist for this runId
    const stepCount = await stepStatusCollection.countDocuments({ runId });

    await client.close();

    // If steps exist, workflow was started
    return stepCount > 0;
  } catch (error) {
    console.error('Failed to check workflow status:', error);
    return false;
  }
}

export default async function LandingPage({ params }: PageProps) {
  const { runId } = await params;

  console.log('[Landing Page] Requested runId:', runId);

  // Fetch landing page data from MongoDB
  const data = await getLandingPageData(runId);

  console.log('[Landing Page] Data found:', !!data);
  console.log('[Landing Page] Has HTML:', !!data?.landingPageHtml);
  console.log('[Landing Page] HTML length:', data?.landingPageHtml?.length || 0);

  // If we have the rendered HTML, display it
  if (data && data.landingPageHtml) {
    // Extract just the body content to avoid nested HTML tags
    const bodyMatch = data.landingPageHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : data.landingPageHtml;

    // Extract styles from head
    const styleMatch = data.landingPageHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    const styles = styleMatch ? styleMatch.join('\n') : '';

    return (
      <>
        {styles && (
          <div dangerouslySetInnerHTML={{ __html: styles }} />
        )}
        <div
          dangerouslySetInnerHTML={{ __html: bodyContent }}
          suppressHydrationWarning
        />
        <FloatingCTA />
      </>
    );
  }

  // If no data, check if workflow is in progress
  const isInProgress = await checkWorkflowInProgress(runId);

  if (isInProgress) {
    // Show loading state - workflow is generating the page
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

        {/* Simple header without auth */}
        <header className="relative py-4 px-6 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/logo-ts.svg"
                alt="Slophub"
                width={50}
                height={50}
                className="object-contain"
              />
              <span
                className="text-lg font-semibold text-slate-900 group-hover:text-slate-600 transition-colors"
                style={{ fontFamily: 'var(--font-caprasimo)' }}
              >
                Slophub
              </span>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm shadow-black/5 p-12 text-center">
            {/* Animated spinner */}
            <div className="flex justify-center mb-6">
              <svg
                className="w-16 h-16 text-slate-400 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Your Landing Page is Being Generated
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 mb-6">
              We're creating your custom landing page right now. This typically takes 3-4 minutes.
            </p>

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full animate-pulse"
                  style={{ width: '60%' }}
                />
              </div>
            </div>

            {/* Additional info */}
            <p className="text-sm text-slate-500 mb-8">
              You can monitor the progress in real-time on the{' '}
              <Link
                href={`/workflow/${runId}`}
                className="text-slate-900 font-medium hover:underline"
              >
                workflow status page
              </Link>
              .
            </p>

            {/* Action button */}
            <Link
              href={`/workflow/${runId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              View Progress
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // No data and no workflow in progress - show 404
  console.log('[Landing Page] No data and no workflow in progress - returning 404');
  notFound();
}
