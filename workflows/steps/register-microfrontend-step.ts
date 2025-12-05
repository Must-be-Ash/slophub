import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface PathGroup {
  group?: string;
  flag?: string;
  paths: string[];
}

interface ChildApplication {
  packageName?: string;
  routing: PathGroup[];
  assetPrefix?: string;
  development?: {
    local?: number | string;
    task?: string;
    fallback?: string;
  };
}

interface DefaultApplication {
  packageName?: string;
  development: {
    local?: number | string;
    task?: string;
    fallback: string;
  };
}

interface MicrofrontendsConfig {
  $schema: string;
  version?: string;
  applications: {
    [projectName: string]: DefaultApplication | ChildApplication;
  };
  options?: {
    disableOverrides?: boolean;
    localProxyPort?: number;
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

    // Ensure blog-agent (default application) has correct structure
    if (!config.applications['blog-agent']) {
      config.applications['blog-agent'] = {
        development: {
          fallback: 'blog-agent-nine.vercel.app',
        },
      };
    }

    // Add child application (landing page) with routing
    config.applications[projectName] = {
      routing: [
        {
          paths: [route],
        },
      ],
    };

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
