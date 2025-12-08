import { getImageDimensions } from '../../lib/image-utils';

interface ImageGenerationInput {
  // Campaign and brand context
  campaignDescription: string;
  landingPageSpec: string;
  brandInfo: {
    title: string;
    description: string;
    industry: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    personality?: {
      tone?: string;
      energy?: string;
    };
  };

  // Reference images (optional)
  referenceImageUrl?: string; // User-uploaded reference
  brandImageUrls?: string[];  // Scraped brand assets (OG image, favicon)
}

interface ImageGenerationOutput {
  images: Array<{
    url: string;
    file_name: string;
    content_type: string;
  }>;
  description: string;
  method: 'image-to-image' | 'text-to-image';
}

export async function falImageGenerationStep(
  input: ImageGenerationInput
): Promise<ImageGenerationOutput> {
  'use step';

  const apiKey = process.env.FAL_KEY;

  if (!apiKey) {
    throw new Error('FAL_KEY is not configured');
  }

  // Determine which mode to use
  const hasReferenceImage = !!input.referenceImageUrl;
  const hasBrandAssets = input.brandImageUrls && input.brandImageUrls.length > 0;
  const useImageToImage = hasReferenceImage || hasBrandAssets;

  // Build style context
  const styleContext = buildStyleContext(input);

  if (useImageToImage) {
    return await generateWithImageToImage(apiKey, input, styleContext);
  } else {
    return await generateWithTextToImage(apiKey, input, styleContext);
  }
}

// Helper: Build style context from brand info
function buildStyleContext(input: ImageGenerationInput): string {
  const { brandInfo } = input;
  const colors = brandInfo.colors || {};

  let context = `Style Guide:\n`;
  context += `- Brand: ${brandInfo.title}\n`;
  context += `- Industry: ${brandInfo.industry}\n`;

  if (colors.primary) context += `- Primary Color: ${colors.primary}\n`;
  if (colors.secondary) context += `- Secondary Color: ${colors.secondary}\n`;
  if (brandInfo.personality?.tone) context += `- Tone: ${brandInfo.personality.tone}\n`;

  return context;
}

// Generate using image-to-image (when reference or brand images available)
async function generateWithImageToImage(
  apiKey: string,
  input: ImageGenerationInput,
  styleContext: string
): Promise<ImageGenerationOutput> {

  // Prioritize user-uploaded reference image, fallback to brand assets
  const imageUrls: string[] = [];
  if (input.referenceImageUrl) {
    imageUrls.push(input.referenceImageUrl); // PRIMARY style reference
  }
  if (input.brandImageUrls) {
    imageUrls.push(...input.brandImageUrls); // Secondary reference
  }

  // Validate reference images (Fal is more lenient than Claude, but good to check)
  console.log(`[Fal Image Gen] Validating ${imageUrls.length} reference images...`);
  for (const imageUrl of imageUrls) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.warn(`[Fal Image Gen] ⚠️ Failed to fetch reference image for validation: ${imageUrl}`);
        continue;
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      const dims = await getImageDimensions(imageBuffer);
      console.log(`[Fal Image Gen] Reference image dimensions: ${dims.width}x${dims.height} (${imageUrl})`);

      // Log warning for very large images (> 2048px)
      if (dims.width > 2048 || dims.height > 2048) {
        console.warn(`[Fal Image Gen] ⚠️ Large reference image detected: ${dims.width}x${dims.height}. Fal may resize automatically.`);
      }
    } catch (error) {
      console.warn(`[Fal Image Gen] ⚠️ Failed to validate reference image: ${imageUrl}`, error);
      // Continue anyway - Fal will handle or fail gracefully
    }
  }

  // Generate 3 prompts for different sections
  const prompts = [
    generateImagePrompt(input, styleContext, 'value-proposition'),
    generateImagePrompt(input, styleContext, 'features'),
    generateImagePrompt(input, styleContext, 'call-to-action'),
  ];

  const results = [];

  for (const prompt of prompts) {
    const response = await fetch('https://fal.run/fal-ai/nano-banana-pro/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_urls: imageUrls,
        num_images: 1,
        aspect_ratio: '1:1',
        output_format: 'png',
        resolution: '1K',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      const isDownloadError = errorText.includes('download') ||
                              errorText.includes('403') ||
                              errorText.includes('404') ||
                              response.status === 422;

      const errorMessage = isDownloadError
        ? `FAL cannot access image URLs (422/download error). Ensure images are publicly accessible. Details: ${errorText}`
        : `Fal image-to-image error: ${response.status} - ${errorText}`;

      throw new Error(errorMessage);
    }

    const data = await response.json();
    results.push(...(data.images || []));
  }

  return {
    images: results,
    description: `Generated ${results.length} images using image-to-image`,
    method: 'image-to-image',
  };
}

// Generate using text-to-image (when no images available)
async function generateWithTextToImage(
  apiKey: string,
  input: ImageGenerationInput,
  styleContext: string
): Promise<ImageGenerationOutput> {

  // Generate 3 prompts for different sections
  const prompts = [
    generateImagePrompt(input, styleContext, 'value-proposition'),
    generateImagePrompt(input, styleContext, 'features'),
    generateImagePrompt(input, styleContext, 'call-to-action'),
  ];

  const results = [];

  for (const prompt of prompts) {
    const response = await fetch('https://fal.run/fal-ai/nano-banana-pro', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        num_images: 1,
        aspect_ratio: '1:1',
        output_format: 'png',
        resolution: '1K',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      const isDownloadError = errorText.includes('download') ||
                              errorText.includes('403') ||
                              errorText.includes('404') ||
                              response.status === 422;

      const errorMessage = isDownloadError
        ? `FAL cannot access image URLs (422/download error). Ensure images are publicly accessible. Details: ${errorText}`
        : `Fal text-to-image error: ${response.status} - ${errorText}`;

      throw new Error(errorMessage);
    }

    const data = await response.json();
    results.push(...(data.images || []));
  }

  return {
    images: results,
    description: `Generated ${results.length} images using text-to-image`,
    method: 'text-to-image',
  };
}

// Generate prompt for specific section
function generateImagePrompt(
  input: ImageGenerationInput,
  styleContext: string,
  section: 'value-proposition' | 'features' | 'call-to-action'
): string {
  const { campaignDescription, landingPageSpec, brandInfo } = input;

  const sectionContext = {
    'value-proposition': 'Create a professional image representing the key benefit or value proposition.',
    'features': 'Create an image showcasing product features or capabilities.',
    'call-to-action': 'Create a compelling image for the call-to-action section.',
  };

  return `${sectionContext[section]}

Campaign: ${campaignDescription}

${styleContext}

Landing Page Context:
${landingPageSpec.slice(0, 500)}

Requirements:
- Square aspect ratio (1:1)
- Professional, modern aesthetic
- Match brand colors and style
- Relevant to ${section.replace('-', ' ')}
- No text overlays
- Clean, minimal composition
- Suitable for landing page use`;
}
