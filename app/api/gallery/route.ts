import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('blog-agent');
    const collection = db.collection('workflows');

    // Get all workflows, sorted by most recent first
    const workflows = await collection
      .find({})
      .sort({ createdAt: -1 })
      .project({
        runId: 1,
        url: 1,
        industry: 1,
        campaignDescription: 1,
        liveUrl: 1,
        screenshotUrl: 1,
        createdAt: 1,
        brandAssets: 1,
        generatedImages: 1,
      })
      .toArray();

    await client.close();

    console.log(`[Gallery API] Returning ${workflows.length} workflows`);

    return NextResponse.json({
      workflows,
      total: workflows.length,
    });
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
