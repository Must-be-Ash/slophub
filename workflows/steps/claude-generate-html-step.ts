import Anthropic from '@anthropic-ai/sdk';
import { put } from '@vercel/blob';
import { validateAndResizeImage, getImageDimensions } from '../../lib/image-utils';

export async function claudeGenerateHtmlStep({
  spec,
  brandAssets,
  branding,
  generatedImages,
  targetUrl,
  brandScreenshotUrl,
}: {
  spec: string;
  brandAssets: {
    title: string;
    description: string;
    ogImage?: string;
    favicon?: string;
  };
  branding?: {
    colorScheme?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    fonts?: Array<{ family: string }>;
    typography?: {
      fontFamilies?: {
        primary?: string;
        secondary?: string;
      };
    };
    personality?: {
      tone?: string;
      energy?: string;
    };
  };
  generatedImages: Array<{
    name: string;
    blobUrl: string;
  }>;
  targetUrl: string;
  brandScreenshotUrl?: string;
}): Promise<{ html: string }> {
  'use step';

  const apiKey = process.env.WORKFLOW_ANTHROPIC_API_KEY;

  console.log('[Claude HTML] WORKFLOW_ANTHROPIC_API_KEY present:', !!apiKey);
  console.log('[Claude HTML] API key length:', apiKey?.length || 0);

  if (!apiKey) {
    console.error('[Claude HTML] ❌ WORKFLOW_ANTHROPIC_API_KEY is not configured!');
    throw new Error('WORKFLOW_ANTHROPIC_API_KEY is not configured');
  }

  console.log('[Claude HTML] ✓ API key validated, initializing Anthropic client');

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  // Prepare image URLs for the prompt
  const imageList = generatedImages
    .map((img, idx) => `${idx + 1}. ${img.name}: ${img.blobUrl}`)
    .join('\n');

  // Build brand style guide from scraped branding data
  let brandStyleGuide = '';
  if (branding) {
    brandStyleGuide = '\n\nBRAND DESIGN SYSTEM (extracted from original website):';

    if (branding.colorScheme) {
      brandStyleGuide += `\n- Color Scheme: ${branding.colorScheme}`;
    }

    if (branding.colors?.primary) {
      brandStyleGuide += `\n- Primary Color: ${branding.colors.primary}`;
    }
    if (branding.colors?.secondary) {
      brandStyleGuide += `\n- Secondary Color: ${branding.colors.secondary}`;
    }
    if (branding.colors?.accent) {
      brandStyleGuide += `\n- Accent Color: ${branding.colors.accent}`;
    }

    const primaryFont = branding.typography?.fontFamilies?.primary || branding.fonts?.[0]?.family;
    if (primaryFont) {
      brandStyleGuide += `\n- Primary Font: ${primaryFont}`;
    }

    const secondaryFont = branding.typography?.fontFamilies?.secondary || branding.fonts?.[1]?.family;
    if (secondaryFont) {
      brandStyleGuide += `\n- Secondary Font: ${secondaryFont}`;
    }

    if (branding.personality?.tone) {
      brandStyleGuide += `\n- Brand Tone: ${branding.personality.tone}`;
    }

    if (branding.personality?.energy) {
      brandStyleGuide += `\n- Brand Energy: ${branding.personality.energy}`;
    }
  }

  const prompt = `You are an expert web developer specializing in high-converting landing pages. Create a complete, standalone HTML page with inline CSS based on the following specification.

⚠️ IMPORTANT: Implement the spec EXACTLY as written. Do not add features, claims, or content not present in the spec below.

${brandScreenshotUrl ? '⚠️ VISUAL BRAND REFERENCE: Review the screenshot of the original brand website above. Your design MUST visually match that style - same color palette, typography hierarchy, spacing patterns, and overall aesthetic. Think of this landing page as a natural extension of their existing website.' : ''}

LANDING PAGE SPECIFICATION:
${spec}

BRAND INFORMATION:
- Title: ${brandAssets.title}
- Description: ${brandAssets.description}
- OG Image: ${brandAssets.ogImage || 'None'}
- Favicon: ${brandAssets.favicon || 'None'}${brandStyleGuide}

GENERATED IMAGES (use these in your design):
${imageList}

TARGET URL (all CTAs must link here):
${targetUrl}

CRITICAL BRAND CONSISTENCY REQUIREMENTS:
⚠️ STAY ON-BRAND: This landing page MUST match the visual design style of the original website (${targetUrl}).
- Use the EXACT brand colors provided above - do not invent new colors
- Use the brand's typography/fonts if provided
- Match the brand's tone and personality (${branding?.personality?.tone || 'professional'})
- Study the OG Image if provided to understand the brand's visual style
- The design should feel like a natural extension of the original website

⚠️ MINIMIZE GRADIENT USAGE:
- Do NOT overuse gradients - use them sparingly and only where appropriate
- Prefer solid colors from the brand palette
- If you use gradients, make them subtle and on-brand (using brand colors)
- Avoid flashy rainbow or multi-color gradients
- The design should be clean and professional, not overly decorative

TECHNICAL REQUIREMENTS:
1. Create a complete HTML document starting with <!DOCTYPE html>
2. Include all CSS inline in a <style> tag in the <head>
3. Use modern, clean design with excellent typography
4. Make it fully responsive (mobile-first)
5. Use the provided images strategically throughout the page
6. All buttons and CTAs must link to: ${targetUrl}
7. Include proper meta tags for SEO (title, description, og:tags)
8. Use the brand's favicon if available
9. NO external dependencies - everything must be inline
10. NO JavaScript - pure HTML and CSS only
11. Use a conversion-focused layout with clear visual hierarchy
12. Include compelling copy based on the spec

DESIGN STYLE GUIDELINES:
- Modern, clean, and professional (matching the brand)
- Use bold typography for headlines (using brand fonts if provided)
- Ample white space for readability
- Use ONLY the brand colors provided - no random colors
- Clear CTAs that stand out (using brand primary/accent color)
- Social proof elements if mentioned in spec
- Feature highlights with icons or imagery
- Subtle shadows and effects (avoid over-designing)
- Clean, minimal aesthetic that respects the brand identity

Return ONLY the complete HTML code. No explanations, no markdown code blocks, just the raw HTML starting with <!DOCTYPE html>.`;

  console.log('[Claude HTML] Starting Claude Opus 4.5 API call with streaming...');
  console.log('[Claude HTML] Model: claude-opus-4-5-20251101, Max tokens: 35000');
  console.log('[Claude HTML] Brand screenshot available:', !!brandScreenshotUrl);
  const startTime = Date.now();

  // PRE-FLIGHT VALIDATION: Check screenshot dimensions before passing to Claude
  let validatedScreenshotUrl = brandScreenshotUrl;

  if (brandScreenshotUrl) {
    try {
      console.log('[Claude HTML] Validating brand screenshot dimensions...');

      // Fetch the screenshot to check dimensions
      const screenshotResponse = await fetch(brandScreenshotUrl);
      if (!screenshotResponse.ok) {
        console.warn(`[Claude HTML] ⚠️ Failed to fetch screenshot for validation: ${screenshotResponse.status}`);
        console.warn('[Claude HTML] Continuing with text-only generation (no screenshot)');
        validatedScreenshotUrl = undefined;
      } else {
        const screenshotBuffer = Buffer.from(await screenshotResponse.arrayBuffer());

        // Extract dimensions
        const dims = await getImageDimensions(screenshotBuffer);
        console.log(`[Claude HTML] Screenshot dimensions: ${dims.width}x${dims.height}`);

        // Check if oversized (> 4096px safe limit)
        if (dims.width > 4096 || dims.height > 4096) {
          console.log('[Claude HTML] ⚠️ Screenshot exceeds safe dimensions, resizing...');

          // Resize to fit within Claude's limits
          const processed = await validateAndResizeImage(
            screenshotBuffer,
            4096, // Safe limit with headroom from 8000px
            85    // Quality for screenshots
          );

          console.log(`[Claude HTML] ✓ Resized from ${dims.width}x${dims.height} to ${processed.metadata.width}x${processed.metadata.height}`);

          // Re-upload resized version to Blob
          const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
          if (!blobToken) {
            console.warn('[Claude HTML] ⚠️ No BLOB_READ_WRITE_TOKEN for re-upload, continuing without screenshot');
            validatedScreenshotUrl = undefined;
          } else {
            const resizedBlob = new Blob([new Uint8Array(processed.buffer)], { type: 'image/png' });
            const blobResult = await put(
              `screenshots/resized-landing-${Date.now()}.png`,
              resizedBlob,
              {
                access: 'public',
                token: blobToken,
              }
            );

            console.log(`[Claude HTML] ✓ Re-uploaded resized screenshot: ${blobResult.url}`);
            validatedScreenshotUrl = blobResult.url;
          }
        } else {
          console.log('[Claude HTML] ✓ Screenshot dimensions within safe limits');
        }
      }
    } catch (error) {
      console.error('[Claude HTML] ✗ Screenshot validation failed:', error);
      console.warn('[Claude HTML] Continuing with text-only generation (no screenshot)');
      validatedScreenshotUrl = undefined;
    }
  }

  // Build messages array with vision support
  const messages: Anthropic.MessageParam[] = [];

  if (validatedScreenshotUrl) {
    // Use vision to show brand website screenshot (validated and resized if needed)
    console.log(`[Claude HTML] Using validated screenshot URL: ${validatedScreenshotUrl}`);
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'url',
            url: validatedScreenshotUrl,
          },
        },
        {
          type: 'text',
          text: 'This is a screenshot of the original brand website. Study the visual design, layout patterns, spacing, color usage, and overall aesthetic. Your generated landing page should match this visual style.'
        },
        {
          type: 'text',
          text: prompt,
        },
      ],
    });
  } else {
    // Fallback: text-only (no screenshot available or validation failed)
    console.log('[Claude HTML] No screenshot available, using text-only generation');
    messages.push({
      role: 'user',
      content: prompt,
    });
  }

  // Use streaming to avoid 10-minute timeout for long requests
  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 35000,
    messages: messages,
  });

  console.log('[Claude HTML] Stream created, waiting for chunks...');

  // Collect streamed text chunks
  let html = '';
  let chunkCount = 0;
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      html += chunk.delta.text;
      chunkCount++;

      // Log progress every 50 chunks
      if (chunkCount % 50 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Claude HTML] Received ${chunkCount} chunks, ${html.length} bytes (${elapsed}s elapsed)`);
      }
    }
  }

  const duration = Date.now() - startTime;
  const durationSeconds = (duration / 1000).toFixed(2);
  console.log(`[Claude HTML] ✓ Stream complete in ${durationSeconds}s`);
  console.log(`[Claude HTML] Total chunks: ${chunkCount}, Total bytes: ${html.length}`);

  // Clean up any markdown code blocks if present
  let cleanHtml = html.trim();

  if (cleanHtml.startsWith('```html')) {
    cleanHtml = cleanHtml.replace(/^```html\s*\n/, '');
    cleanHtml = cleanHtml.replace(/\n```\s*$/, '');
  } else if (cleanHtml.startsWith('```')) {
    cleanHtml = cleanHtml.replace(/^```\s*\n/, '');
    cleanHtml = cleanHtml.replace(/\n```\s*$/, '');
  }

  // Validate we have HTML
  if (!cleanHtml.includes('<!DOCTYPE html>') && !cleanHtml.includes('<html')) {
    throw new Error('Claude response does not appear to be valid HTML');
  }

  console.log(`[Claude HTML] Generated ${cleanHtml.length} bytes of HTML`);

  return {
    html: cleanHtml.trim(),
  };
}
