import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface MicrofrontendsConfig {
  $schema: string;
  applications: {
    [key: string]: {
      paths: {
        [path: string]: string;
      };
    };
  };
}

export async function registerMicrofrontendStep({
  runId,
  projectName,
}: {
  runId: string;
  projectName: string;
}): Promise<{ path: string; registered: boolean }> {
  'use step';

  const configPath = join(process.cwd(), 'microfrontends.json');
  const route = `/landing-${runId}`;

  try {
    // Read existing config
    const configContent = await readFile(configPath, 'utf-8');
    const config: MicrofrontendsConfig = JSON.parse(configContent);

    // Ensure blog-agent application exists
    if (!config.applications['blog-agent']) {
      config.applications['blog-agent'] = { paths: {} };
    }

    // Add new route
    config.applications['blog-agent'].paths[route] = projectName;

    // Write updated config
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    return {
      path: route,
      registered: true,
    };
  } catch (error) {
    console.error('Failed to register microfrontend:', error);
    throw new Error(
      `Failed to register microfrontend: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
