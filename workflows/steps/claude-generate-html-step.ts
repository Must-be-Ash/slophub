import Anthropic from '@anthropic-ai/sdk';

export async function claudeGenerateHtmlStep({
  spec,
  brandAssets,
  generatedImages,
  targetUrl,
}: {
  spec: string;
  brandAssets: {
    title: string;
    description: string;
    ogImage?: string;
    favicon?: string;
  };
  generatedImages: Array<{
    name: string;
    blobUrl: string;
  }>;
  targetUrl: string;
}): Promise<{ html: string }> {
  'use step';

  const apiKey = process.env.WORKFLOW_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('WORKFLOW_ANTHROPIC_API_KEY is not configured');
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  // Prepare image URLs for the prompt
  const imageList = generatedImages
    .map((img, idx) => `${idx + 1}. ${img.name}: ${img.blobUrl}`)
    .join('\n');

  const prompt = `You are an expert web developer specializing in high-converting landing pages. Create a complete, standalone HTML page with inline CSS based on the following specification.

LANDING PAGE SPECIFICATION:
${spec}

BRAND INFORMATION:
- Title: ${brandAssets.title}
- Description: ${brandAssets.description}
- OG Image: ${brandAssets.ogImage || 'None'}
- Favicon: ${brandAssets.favicon || 'None'}

GENERATED IMAGES (use these in your design):
${imageList}

TARGET URL (all CTAs must link here):
${targetUrl}

REQUIREMENTS:
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
13. Make it visually stunning with gradients, shadows, and modern effects

DESIGN STYLE:
- Modern, clean, and professional
- Use bold typography for headlines
- Ample white space
- Strategic use of color (brand-appropriate)
- Clear CTAs that stand out
- Social proof elements if mentioned in spec
- Feature highlights with icons or imagery

Return ONLY the complete HTML code. No explanations, no markdown code blocks, just the raw HTML starting with <!DOCTYPE html>.`;

  console.log('[Claude HTML] Calling Anthropic API...');
  const startTime = Date.now();

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 35000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const duration = Date.now() - startTime;
  console.log(`[Claude HTML] Response received in ${duration}ms`);

  // Extract text from response
  const html = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as any).text)
    .join('\n');

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
