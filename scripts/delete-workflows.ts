/**
 * Script to delete specific workflow runs from MongoDB
 *
 * Usage: npx tsx scripts/delete-workflows.ts
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const RUN_IDS_TO_DELETE = [
  'wrun_01KBPNJS8TBTH5NVS83B8FKXEY',
  'wrun_01KBPNMZTNYF000HN6VR0H114M',
  'wrun_01KBPNM0NGJ38YQ8ZKR4K02824',
  'wrun_01KBPAT39AGATYBDJVVEBP8Y2G',
  'wrun_01KBP9Q8YCKHXD7W77BYCH33X9',
  'wrun_01KBP6X0GJZXJYY0XVS13TPRMT',
  'wrun_01KBP2R1C18CX78ZZJVYSQQ2JT',
  'wrun_01KBP1HVCS9FWNA2BH6THFFJPG',
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
