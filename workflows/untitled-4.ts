/**
 * Generated Workflow: Untitled 4
 *
 * This file was automatically generated from a workflow definition.
 * DO NOT EDIT MANUALLY - regenerate from the workflow editor instead.
 *
 * MODIFIED: Updated to accept input parameter, pass data between steps,
 * and stream progress updates for real-time monitoring
 */

import { getWritable, getWorkflowMetadata, sleep } from 'workflow';
import { firecrawlScrapeStep } from './steps/scrape-step';
import { perplexitySearchStep } from './steps/search-step';
import { generateTextStep } from './steps/generate-text-step';
import { claudeGenerateHtmlStep } from './steps/claude-generate-html-step';
import { uploadAssetsStep } from './steps/upload-assets-step';
import { saveToMongoDBStep } from './steps/save-to-mongodb-step';
import { logStepDataStep } from './steps/log-step-data';
import { falImageGenerationStep } from './steps/fal-image-generation-step';
import { downloadAndRehostImagesStep } from './steps/download-and-rehost-images-step';
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
  { id: 'screenshot', label: 'Capture Preview Screenshot (Optional)' },
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

    // Write to stream, cache, AND MongoDB
    await writer.write(update);
    addStepUpdate(runId, update);
    await saveStepStatusToMongoDB(runId, update);
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

  // Write to stream, cache, AND MongoDB
  await writer.write(update);
  addStepUpdate(runId, update);

  // Save to MongoDB for cross-instance access
  await saveStepStatusToMongoDB(runId, update);

  writer.releaseLock();
}

