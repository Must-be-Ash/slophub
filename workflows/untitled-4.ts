/**
 * Generated Workflow: Untitled 4
 *
 * This file was automatically generated from a workflow definition.
 * DO NOT EDIT MANUALLY - regenerate from the workflow editor instead.
 *
 * MODIFIED: Updated to accept input parameter, pass data between steps,
 * and stream progress updates for real-time monitoring
 */

import { getWritable, getWorkflowMetadata } from 'workflow';
import { firecrawlScrapeStep } from './steps/scrape-step';
import { perplexitySearchStep } from './steps/search-step';
import { generateTextStep } from './steps/generate-text-step';
import { createChatStep } from './steps/create-chat-step';
import { deployToVercelStep } from './steps/deploy-to-vercel-step';
import { uploadAssetsStep } from './steps/upload-assets-step';
import { saveToMongoDBStep } from './steps/save-to-mongodb-step';
import { logStepDataStep } from './steps/log-step-data';
import { addStepUpdate } from '../lib/workflow-cache';

// Step update interface for streaming progress
interface StepUpdate {
  stepId: string;
  stepLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: number;
  detail?: any;
  error?: string;
  duration?: number;
}

// Workflow steps definition
const WORKFLOW_STEPS = [
  { id: 'scrape', label: 'Scrape Website & Upload Assets' },
  { id: 'search', label: 'Search Industry News' },
  { id: 'generate', label: 'Generate Blog Spec' },
  { id: 'create', label: 'Create Blog Page' },
  { id: 'deploy', label: 'Deploy to Vercel' },
];

// Step function to initialize all steps as pending
async function initializeStepsStep(
  writable: WritableStream<StepUpdate>,
  runId: string
) {
  "use step";

  const writer = writable.getWriter();

  for (const step of WORKFLOW_STEPS) {
    const update: StepUpdate = {
      stepId: step.id,
      stepLabel: step.label,
      status: 'pending',
      timestamp: Date.now(),
    };

    // Write to both stream and cache
    await writer.write(update);
    addStepUpdate(runId, update);
  }

  writer.releaseLock();
}

// Step function to update step status
async function updateStepStatusStep(
  writable: WritableStream<StepUpdate>,
  runId: string,
  stepId: string,
  status: StepUpdate['status'],
  extras?: Partial<StepUpdate>
) {
  "use step";

  const writer = writable.getWriter();
  const step = WORKFLOW_STEPS.find(s => s.id === stepId);

  const update: StepUpdate = {
    stepId,
    stepLabel: step?.label || stepId,
    status,
    timestamp: Date.now(),
    ...extras,
  };

  // Write to both stream and cache
  await writer.write(update);
  addStepUpdate(runId, update);

  writer.releaseLock();
}

// Step function to close the stream
async function closeStreamStep(writable: WritableStream<StepUpdate>) {
  "use step";

  await writable.close();
}

