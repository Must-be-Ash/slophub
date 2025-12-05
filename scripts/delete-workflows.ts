/**
 * Script to delete specific workflow runs from MongoDB
 *
 * Usage: npx tsx scripts/delete-workflows.ts
 */

import { MongoClient } from 'mongodb';

const RUN_IDS_TO_DELETE = [
  'wrun_01KBNYHY44660785KK3A1TW23J',
  'wrun_01KBM8ZT7QAZ1QRB4VY1C3DT17',
];

async function deleteWorkflows() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('blog-agent');

    // Delete from workflows collection
    console.log('🗑️  Deleting workflows...');
    const workflowsCollection = db.collection('workflows');
    const workflowResult = await workflowsCollection.deleteMany({
      runId: { $in: RUN_IDS_TO_DELETE },
    });

    console.log(`   Deleted ${workflowResult.deletedCount} workflow(s) from 'workflows' collection`);

    // Delete from workflow_step_status collection
    console.log('\n🗑️  Deleting workflow step statuses...');
    const stepStatusCollection = db.collection('workflow_step_status');
    const stepStatusResult = await stepStatusCollection.deleteMany({
      runId: { $in: RUN_IDS_TO_DELETE },
    });

    console.log(`   Deleted ${stepStatusResult.deletedCount} step status record(s) from 'workflow_step_status' collection`);

    // Delete from workflow_step_logs collection (if any)
    console.log('\n🗑️  Deleting workflow step logs...');
    const stepLogsCollection = db.collection('workflow_step_logs');
    const stepLogsResult = await stepLogsCollection.deleteMany({
      runId: { $in: RUN_IDS_TO_DELETE },
    });

    console.log(`   Deleted ${stepLogsResult.deletedCount} step log(s) from 'workflow_step_logs' collection`);

    // Summary
    console.log('\n✅ Deletion complete!');
    console.log('\nSummary:');
    console.log(`   Workflows deleted: ${workflowResult.deletedCount}`);
    console.log(`   Step statuses deleted: ${stepStatusResult.deletedCount}`);
    console.log(`   Step logs deleted: ${stepLogsResult.deletedCount}`);
    console.log('\nDeleted run IDs:');
    RUN_IDS_TO_DELETE.forEach(id => console.log(`   - ${id}`));

  } catch (error) {
    console.error('\n❌ Error deleting workflows:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

deleteWorkflows();
