import { MongoClient } from 'mongodb';

async function checkWorkflowLogs(runId: string) {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MONGODB_URI is not configured');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const database = client.db('blog-agent');
    const collection = database.collection('workflow_step_logs');

    // Get all logs for this runId
    const logs = await collection
      .find({ runId })
      .sort({ timestamp: 1 })
      .toArray();

    if (logs.length === 0) {
      console.log(`❌ No logs found for runId: ${runId}`);
      return;
    }

    console.log(`📊 Found ${logs.length} step logs for runId: ${runId}\n`);
    console.log('=' .repeat(80));

    for (const log of logs) {
      console.log(`\n🔹 STEP: ${log.stepName}`);
      console.log(`📅 Timestamp: ${log.timestamp}`);
      console.log(`📦 Data Size: ${log.metadata?.dataSize || 0} bytes`);
      console.log('-'.repeat(80));

      // Print relevant data based on step
      if (log.stepName === 'scrape') {
        console.log('\n📌 SCRAPING DATA:');
        console.log(`URL: ${log.data.url}`);
        console.log('\n🎨 BRAND ASSETS:');
        console.log(`  Title: ${log.data.metadata?.title}`);
        console.log(`  Description: ${log.data.metadata?.description}`);
        console.log(`  Industry: ${log.data.metadata?.industry}`);
        console.log(`  OG Image: ${log.data.metadata?.ogImage || 'None'}`);
        console.log(`  Favicon: ${log.data.metadata?.favicon || 'None'}`);
        console.log(`  Keywords: ${log.data.metadata?.keywords || 'None'}`);
        console.log(`\n🖼️  Uploaded Assets: ${log.data.uploadedAssets?.length || 0}`);
        if (log.data.uploadedAssets && log.data.uploadedAssets.length > 0) {
          log.data.uploadedAssets.forEach((asset: any) => {
            console.log(`    - ${asset.name}: ${asset.blobUrl}`);
          });
        }
        console.log(`\n📝 Markdown Content Length: ${log.data.markdown?.length || 0} characters`);
        console.log(`📄 HTML Content Length: ${log.data.html?.length || 0} characters`);
      }

      if (log.stepName === 'search') {
        console.log('\n📌 SEARCH DATA:');
        console.log(`Query: ${log.data.query}`);
        console.log(`Search Focus: ${log.data.searchFocus}`);
        console.log(`Model: ${log.data.model}`);
        console.log(`\n📰 Results Length: ${log.data.results?.length || 0} characters`);
        console.log(`🔗 Citations: ${log.data.citations?.length || 0}`);
        if (log.data.citations && log.data.citations.length > 0) {
          console.log('\nCitation sources:');
          log.data.citations.slice(0, 5).forEach((citation: string, i: number) => {
            console.log(`  ${i + 1}. ${citation}`);
          });
        }
      }

      if (log.stepName === 'generate') {
        console.log('\n📌 BLOG SPEC GENERATION:');
        console.log(`Model: ${log.data.model}`);
        console.log(`Format: ${log.data.format}`);
        console.log(`\n📝 Prompt Length: ${log.data.prompt?.length || 0} characters`);
        console.log(`📄 Generated Spec Length: ${log.data.generatedSpec?.length || 0} characters`);
        console.log('\n--- PROMPT PREVIEW (first 500 chars) ---');
        console.log(log.data.prompt?.slice(0, 500) + '...');
        console.log('\n--- GENERATED SPEC PREVIEW (first 500 chars) ---');
        console.log(log.data.generatedSpec?.slice(0, 500) + '...');
      }

      if (log.stepName === 'create') {
        console.log('\n📌 V0 BLOG PAGE GENERATION:');
        console.log(`Model: ${log.data.model}`);
        console.log(`\n🎨 Brand Assets Used:`);
        console.log(`  OG Image: ${log.data.brandAssets?.ogImage || 'None'}`);
        console.log(`  Favicon: ${log.data.brandAssets?.favicon || 'None'}`);
        console.log(`  Title: ${log.data.brandAssets?.title || 'None'}`);
        console.log(`  Industry: ${log.data.brandAssets?.industry || 'None'}`);
        console.log(`\n📝 Prompt Length: ${log.data.prompt?.length || 0} characters`);
        console.log(`📄 Generated Blog Page Length: ${log.data.generatedBlogPage?.length || 0} characters`);
        console.log('\n--- PROMPT PREVIEW (first 500 chars) ---');
        console.log(log.data.prompt?.slice(0, 500) + '...');
        console.log('\n--- GENERATED PAGE PREVIEW (first 500 chars) ---');
        console.log(log.data.generatedBlogPage?.slice(0, 500) + '...');
      }

      if (log.stepName === 'deploy') {
        console.log('\n📌 VERCEL DEPLOYMENT:');
        console.log(`Project Name: ${log.data.projectName}`);
        console.log(`Deployment URL: ${log.data.deploymentUrl}`);
        console.log(`Deployment ID: ${log.data.deploymentId}`);
        console.log(`\n📦 Files Deployed: ${log.data.files?.length || 0}`);
        if (log.data.files && log.data.files.length > 0) {
          log.data.files.forEach((file: any) => {
            console.log(`    - ${file.file} (${file.size} bytes)`);
          });
        }
      }

      console.log('\n' + '='.repeat(80));
    }

    console.log('\n✅ Analysis Complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Get runId from command line argument
const runId = process.argv[2] || 'wrun_01KBM5TFP5QWYR5QVN7QV7RMDT';
console.log(`🔍 Checking workflow logs for runId: ${runId}\n`);

checkWorkflowLogs(runId);