// Helper to save step status to MongoDB
async function saveStepStatusToMongoDB(runId: string, update: StepUpdate) {
  "use step";

  const { MongoClient } = await import('mongodb');
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('[Workflow] MONGODB_URI not configured, skipping step status save');
    return;
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('blog-agent');
    const collection = db.collection('workflow_step_status');

    // Upsert the step status (update if exists, insert if not)
    await collection.updateOne(
      { runId, stepId: update.stepId },
      {
        $set: {
          runId,
          stepId: update.stepId,
          stepLabel: update.stepLabel,
          status: update.status,
          timestamp: update.timestamp,
          detail: update.detail,
          error: update.error,
          duration: update.duration,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`[Workflow] Saved step status to MongoDB: ${update.stepId} -> ${update.status}`);
  } catch (error) {
    console.error('[Workflow] Failed to save step status to MongoDB:', error);
    // Don't throw - status save failures shouldn't break the workflow
  } finally {
    await client.close();
  }
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

  // Step 1.5: Capture screenshot of original brand website for visual reference
  let brandScreenshotUrl: string | undefined;
  try {
    console.log('[Workflow] Capturing brand website screenshot for visual reference...');

    const { screenshotStep } = await import('./steps/screenshot-step');
    const brandScreenshotResult = await screenshotStep({
      url: input.url, // Original brand URL
    });

    brandScreenshotUrl = brandScreenshotResult.screenshotUrl;
    console.log('[Workflow] ✓ Brand screenshot captured:', brandScreenshotUrl);

    // Log to MongoDB
    await logStepDataStep({
      runId,
      stepName: 'brand_screenshot',
      stepData: {
        url: input.url,
        screenshotUrl: brandScreenshotUrl,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.warn('[Workflow] Brand screenshot capture failed:', error);
    // Continue without screenshot - not critical
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
    // Build brand context string
    const brandContext = scrapeResult.branding ? `

BRAND DESIGN SYSTEM (from original website):
- Color Scheme: ${scrapeResult.branding.colorScheme || 'Not specified'}
- Primary Color: ${scrapeResult.branding.colors?.primary || 'Not specified'}
${scrapeResult.branding.colors?.secondary ? `- Secondary Color: ${scrapeResult.branding.colors.secondary}` : ''}
${scrapeResult.branding.colors?.accent ? `- Accent Color: ${scrapeResult.branding.colors.accent}` : ''}
- Primary Font: ${scrapeResult.branding.typography?.fontFamilies?.primary || scrapeResult.branding.fonts?.[0]?.family || 'Not specified'}
${scrapeResult.branding.personality?.tone ? `- Brand Tone: ${scrapeResult.branding.personality.tone}` : ''}
${scrapeResult.branding.personality?.energy ? `- Brand Energy: ${scrapeResult.branding.personality.energy}` : ''}` : '';

    specResult = await generateTextStep({
      aiFormat: "text",
      aiModel: "gpt-4o",
      aiPrompt: `⚠️ CRITICAL INSTRUCTION - FACTUAL ACCURACY:
You MUST create content based ONLY on the information provided below. DO NOT:
- Invent statistics, numbers, or data points not present in the research
- Make up customer testimonials or quotes
- Create specific product features not mentioned in the brand content
- Fabricate company history, founding dates, or team information
- Generate fake partnerships, certifications, or awards

If information is missing, use general benefit-driven language instead of making up specifics.
Example: Instead of "10,000+ satisfied customers" (if not in data), use "trusted by businesses worldwide"

Create a conversion-focused landing page specification based on this campaign:

BRAND INFORMATION:
Website: ${input.url}
Brand Title: ${scrapeResult.metadata.title}
Brand Description: ${scrapeResult.metadata.description}
Industry: ${scrapeResult.metadata.industry}${brandContext}

CAMPAIGN BRIEF:
${input.campaignDescription}

MARKET RESEARCH & DATA:
${searchResult.results}

BRAND CONTENT SAMPLE:
${scrapeResult.markdown.slice(0, 3000)}

⚠️ BRAND CONSISTENCY REQUIREMENT:
The landing page spec you create should align with the brand's existing design system and personality. Reference the brand colors, fonts, and tone provided above when suggesting design elements and copy tone.

⚠️ FACTUAL CONTENT REQUIREMENT:
- Use ONLY facts, data, and claims present in the above sections
- If specific numbers are not provided, use qualitative descriptions
- Base testimonials framework on industry context, not invented quotes
- Feature highlights must align with brand content sample
- Statistics must come from market research section or be omitted

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
- Mobile-first design: Content and layout should work well on mobile devices (concise headlines, scannable text, vertical layouts)

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

    // Helper function to check if URL is a supported raster image format
    const isSupportedImageFormat = (url: string): boolean => {
      const supportedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
      const urlLower = url.toLowerCase();
      return supportedExtensions.some(ext => urlLower.includes(ext));
    };

    // Prepare brand image URLs - filter to only supported formats (exclude SVG, ICO, etc)
    const brandImageUrls: string[] = [];
    if (scrapeResult.metadata.ogImage && isSupportedImageFormat(scrapeResult.metadata.ogImage)) {
      brandImageUrls.push(scrapeResult.metadata.ogImage);
      console.log('[Workflow] Added OG image to brand assets:', scrapeResult.metadata.ogImage);
    } else if (scrapeResult.metadata.ogImage) {
      console.log('[Workflow] Skipped unsupported OG image format:', scrapeResult.metadata.ogImage);
    }

    if (scrapeResult.metadata.favicon && isSupportedImageFormat(scrapeResult.metadata.favicon)) {
      brandImageUrls.push(scrapeResult.metadata.favicon);
      console.log('[Workflow] Added favicon to brand assets:', scrapeResult.metadata.favicon);
    } else if (scrapeResult.metadata.favicon) {
      console.log('[Workflow] Skipped unsupported favicon format:', scrapeResult.metadata.favicon);
    }

    // Download and rehost brand images to Vercel Blob before FAL
    let rehostedBrandImages: string[] = [];
    if (brandImageUrls.length > 0) {
      console.log(`[Workflow] Rehosting ${brandImageUrls.length} brand image(s) to Vercel Blob...`);
      const rehostResult = await downloadAndRehostImagesStep({
        imageUrls: brandImageUrls,
      });

      rehostedBrandImages = rehostResult.successfulUploads.map(img => img.blobUrl);
      console.log(`[Workflow] Successfully rehosted ${rehostedBrandImages.length}/${brandImageUrls.length} brand images`);

      // Log failures for debugging
      if (rehostResult.failedUrls.length > 0) {
        console.warn('[Workflow] Failed to download brand images:',
          rehostResult.failedUrls.map(f => `${f.originalUrl}: ${f.error}`));
      }
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
      brandImageUrls: rehostedBrandImages, // Use rehosted URLs instead of original
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
      branding: scrapeResult.branding, // Pass full Firecrawl branding data
      generatedImages: generatedImages,
      targetUrl: input.url,
      brandScreenshotUrl: brandScreenshotUrl, // Pass brand screenshot for visual guidance
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
  const landingPageUrl = `https://slophub.xyz/landing/${runId}`;

  // CRITICAL: Save to MongoDB BEFORE taking screenshot
  // This ensures the landing page data exists when the screenshot API loads the page
  console.log('[Workflow] Saving landing page data to MongoDB before screenshot...');
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
          brandScreenshotUrl: brandScreenshotUrl, // Brand website screenshot for reference
        },
        branding: scrapeResult.branding, // Comprehensive Firecrawl branding data
        campaignDescription: input.campaignDescription,
        landingPageSpec: specResult.text,
        landingPageHtml, // Store the rendered HTML
        referenceImageUrl: input.imageUrl,
        generatedImages,
        liveUrl: landingPageUrl,
        screenshotUrl: undefined, // Will be updated after screenshot
        createdAt: Date.now(),
      },
    });
    console.log('[Workflow] ✓ Landing page data saved to MongoDB');
  } catch (mongoError) {
    // Don't fail the whole workflow if MongoDB save fails
    console.error('MongoDB save failed:', mongoError);
  }

  // Step 7: Capture Screenshot (AFTER MongoDB save)
  await updateStepStatusStep(writable, runId, 'screenshot', 'running');
  let screenshotUrl: string | undefined;
  try {
    const startTime = Date.now();

    console.log('[Workflow] Starting screenshot capture for:', landingPageUrl);
    console.log('[Workflow] SCREENSHOTAPI_TOKEN present:', !!process.env.SCREENSHOTAPI_TOKEN);
    console.log('[Workflow] BLOB_READ_WRITE_TOKEN present:', !!process.env.BLOB_READ_WRITE_TOKEN);

    // Wait 3 seconds for Next.js to process the MongoDB data and build the page
    console.log('[Workflow] Waiting 3 seconds for Next.js to render the landing page...');
    await sleep('3s');

    // Import and call screenshot step
    const { screenshotStep } = await import('./steps/screenshot-step');
    const screenshotResult = await screenshotStep({
      url: landingPageUrl,
    });

    screenshotUrl = screenshotResult.screenshotUrl;
    console.log('[Workflow] ✓ Screenshot captured successfully:', screenshotUrl);

    await updateStepStatusStep(writable, runId, 'screenshot', 'success', {
      detail: {
        screenshotUrl: screenshotUrl,
        pageUrl: landingPageUrl,
      },
      duration: Date.now() - startTime,
    });

    // Update MongoDB with the screenshot URL
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
            brandScreenshotUrl: brandScreenshotUrl,
          },
          branding: scrapeResult.branding,
          campaignDescription: input.campaignDescription,
          landingPageSpec: specResult.text,
          landingPageHtml,
          referenceImageUrl: input.imageUrl,
          generatedImages,
          liveUrl: landingPageUrl,
          screenshotUrl, // Now we have the screenshot URL
          createdAt: Date.now(),
        },
      });
      console.log('[Workflow] ✓ Screenshot URL updated in MongoDB');
    } catch (updateError) {
      console.error('[Workflow] Failed to update screenshot URL in MongoDB:', updateError);
    }
  } catch (error) {
    console.error('[Workflow] Screenshot capture failed:', error);
    console.error('[Workflow] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Don't fail the entire workflow if screenshot fails
    await updateStepStatusStep(writable, runId, 'screenshot', 'success', {
      detail: {
        skipped: true,
        reason: 'Screenshot failed - will use iframe fallback',
        error: error instanceof Error ? error.message : String(error),
      },
    });
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
