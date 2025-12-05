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
import { falImageGenerationStep } from './steps/fal-image-generation-step';
import { addToMicrofrontendsGroupStep } from './steps/add-to-microfrontends-group-step';
import { registerMicrofrontendStep } from './steps/register-microfrontend-step';
import { commitAndPushStep } from './steps/commit-and-push-step';
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
  { id: 'search', label: 'Research Campaign Data' },
  { id: 'generate', label: 'Generate Landing Page Spec' },
  { id: 'images', label: 'Generate Landing Page Images' },
  { id: 'create', label: 'Create Landing Page' },
  { id: 'deploy', label: 'Deploy to Vercel' },
  { id: 'addToGroup', label: 'Add to Microfrontends Group' },
  { id: 'register', label: 'Register Microfrontend' },
  { id: 'commit', label: 'Update Parent Application' },
  { id: 'screenshot', label: 'Capture Preview Screenshot' },
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

export async function untitled4Workflow(input: {
  url: string;
  campaignDescription: string;
  imageUrl?: string;
}) {
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

  // Step 2: Research Campaign Data
  await updateStepStatusStep(writable, runId, 'search', 'running');
  let searchResult;
  try {
    const startTime = Date.now();
    searchResult = await perplexitySearchStep({
      query: `Research data and insights for this marketing campaign: ${input.campaignDescription}. Include market trends, target audience insights, relevant statistics, competitive analysis, and best practices.`,
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
        query: `Research data and insights for this marketing campaign: ${input.campaignDescription}`,
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

  // Step 3: Generate Landing Page Spec
  await updateStepStatusStep(writable, runId, 'generate', 'running');
  let specResult;
  try {
    const startTime = Date.now();
    specResult = await generateTextStep({
      aiFormat: "text",
      aiModel: "gpt-4o",
      aiPrompt: `Create a conversion-focused landing page specification based on this campaign:

BRAND INFORMATION:
Website: ${input.url}
Brand Title: ${scrapeResult.metadata.title}
Brand Description: ${scrapeResult.metadata.description}
Industry: ${scrapeResult.metadata.industry}

CAMPAIGN BRIEF:
${input.campaignDescription}

MARKET RESEARCH & DATA:
${searchResult.results}

BRAND CONTENT SAMPLE:
${scrapeResult.markdown.slice(0, 2000)}

Create a detailed landing page spec that:

1. **HEADLINE & SUBHEADLINE:**
   - Attention-grabbing headline that addresses the target audience from the campaign brief
   - Supporting subheadline that clarifies the value proposition
   - Use insights from the market research to make it compelling

2. **HERO SECTION:**
   - Compelling opening statement
   - Clear benefit-driven messaging based on research data
   - Primary CTA that leads to: ${input.url}

3. **VALUE PROPOSITIONS (3-5 KEY BENEFITS):**
   - Based on campaign description and market research
   - Focus on solving target audience's pain points
   - Use benefit-oriented language
   - Incorporate relevant statistics from research

4. **SOCIAL PROOF/TRUST ELEMENTS:**
   - Testimonials framework (if applicable to campaign)
   - Trust badges or credibility indicators
   - Statistics or results from research data

5. **FEATURE HIGHLIGHTS:**
   - 3-5 key features relevant to the campaign
   - Benefit-focused descriptions
   - Visual representation suggestions
   - Use competitive insights from research

6. **FINAL CTA SECTION:**
   - Strong closing statement
   - Clear call-to-action
   - Urgency or incentive messaging based on market trends
   - Link destination: ${input.url}

7. **SEO OPTIMIZATION:**
   - Meta title (55-60 characters)
   - Meta description (150-160 characters)
   - Target keywords based on campaign and research

CRITICAL REQUIREMENTS:
- All CTAs and links MUST point to: ${input.url}
- NO navigation menu
- NO footer navigation links
- NO external links except to ${input.url}
- Single-purpose conversion focus
- Brand-consistent messaging tone
- Data-driven content using research insights

Return a detailed specification with all sections clearly outlined.`,
    });
    await updateStepStatusStep(writable, runId, 'generate', 'success', {
      detail: {
        specLength: specResult.text.length,
        model: specResult.model,
        targetUrl: input.url,
      },
      duration: Date.now() - startTime,
    });

    // Log complete landing page spec generation data to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'generate',
      stepData: {
        campaignDescription: input.campaignDescription,
        targetUrl: input.url,
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

  // Step 4: Generate Landing Page Images
  await updateStepStatusStep(writable, runId, 'images', 'running');
  let generatedImages: { name: string; blobUrl: string }[] = [];
  try {
    const startTime = Date.now();

    // Prepare brand image URLs
    const brandImageUrls: string[] = [];
    if (scrapeResult.metadata.ogImage) {
      brandImageUrls.push(scrapeResult.metadata.ogImage);
    }
    if (scrapeResult.metadata.favicon) {
      brandImageUrls.push(scrapeResult.metadata.favicon);
    }

    // Call Fal image generation
    const falResult = await falImageGenerationStep({
      campaignDescription: input.campaignDescription,
      landingPageSpec: specResult.text,
      brandInfo: {
        title: scrapeResult.metadata.title,
        description: scrapeResult.metadata.description,
        industry: scrapeResult.metadata.industry,
        colors: scrapeResult.branding?.colors,
        personality: scrapeResult.branding?.personality,
      },
      referenceImageUrl: input.imageUrl, // User-uploaded reference
      brandImageUrls,                     // Scraped brand assets
    });

    // Upload generated images to Vercel Blob
    const imagesToUpload = falResult.images.map((img, idx) => ({
      name: `generated-${idx}`,
      url: img.url,
    }));

    if (imagesToUpload.length > 0) {
      const uploadResult = await uploadAssetsStep({ assets: imagesToUpload });
      generatedImages = uploadResult.assets;
    }

    await updateStepStatusStep(writable, runId, 'images', 'success', {
      detail: {
        imagesGenerated: generatedImages.length,
        method: falResult.method,
      },
      duration: Date.now() - startTime,
    });

    // Log image generation data
    await logStepDataStep({
      runId,
      stepName: 'images',
      stepData: {
        method: falResult.method,
        referenceImageProvided: !!input.imageUrl,
        brandImagesUsed: brandImageUrls.length,
        generatedImages: generatedImages.map(img => ({
          name: img.name,
          blobUrl: img.blobUrl,
        })),
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    // Don't fail workflow if image generation fails - continue without generated images
    console.error('Image generation failed:', error);
    await updateStepStatusStep(writable, runId, 'images', 'error', {
      error: 'Image generation failed - continuing with brand assets only',
    });
    // Continue workflow - generatedImages will be empty array
  }

  // Step 5: Create Landing Page
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

AVAILABLE IMAGES FOR LANDING PAGE:
- Original Brand Assets:
  - OG Image: ${ogImageAsset?.blobUrl || scrapeResult.metadata.ogImage || 'None'}
  - Favicon: ${faviconAsset?.blobUrl || scrapeResult.metadata.favicon || 'None'}

${generatedImages.length > 0 ? `
- AI-Generated Section Images (use these prominently):
${generatedImages.map((img) => `  - ${img.name}: ${img.blobUrl}`).join('\n')}
` : ''}

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

Market Research Context: ${searchResult.results.slice(0, 500)}
`;

    blogResult = await createChatStep({
      message: `Create a complete, production-ready SINGLE-PAGE Next.js landing page based on this specification:

${specResult.text}

${brandInfo}

TARGET URL FOR ALL CTAs: ${input.url}

**IMAGE USAGE:**
${generatedImages.length > 0 ? `
- You have ${generatedImages.length} AI-generated images specifically created for this landing page
- Use these images prominently in:
  - Value propositions section (${generatedImages[0]?.name}: ${generatedImages[0]?.blobUrl})
  - Features section (${generatedImages[1]?.name}: ${generatedImages[1]?.blobUrl})
  - Call-to-action section (${generatedImages[2]?.name}: ${generatedImages[2]?.blobUrl})
- Images are square (1:1) - use in grid layouts, cards, or section backgrounds
- IMPORTANT: Import and use Next.js Image component from 'next/image':
  import Image from 'next/image'
- Example usage:
  <Image
    src="${generatedImages[0]?.blobUrl}"
    alt="Value Proposition"
    width={500}
    height={500}
    className="rounded-lg"
  />
- The next.config.js already allows Vercel Blob storage images
- IMPORTANT: Use these generated images instead of placeholder images
- DO NOT use regular <img> tags for these images - use Next.js Image component
` : `
- Use brand OG image and favicon where appropriate
- Consider using solid color backgrounds matching brand colors
- No generated images available - use brand colors creatively
`}

CRITICAL REQUIREMENTS:

1. **LANDING PAGE STRUCTURE (NOT A BLOG):**
   - Hero section with headline, subheadline, and primary CTA
   - Value propositions section (3-5 benefits)
   - Features/highlights section
   - Social proof section (testimonials/trust badges if applicable)
   - Final CTA section
   - NO navigation menu at the top
   - NO footer with links

2. **LINK RESTRICTIONS (EXTREMELY IMPORTANT):**
   - ALL buttons must link to: ${input.url}
   - ALL CTAs must link to: ${input.url}
   - ALL clickable elements must link to: ${input.url}
   - DO NOT create navigation menus
   - DO NOT create footer navigation
   - DO NOT create "Read More" or blog-style links
   - Only brand logo can be clickable (linking to ${input.url})
   - NO links to "#" or "javascript:void(0)" or empty hrefs

3. **STYLING & BRANDING:**
   - Apply the brand's color palette throughout
   - Use brand fonts and typography
   - Include brand logo in top-left
   - Match brand personality and tone
   - Responsive and mobile-friendly design
   - Style with Tailwind CSS

4. **TECHNICAL REQUIREMENTS:**
   - Create SINGLE-PAGE Next.js app (app/page.tsx)
   - Include ALL code in ONE file
   - Include proper metadata with OG tags using Next.js metadata API
   - Include favicon reference
   - NO separate component files
   - Ready to deploy as-is

5. **CONVERSION OPTIMIZATION:**
   - Clear visual hierarchy
   - Prominent CTAs above and below the fold
   - Benefit-driven copy
   - Scannable layout
   - Action-oriented button text

6. **EXAMPLES OF CORRECT CTA IMPLEMENTATION:**
   \`\`\`tsx
   // Primary CTA Button
   <a
     href="${input.url}"
     className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
   >
     Get Started
   </a>

   // Logo Link
   <a href="${input.url}">
     <Image src={logoUrl} alt="Brand" width={120} height={40} />
   </a>

   // Text CTA
   <a
     href="${input.url}"
     className="text-blue-600 font-medium hover:underline"
   >
     Learn more →
   </a>
   \`\`\`

OUTPUT FORMAT:
Return ONLY the complete page.tsx file content with:
1. Metadata export with SEO-optimized title, description, OG tags
2. All components inline in the same file
3. Full Tailwind CSS styling
4. All links pointing to ${input.url}
5. NO navigation menu or footer links
6. Conversion-focused landing page layout`,
    });
    await updateStepStatusStep(writable, runId, 'create', 'success', {
      detail: {
        landingPageLength: blogResult.blogPage.length,
        targetUrl: input.url,
      },
      duration: Date.now() - startTime,
    });

    // Log complete V0 landing page generation data to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'create',
      stepData: {
        campaignDescription: input.campaignDescription,
        targetUrl: input.url,
        generatedLandingPage: blogResult.blogPage,
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

  // Step 6: Deploy to Vercel
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
    const projectName = `funnel-${scrapeResult.metadata.industry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

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
      {
        file: 'next.config.js',
        data: `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
}

module.exports = nextConfig`,
      },
      {
        file: 'vercel.json',
        data: JSON.stringify({
          headers: [
            {
              source: '/(.*)',
              headers: [
                {
                  key: 'Content-Security-Policy',
                  value: "frame-ancestors *"
                }
              ]
            }
          ]
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

  // Step 7: Add to Microfrontends Group
  await updateStepStatusStep(writable, runId, 'addToGroup', 'running');
  let addedToGroup = false;
  try {
    const startTime = Date.now();

    const microfrontendsGroupId = process.env.VERCEL_MICROFRONTENDS_GROUP_ID;

    if (!microfrontendsGroupId) {
      console.warn('VERCEL_MICROFRONTENDS_GROUP_ID not set, skipping add to group step');
      await updateStepStatusStep(writable, runId, 'addToGroup', 'success', {
        detail: { skipped: true, reason: 'No microfrontends group ID configured' },
        duration: Date.now() - startTime,
      });
    } else {
      const groupResult = await addToMicrofrontendsGroupStep({
        projectName: deployResult.projectName,
        microfrontendsGroupId,
      });

      addedToGroup = groupResult.addedToGroup;

      await updateStepStatusStep(writable, runId, 'addToGroup', 'success', {
        detail: {
          addedToGroup: groupResult.addedToGroup,
          projectName: deployResult.projectName,
          groupId: microfrontendsGroupId,
        },
        duration: Date.now() - startTime,
      });

      await logStepDataStep({
        runId,
        stepName: 'addToGroup',
        stepData: {
          projectName: deployResult.projectName,
          microfrontendsGroupId,
          addedToGroup: groupResult.addedToGroup,
          timestamp: Date.now(),
        },
      });
    }
  } catch (error) {
    console.error('Failed to add to microfrontends group:', error);
    await updateStepStatusStep(writable, runId, 'addToGroup', 'error', {
      error: 'Failed to add to microfrontends group - will continue with manual addition',
    });
    // Don't throw - this is not critical, continue workflow
  }

  // Step 8: Register Microfrontend
  await updateStepStatusStep(writable, runId, 'register', 'running');
  let microfrontendPath: string | undefined;
  try {
    const startTime = Date.now();

    const registrationResult = await registerMicrofrontendStep({
      runId,
      projectName: deployResult.projectName,
    });

    microfrontendPath = registrationResult.path;

    await updateStepStatusStep(writable, runId, 'register', 'success', {
      detail: { path: microfrontendPath },
      duration: Date.now() - startTime,
    });

    await logStepDataStep({
      runId,
      stepName: 'register',
      stepData: {
        path: microfrontendPath,
        projectName: deployResult.projectName,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Microfrontend registration failed:', error);
    await updateStepStatusStep(writable, runId, 'register', 'error', {
      error: 'Failed to register microfrontend - landing page still accessible via standalone URL',
    });
    // Don't throw - continue with standalone URL
  }

  // Step 9: Commit and Push (Git Approach)
  await updateStepStatusStep(writable, runId, 'commit', 'running');
  let parentUpdated = false;
  try {
    const startTime = Date.now();

    const commitResult = await commitAndPushStep({
      runId,
      route: microfrontendPath || '/unknown',
    });

    parentUpdated = commitResult.success;

    await updateStepStatusStep(writable, runId, 'commit', 'success', {
      detail: {
        commitHash: commitResult.commitHash,
        pushed: commitResult.success,
      },
      duration: Date.now() - startTime,
    });

    await logStepDataStep({
      runId,
      stepName: 'commit',
      stepData: {
        success: commitResult.success,
        commitHash: commitResult.commitHash,
        route: microfrontendPath,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Git commit/push failed:', error);
    await updateStepStatusStep(writable, runId, 'commit', 'error', {
      error: 'Parent app update pending - microfrontend will be available after next deployment',
    });
    // Don't throw - landing page is still accessible via standalone URL
  }

  // Step 10: Capture Screenshot
  await updateStepStatusStep(writable, runId, 'screenshot', 'running');
  let screenshotUrl: string | undefined;
  try {
    const startTime = Date.now();

    // Determine which URL to screenshot
    const parentDomain = 'blog-agent-nine.vercel.app';

    // Wait a bit for parent app deployment if we just pushed
    // (Vercel typically deploys in 30-60 seconds)
    if (microfrontendPath && parentUpdated) {
      // Wait 45 seconds for parent deployment to complete
      await new Promise(resolve => setTimeout(resolve, 45000));
    }

    const urlToScreenshot = (microfrontendPath && parentUpdated)
      ? `https://${parentDomain}${microfrontendPath}`
      : deployResult.url;

    // Call screenshot step
    const { screenshotStep } = await import('./steps/screenshot-step');
    const screenshotResult = await screenshotStep({
      url: urlToScreenshot,
    });

    screenshotUrl = screenshotResult.screenshotUrl;

    await updateStepStatusStep(writable, runId, 'screenshot', 'success', {
      detail: {
        screenshotUrl,
        urlScreenshotted: urlToScreenshot,
      },
      duration: Date.now() - startTime,
    });

    await logStepDataStep({
      runId,
      stepName: 'screenshot',
      stepData: {
        url: urlToScreenshot,
        screenshotUrl,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    // Don't fail workflow if screenshot fails - continue without it
    console.error('Screenshot capture failed:', error);
    await updateStepStatusStep(writable, runId, 'screenshot', 'error', {
      error: 'Screenshot capture failed - deployment still successful',
    });
    // Continue workflow - screenshotUrl will be undefined
  }

  // Save to MongoDB for persistence
  const parentDomain = 'blog-agent-nine.vercel.app';
  const finalUrl = (microfrontendPath && parentUpdated)
    ? `https://${parentDomain}${microfrontendPath}`
    : deployResult.url;

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
        campaignDescription: input.campaignDescription,
        landingPageSpec: specResult.text,
        referenceImageUrl: input.imageUrl,
        generatedImages,
        liveUrl: finalUrl, // Microfrontend URL if available, else standalone
        standaloneUrl: deployResult.url, // Always save standalone URL as fallback
        microfrontendPath, // e.g., "/landing-abc123"
        deploymentId: deployResult.deploymentId,
        screenshotUrl,
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
    landingPage: blogResult.blogPage,
    liveUrl: finalUrl, // Microfrontend URL if available, else standalone
    standaloneUrl: deployResult.url, // Always available as fallback
    microfrontendPath, // e.g., "/landing-abc123"
    deploymentId: deployResult.deploymentId,
    spec: specResult.text,
    scrapeMetadata: scrapeResult.metadata,
    campaignDescription: input.campaignDescription,
    targetUrl: input.url,
    researchResults: searchResult.results,
    citations: searchResult.citations,
    uploadedAssets,
    generatedImages,
    referenceImageUrl: input.imageUrl,
    screenshotUrl,
  };
}
