import { MongoClient } from 'mongodb';

async function checkData() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('blog-agent');
    const collection = db.collection('workflows');

    const doc = await collection.findOne({
      runId: 'wrun_01KBPNM0NGJ38YQ8ZKR4K02824'
    });

    if (!doc) {
      console.log('❌ Document not found in MongoDB');
      return;
    }

    console.log('✅ Document found!');
    console.log('\nFields present:', Object.keys(doc).join(', '));
    console.log('\nHas landingPageHtml:', !!doc.landingPageHtml);

    if (doc.landingPageHtml) {
      console.log('landingPageHtml length:', doc.landingPageHtml.length);
      console.log('\nFirst 300 chars of HTML:');
      console.log(doc.landingPageHtml.substring(0, 300));
    } else {
      console.log('\n⚠️  landingPageHtml field is missing or empty!');
    }

    console.log('\nOther relevant fields:');
    console.log('- liveUrl:', doc.liveUrl);
    console.log('- standaloneUrl:', doc.standaloneUrl);
    console.log('- runId:', doc.runId);
  } finally {
    await client.close();
  }
}

checkData().catch(console.error);
