import crypto from 'crypto';

import { sleep } from 'workflow';

export async function deployToVercelStep({
  files,
  projectName,
}: {
  files: { file: string; data: string }[];
  projectName: string;
}) {
  'use step';

  const apiKey = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!apiKey) {
    throw new Error('VERCEL_TOKEN is not configured');
  }

  // Step 1: Upload files to Vercel
  const uploadedFiles = [];

  for (const fileObj of files) {
    const fileContent = fileObj.data;
    const fileBuffer = Buffer.from(fileContent, 'utf-8');

    const uploadResponse = await fetch('https://api.vercel.com/v2/now/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream',
        'x-vercel-digest': createSHA(fileBuffer),
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload file ${fileObj.file}: ${uploadResponse.status} - ${errorText}`);
    }

    uploadedFiles.push({
      file: fileObj.file,
      sha: createSHA(fileBuffer),
      size: fileBuffer.length,
    });
  }

  // Step 2: Create deployment
  const apiEndpoint = teamId
    ? `https://api.vercel.com/v13/deployments?teamId=${teamId}`
    : 'https://api.vercel.com/v13/deployments';

  const deploymentResponse = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files: uploadedFiles,
      projectSettings: {
        framework: 'nextjs',
        buildCommand: null, // Pre-built
        outputDirectory: null,
        devCommand: null,
        installCommand: null,
      },
      target: 'production',
      public: true,
    }),
  });

  if (!deploymentResponse.ok) {
    const errorText = await deploymentResponse.text();
    throw new Error(`Failed to create deployment: ${deploymentResponse.status} - ${errorText}`);
  }

  const deployment = await deploymentResponse.json();

  // Wait for deployment to be ready (poll status)
  const deploymentUrl = deployment.url;
  let readyState = deployment.readyState;
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds max

  while (readyState !== 'READY' && attempts < maxAttempts) {
    await sleep('1s');

    const statusUrl = teamId
      ? `https://api.vercel.com/v13/deployments/${deployment.id}?teamId=${teamId}`
      : `https://api.vercel.com/v13/deployments/${deployment.id}`;

    const statusResponse = await fetch(statusUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      readyState = statusData.readyState;
    }

    attempts++;
  }

  return {
    url: `https://${deploymentUrl}`,
    deploymentId: deployment.id,
    projectName: projectName, // NEW - needed for microfrontend registration
    readyState,
  };
}

// Helper function to create SHA hash
function createSHA(buffer: Buffer): string {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}
