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
import { claudeGenerateHtmlStep } from './steps/claude-generate-html-step';
import { uploadAssetsStep } from './steps/upload-assets-step';
import { saveToMongoDBStep } from './steps/save-to-mongodb-step';
import { logStepDataStep } from './steps/log-step-data';
import { falImageGenerationStep } from './steps/fal-image-generation-step';
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
  { id: 'generateHtml', label: 'Generate HTML with Claude Opus 4.5' },
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

  // Step 5: Generate HTML with Claude Opus 4.5
  await updateStepStatusStep(writable, runId, 'generateHtml', 'running');

  // Prepare brand assets with Blob URLs
  const ogImageAsset = uploadedAssets.find(a => a.name === 'og-image');
  const faviconAsset = uploadedAssets.find(a => a.name === 'favicon');

  let landingPageHtml: string;
  try {
    const startTime = Date.now();

    // Call Claude to generate complete HTML + CSS
    const htmlResult = await claudeGenerateHtmlStep({
      spec: specResult.text,
      brandAssets: {
        title: scrapeResult.metadata.title,
        description: scrapeResult.metadata.description,
        ogImage: ogImageAsset?.blobUrl || scrapeResult.metadata.ogImage,
        favicon: faviconAsset?.blobUrl || scrapeResult.metadata.favicon,
      },
      generatedImages: generatedImages,
      targetUrl: input.url,
    });

    landingPageHtml = htmlResult.html;

    await updateStepStatusStep(writable, runId, 'generateHtml', 'success', {
      detail: {
        htmlLength: landingPageHtml.length,
        model: 'claude-opus-4-5-20251101',
        targetUrl: input.url,
      },
      duration: Date.now() - startTime,
    });

    // Log HTML generation data to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'generateHtml',
      stepData: {
        campaignDescription: input.campaignDescription,
        targetUrl: input.url,
        htmlLength: landingPageHtml.length,
        htmlPreview: landingPageHtml.slice(0, 500),
        model: 'claude-opus-4-5-20251101',
        brandAssets: {
          ogImage: ogImageAsset?.blobUrl || scrapeResult.metadata.ogImage,
          favicon: faviconAsset?.blobUrl || scrapeResult.metadata.favicon,
          title: scrapeResult.metadata.title,
          industry: scrapeResult.metadata.industry,
        },
        generatedImagesCount: generatedImages.length,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    await updateStepStatusStep(writable, runId, 'generateHtml', 'error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  // Determine the final URL for this landing page
  const landingPageUrl = `https://blog-agent-nine.vercel.app/landing/${runId}`;

  // Step 7: Capture Screenshot (skip for now - we'll capture after deployment)
  await updateStepStatusStep(writable, runId, 'screenshot', 'running');
  let screenshotUrl: string | undefined;
  try {
    const startTime = Date.now();

    // Skip screenshot for now since the page isn't deployed yet
    // The screenshot will be captured manually or in a follow-up workflow
    await updateStepStatusStep(writable, runId, 'screenshot', 'success', {
      detail: {
        skipped: true,
        reason: 'Screenshot will be captured after page is live',
      },
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Screenshot step error:', error);
    await updateStepStatusStep(writable, runId, 'screenshot', 'error', {
      error: 'Screenshot skipped',
    });
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
        campaignDescription: input.campaignDescription,
        landingPageSpec: specResult.text,
        landingPageHtml, // Store the rendered HTML
        referenceImageUrl: input.imageUrl,
        generatedImages,
        liveUrl: landingPageUrl,
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
    landingPageHtml,
    liveUrl: landingPageUrl,
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
