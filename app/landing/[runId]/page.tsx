import { MongoClient } from 'mongodb';
import { notFound } from 'next/navigation';

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

export default async function LandingPage({ params }: PageProps) {
  const { runId } = await params;

  console.log('[Landing Page] Requested runId:', runId);

  // Fetch landing page data from MongoDB
  const data = await getLandingPageData(runId);

  console.log('[Landing Page] Data found:', !!data);
  console.log('[Landing Page] Has HTML:', !!data?.landingPageHtml);
  console.log('[Landing Page] HTML length:', data?.landingPageHtml?.length || 0);

  // If no data found, show 404
  if (!data) {
    console.log('[Landing Page] No data - returning 404');
    notFound();
  }

  // If we have the rendered HTML, display it
  if (data.landingPageHtml) {
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
      </>
    );
  }

  // Fallback if no HTML is available
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Landing Page Not Ready
        </h1>
        <p className="text-slate-600 mb-8">
          This landing page is still being generated. Please check back in a moment.
        </p>
      </div>
    </div>
  );
}
