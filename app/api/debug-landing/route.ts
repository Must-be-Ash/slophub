import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const runId = searchParams.get('runId');

  if (!runId) {
    return NextResponse.json({ error: 'runId parameter required' }, { status: 400 });
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    return NextResponse.json({ error: 'MONGODB_URI not configured' }, { status: 500 });
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db('blog-agent');
    const collection = db.collection('workflows');

    const doc = await collection.findOne({ runId });

    await client.close();

    if (!doc) {
      return NextResponse.json({ error: 'Document not found', runId }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      runId: doc.runId,
      fields: Object.keys(doc),
      hasLandingPageHtml: !!doc.landingPageHtml,
      landingPageHtmlLength: doc.landingPageHtml?.length || 0,
      landingPageHtmlPreview: doc.landingPageHtml?.substring(0, 500),
      liveUrl: doc.liveUrl,
      createdAt: doc.createdAt,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
