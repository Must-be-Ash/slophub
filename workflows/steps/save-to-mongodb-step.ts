export async function saveToMongoDBStep({
  workflowData,
}: {
  workflowData: {
    runId: string;
    url: string;
    industry: string;
    brandAssets: any;
    blogSpec: string;
    liveUrl?: string;
    deploymentId?: string;
    createdAt: number;
  };
}) {
  'use step';

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  // Use MongoDB native driver
  const { MongoClient } = require('mongodb');

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();

    const database = client.db('blog-agent');
    const collection = database.collection('workflows');

    // Insert the workflow data
    const result = await collection.insertOne(workflowData);

    return {
      insertedId: result.insertedId.toString(),
      success: true,
    };
  } catch (error) {
    console.error('MongoDB save error:', error);
    throw error;
  } finally {
    await client.close();
  }
}
