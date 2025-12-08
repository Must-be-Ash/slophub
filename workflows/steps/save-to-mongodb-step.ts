import { MongoClient } from 'mongodb';

export async function saveToMongoDBStep({
  workflowData,
}: {
  workflowData: {
    runId: string;
    url: string;
    industry: string;
    brandAssets: any;
    branding?: any;
    campaignDescription: string;
    landingPageSpec: string;
    landingPageHtml?: string; // Rendered HTML for the landing page
    referenceImageUrl?: string;
    generatedImages?: Array<{
      name: string;
      blobUrl: string;
    }>;
    liveUrl?: string;
    standaloneUrl?: string; // Standalone deployment URL (deprecated)
    microfrontendPath?: string; // Microfrontend path (deprecated)
    deploymentId?: string; // Deployment ID (deprecated)
    screenshotUrl?: string;
    createdAt: number;
  };
}) {
  'use step';

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();

    const database = client.db('blog-agent');
    const collection = database.collection('workflows');

    // Upsert the workflow data (insert if new, update if exists)
    // This allows us to update the screenshotUrl after initial save
    const result = await collection.updateOne(
      { runId: workflowData.runId },
      { $set: workflowData },
      { upsert: true }
    );

    return {
      success: true,
      upsertedId: result.upsertedId?.toString(),
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  } catch (error) {
    console.error('MongoDB save error:', error);
    throw error;
  } finally {
    await client.close();
  }
}
