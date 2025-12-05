import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function commitAndPushStep({
  runId,
  route,
}: {
  runId: string;
  route: string;
}): Promise<{ success: boolean; commitHash?: string }> {
  'use step';

  try {
    // Add microfrontends.json to staging
    await execAsync('git add microfrontends.json');

    // Create commit with descriptive message
    const commitMessage = `Add microfrontend route: ${route} (runId: ${runId})`;
    const { stdout: commitOutput } = await execAsync(
      `git commit -m "${commitMessage}"`
    );

    // Extract commit hash
    const commitHashMatch = commitOutput.match(/\[.+?\s+([a-f0-9]+)\]/);
    const commitHash = commitHashMatch ? commitHashMatch[1] : undefined;

    // Push to origin (triggers Vercel deployment)
    await execAsync('git push origin main');

    return {
      success: true,
      commitHash,
    };
  } catch (error) {
    console.error('Git commit/push failed:', error);

    // Check if error is because there are no changes
    if (error instanceof Error && error.message.includes('nothing to commit')) {
      return {
        success: true,
        commitHash: undefined,
      };
    }

    return {
      success: false,
    };
  }
}