export async function untitled4Workflow(input: { url: string }) {
  "use workflow";

  // Get workflow metadata to access runId
  const metadata = getWorkflowMetadata();
  const runId = metadata.workflowRunId;

  // Get writable stream for progress updates
  const writable = getWritable<StepUpdate>();

  // Initialize all steps as pending
  await initializeStepsStep(writable, runId);

  // Step 1: Scrape Site & Upload Assets
  await updateStepStatusStep(writable, runId, 'scrape', 'running');
  let scrapeResult;
  let uploadedAssets: { name: string; blobUrl: string }[] = [];
  try {
    const startTime = Date.now();
    scrapeResult = await firecrawlScrapeStep({
      url: input.url,
    });

    // Upload brand assets to Vercel Blob
    const assetsToUpload = [];

    if (scrapeResult.metadata.ogImage) {
      assetsToUpload.push({ name: 'og-image', url: scrapeResult.metadata.ogImage });
    }

    if (scrapeResult.metadata.favicon) {
      assetsToUpload.push({ name: 'favicon', url: scrapeResult.metadata.favicon });
    }

    // Upload assets if we have any
    if (assetsToUpload.length > 0) {
      const uploadResult = await uploadAssetsStep({ assets: assetsToUpload });
      uploadedAssets = uploadResult.assets;
    }

    await updateStepStatusStep(writable, runId, 'scrape', 'success', {
      detail: {
        industry: scrapeResult.metadata.industry,
        title: scrapeResult.metadata.title,
        assetsUploaded: uploadedAssets.length,
      },
      duration: Date.now() - startTime,
    });

    // Log complete scraping data to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'scrape',
      stepData: {
        url: input.url,
        metadata: scrapeResult.metadata,
        markdown: scrapeResult.markdown,
        html: scrapeResult.html,
        branding: scrapeResult.branding, // Comprehensive Firecrawl branding data
        uploadedAssets,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    await updateStepStatusStep(writable, runId, 'scrape', 'error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  // Step 2: Search News
  await updateStepStatusStep(writable, runId, 'search', 'running');
  let searchResult;
  try {
    const startTime = Date.now();
    searchResult = await perplexitySearchStep({
      query: `Industry news related to ${scrapeResult.metadata.industry}`,
      searchFocus: "internet",
    });
    await updateStepStatusStep(writable, runId, 'search', 'success', {
      detail: {
        citationCount: searchResult.citations?.length || 0,
      },
      duration: Date.now() - startTime,
    });

    // Log complete search data to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'search',
      stepData: {
        query: `Industry news related to ${scrapeResult.metadata.industry}`,
        searchFocus: "internet",
        results: searchResult.results,
        citations: searchResult.citations,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    await updateStepStatusStep(writable, runId, 'search', 'error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  // Step 3: Write Spec
  await updateStepStatusStep(writable, runId, 'generate', 'running');
  let specResult;
  try {
    const startTime = Date.now();
    specResult = await generateTextStep({
      aiFormat: "text",
      aiModel: "gpt-4o",
      aiPrompt: `Create an SEO-optimized blog post specification based on this website data:

Website Title: ${scrapeResult.metadata.title}
Website Description: ${scrapeResult.metadata.description}
Industry: ${scrapeResult.metadata.industry}

Website Content:
${scrapeResult.markdown.slice(0, 3000)}

Related Industry News:
${searchResult.results}

Create a detailed blog post spec that:
1. Is SEO-optimized with a compelling title and meta description
2. Incorporates insights from the industry news
3. Relates to the website's brand and industry
4. Includes suggested headers, key points, and target keywords
5. Provides a clear structure for the blog post`,
    });
    await updateStepStatusStep(writable, runId, 'generate', 'success', {
      detail: {
        specLength: specResult.text.length,
        model: specResult.model,
      },
      duration: Date.now() - startTime,
    });

    // Log complete blog spec generation data to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'generate',
      stepData: {
        prompt: `Create an SEO-optimized blog post specification based on this website data:

Website Title: ${scrapeResult.metadata.title}
Website Description: ${scrapeResult.metadata.description}
Industry: ${scrapeResult.metadata.industry}

Website Content:
${scrapeResult.markdown.slice(0, 3000)}

Related Industry News:
${searchResult.results}

Create a detailed blog post spec that:
1. Is SEO-optimized with a compelling title and meta description
2. Incorporates insights from the industry news
3. Relates to the website's brand and industry
4. Includes suggested headers, key points, and target keywords
5. Provides a clear structure for the blog post`,
        generatedSpec: specResult.text,
        model: specResult.model,
        format: 'text',
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    await updateStepStatusStep(writable, runId, 'generate', 'error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  // Step 4: Create Blog Page
  await updateStepStatusStep(writable, runId, 'create', 'running');

  // Prepare brand assets for V0 with Blob URLs (declare outside try for later use)
  const ogImageAsset = uploadedAssets.find(a => a.name === 'og-image');
  const faviconAsset = uploadedAssets.find(a => a.name === 'favicon');

  let blogResult;
  try {
    const startTime = Date.now();

    // Prepare comprehensive brand info from Firecrawl's branding extraction
    const branding = scrapeResult.branding || {};
    const colors = branding.colors || {};
    const typography = branding.typography || {};
    const components = branding.components || {};
    const spacing = branding.spacing || {};

    const brandInfo = `
Brand Identity from ${scrapeResult.metadata.title}:
- Industry: ${scrapeResult.metadata.industry}
- Color Scheme: ${branding.colorScheme || 'light'}
- Logo URL: ${branding.logo || 'None'}
- OG Image URL: ${ogImageAsset?.blobUrl || branding.images?.ogImage || scrapeResult.metadata.ogImage || 'None'}
- Favicon URL: ${faviconAsset?.blobUrl || branding.images?.favicon || scrapeResult.metadata.favicon || 'None'}
- Description: ${scrapeResult.metadata.description}

COMPREHENSIVE BRAND STYLE GUIDE (AI-extracted from website):

🎨 COLOR PALETTE:
- Primary: ${colors.primary || '#000000'}
- Secondary: ${colors.secondary || 'Not detected'}
- Accent: ${colors.accent || 'Not detected'}
- Background: ${colors.background || '#FFFFFF'}
- Text Primary: ${colors.textPrimary || '#000000'}
- Text Secondary: ${colors.textSecondary || '#666666'}
- Link: ${colors.link || colors.primary || '#0000FF'}
${colors.success ? `- Success: ${colors.success}` : ''}
${colors.warning ? `- Warning: ${colors.warning}` : ''}
${colors.error ? `- Error: ${colors.error}` : ''}

✍️ TYPOGRAPHY:
- Primary Font: ${typography.fontFamilies?.primary || branding.fonts?.[0]?.family || 'sans-serif'}
- Heading Font: ${typography.fontFamilies?.heading || typography.fontFamilies?.primary || 'sans-serif'}
- Body Font Size: ${typography.fontSizes?.body || '16px'}
- H1 Size: ${typography.fontSizes?.h1 || '48px'}
- H2 Size: ${typography.fontSizes?.h2 || '36px'}
- H3 Size: ${typography.fontSizes?.h3 || '24px'}
- Font Weight Regular: ${typography.fontWeights?.regular || 400}
- Font Weight Bold: ${typography.fontWeights?.bold || 700}

📐 SPACING & LAYOUT:
- Base Unit: ${spacing.baseUnit || 8}px
- Border Radius: ${spacing.borderRadius || '8px'}

🎯 UI COMPONENTS:
${components.buttonPrimary ? `
- Button Primary:
  Background: ${components.buttonPrimary.background}
  Text: ${components.buttonPrimary.textColor}
  Border Radius: ${components.buttonPrimary.borderRadius}
` : ''}
${components.buttonSecondary ? `
- Button Secondary:
  Background: ${components.buttonSecondary.background}
  Text: ${components.buttonSecondary.textColor}
  Border: ${components.buttonSecondary.borderColor}
` : ''}

🎭 BRAND PERSONALITY:
${branding.personality?.tone ? `- Tone: ${branding.personality.tone}` : ''}
${branding.personality?.energy ? `- Energy: ${branding.personality.energy}` : ''}
${branding.personality?.audience ? `- Target Audience: ${branding.personality.audience}` : ''}

CRITICAL STYLING REQUIREMENTS:
1. Use EXACT colors from the palette above - this is the brand's visual DNA
2. Apply the specified fonts and typography settings precisely
3. Match spacing and border radius for visual consistency
4. Use button component styles if provided
5. Maintain the brand's color scheme (${branding.colorScheme || 'light'}) throughout
6. Use the logo and images provided to reinforce brand identity
7. The design MUST feel like a natural extension of ${scrapeResult.metadata.title}

Industry Context: ${searchResult.results.slice(0, 500)}
`;

    blogResult = await createChatStep({
      message: `Create a complete, production-ready SINGLE-PAGE Next.js app for a blog post based on this specification:

${specResult.text}

${brandInfo}

CRITICAL REQUIREMENTS:
- Create a SINGLE-PAGE Next.js app (app/page.tsx)
- Include ALL code in ONE file - no separate component files
- Apply the brand's color palette, fonts, and visual style throughout
- Use the brand's logo/OG image if provided
- Include proper metadata with OG tags using Next.js metadata API
- Make it a stunning, professional blog page that matches the brand identity
- Style with Tailwind CSS
- Make it responsive and mobile-friendly
- Include a favicon reference
- Use the brand's colors for headings, links, buttons, backgrounds
- Make typography match the brand's style

OUTPUT FORMAT:
Return ONLY the complete page.tsx file content with:
1. Metadata export with title, description, OG tags
2. All components inline in the same file
3. Full Tailwind CSS styling
4. No imports from other files (except Next.js/React built-ins)
5. Ready to deploy as-is`,
    });
    await updateStepStatusStep(writable, runId, 'create', 'success', {
      detail: {
        blogPageLength: blogResult.blogPage.length,
      },
      duration: Date.now() - startTime,
    });

    // Log complete V0 blog page generation data to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'create',
      stepData: {
        prompt: `Create a complete, production-ready SINGLE-PAGE Next.js app for a blog post based on this specification:

${specResult.text}

${brandInfo}

CRITICAL REQUIREMENTS:
- Create a SINGLE-PAGE Next.js app (app/page.tsx)
- Include ALL code in ONE file - no separate component files
- Apply the brand's color palette, fonts, and visual style throughout
- Use the brand's logo/OG image if provided
- Include proper metadata with OG tags using Next.js metadata API
- Make it a stunning, professional blog page that matches the brand identity
- Style with Tailwind CSS
- Make it responsive and mobile-friendly
- Include a favicon reference
- Use the brand's colors for headings, links, buttons, backgrounds
- Make typography match the brand's style

OUTPUT FORMAT:
Return ONLY the complete page.tsx file content with:
1. Metadata export with title, description, OG tags
2. All components inline in the same file
3. Full Tailwind CSS styling
4. No imports from other files (except Next.js/React built-ins)
5. Ready to deploy as-is`,
        generatedBlogPage: blogResult.blogPage,
        model: blogResult.model,
        brandAssets: {
          ogImage: ogImageAsset?.blobUrl || scrapeResult.metadata.ogImage,
          favicon: faviconAsset?.blobUrl || scrapeResult.metadata.favicon,
          title: scrapeResult.metadata.title,
          industry: scrapeResult.metadata.industry,
        },
        comprehensiveBranding: scrapeResult.branding, // Full Firecrawl branding data used
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    await updateStepStatusStep(writable, runId, 'create', 'error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  // Step 5: Deploy to Vercel
  await updateStepStatusStep(writable, runId, 'deploy', 'running');
  let deployResult;
  try {
    const startTime = Date.now();

    // Extract code from V0 response (remove markdown code blocks and thinking tags)
    let pageCode = blogResult.blogPage;

    // Step 1: Remove <Thinking> tags (V0 includes reasoning in the response)
    pageCode = pageCode.replace(/<Thinking>[\s\S]*?<\/Thinking>/gi, '');
    pageCode = pageCode.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    // Step 2: Remove markdown code blocks - try multiple patterns
    // Pattern 1: Standard markdown code block with language specifier
    let codeBlockMatch = pageCode.match(/```(?:tsx|typescript|jsx|ts|js)?\s*\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      pageCode = codeBlockMatch[1];
    }

    // Pattern 2: If still has code block markers at start, strip them
    if (pageCode.trim().startsWith('```')) {
      // Remove opening code block
      pageCode = pageCode.replace(/^```(?:tsx|typescript|jsx|ts|js)?\s*\n/, '');
      // Remove closing code block
      pageCode = pageCode.replace(/\n```\s*$/, '');
    }

    // Step 3: Trim whitespace
    pageCode = pageCode.trim();

    // Step 4: Final check - if STILL starts with ```, do aggressive cleanup
    if (pageCode.startsWith('```')) {
      const lines = pageCode.split('\n');
      // Remove first line if it's a code block marker
      if (lines[0].trim().startsWith('```')) {
        lines.shift();
      }
      // Remove last line if it's a code block marker
      if (lines[lines.length - 1].trim() === '```') {
        lines.pop();
      }
      pageCode = lines.join('\n').trim();
    }

    // Step 5: Validate that we have actual code
    if (!pageCode || pageCode.length < 100) {
      throw new Error(`V0 generated code is too short or empty after cleaning. Length: ${pageCode.length}`);
    }

    // Step 6: Basic validation: check if it looks like React/Next.js code
    if (!pageCode.includes('export') && !pageCode.includes('function') && !pageCode.includes('const')) {
      throw new Error('V0 generated code does not appear to be valid JavaScript/TypeScript');
    }

    // Step 7: Final validation - ensure it doesn't start with invalid syntax
    if (pageCode.startsWith('```') || pageCode.startsWith('<')) {
      throw new Error(`V0 generated code still contains markdown/XML markers. First 100 chars: ${pageCode.slice(0, 100)}`);
    }

    // Prepare files for deployment
    const projectName = `blog-${scrapeResult.metadata.industry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const files = [
      {
        file: 'app/page.tsx',
        data: pageCode,
      },
      {
        file: 'package.json',
        data: JSON.stringify({
          name: projectName,
          version: '0.1.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            next: '15.0.0',
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            tailwindcss: '^3.4.1',
            autoprefixer: '^10.4.17',
            postcss: '^8.4.33',
          },
          devDependencies: {
            typescript: '^5.3.3',
            '@types/react': '^18.2.0',
            '@types/node': '^20.11.5',
          },
        }, null, 2),
      },
      {
        file: 'app/layout.tsx',
        data: `import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
      },
      {
        file: 'tailwind.config.js',
        data: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
      },
      {
        file: 'postcss.config.js',
        data: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      },
      {
        file: 'app/globals.css',
        data: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      },
      {
        file: 'tsconfig.json',
        data: JSON.stringify({
          compilerOptions: {
            target: 'ES2017',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: false,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [
              {
                name: 'next'
              }
            ],
            paths: {
              '@/*': ['./*']
            }
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules']
        }, null, 2),
      },
    ];

    deployResult = await deployToVercelStep({
      files,
      projectName,
    });

    await updateStepStatusStep(writable, runId, 'deploy', 'success', {
      detail: {
        url: deployResult.url,
        deploymentId: deployResult.deploymentId,
      },
      duration: Date.now() - startTime,
    });

    // Log complete Vercel deployment data to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'deploy',
      stepData: {
        projectName,
        files: files.map(f => ({
          file: f.file,
          size: f.data.length,
        })),
        deploymentUrl: deployResult.url,
        deploymentId: deployResult.deploymentId,
        pageCode: pageCode.slice(0, 5000), // Log first 5000 chars of the page code
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    await updateStepStatusStep(writable, runId, 'deploy', 'error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  // Save to MongoDB for persistence
  try {
    await saveToMongoDBStep({
      workflowData: {
        runId,
        url: input.url,
        industry: scrapeResult.metadata.industry,
        brandAssets: {
          title: scrapeResult.metadata.title,
          description: scrapeResult.metadata.description,
          ogImage: ogImageAsset?.blobUrl || scrapeResult.metadata.ogImage,
          favicon: faviconAsset?.blobUrl || scrapeResult.metadata.favicon,
          uploadedAssets,
        },
        branding: scrapeResult.branding, // Comprehensive Firecrawl branding data
        blogSpec: specResult.text,
        liveUrl: deployResult.url,
        deploymentId: deployResult.deploymentId,
        createdAt: Date.now(),
      },
    });
  } catch (mongoError) {
    // Don't fail the whole workflow if MongoDB save fails
    console.error('MongoDB save failed:', mongoError);
  }

  // Close the writable stream
  await closeStreamStep(writable);

  return {
    blogPage: blogResult.blogPage,
    liveUrl: deployResult.url,
    deploymentId: deployResult.deploymentId,
    spec: specResult.text,
    scrapeMetadata: scrapeResult.metadata,
    newsResults: searchResult.results,
    citations: searchResult.citations,
    uploadedAssets,
  };
}
