import { MongoClient } from 'mongodb';

export async function logStepDataStep({
  runId,
  stepName,
  stepData,
}: {
  runId: string;
  stepName: string;
  stepData: any;
}) {
  'use step';

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MONGODB_URI is not configured - skipping step logging');
    return { success: false };
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();

    const database = client.db('blog-agent');
    const collection = database.collection('workflow_step_logs');

    // Create detailed log entry
    const logEntry = {
      runId,
      stepName,
      timestamp: new Date(),
      data: stepData,
      metadata: {
        dataSize: JSON.stringify(stepData).length,
        recordedAt: Date.now(),
      },
    };

    // Insert the log
    const result = await collection.insertOne(logEntry);

    console.log(`[Step Log] ${stepName} - Logged ${logEntry.metadata.dataSize} bytes to MongoDB`);

    return {
      success: true,
      logId: result.insertedId.toString(),
    };
  } catch (error) {
    console.error(`Failed to log step ${stepName}:`, error);
    // Don't throw - logging failures shouldn't break the workflow
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    await client.close();
  }
}
