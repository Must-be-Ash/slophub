import { redirect } from 'next/navigation';
import { MongoClient } from 'mongodb';

interface PageProps {
  params: {
    runId: string;
  };
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
  const { runId } = params;

  // Fetch landing page data from MongoDB
  const data = await getLandingPageData(runId);

  // If no data found or no standalone URL, show 404
  if (!data || !data.standaloneUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
          <p className="text-slate-600">Landing page not found</p>
          <a
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }

  // Redirect to the standalone URL
  // This is a temporary solution until Vercel microfrontends is fully configured
  redirect(data.standaloneUrl);
}
