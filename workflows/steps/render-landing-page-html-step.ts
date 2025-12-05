import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function renderLandingPageHtmlStep({
  tsxCode,
  brandAssets,
}: {
  tsxCode: string;
  brandAssets: {
    title: string;
    description: string;
    ogImage?: string;
    favicon?: string;
  };
}): Promise<{ html: string }> {
  'use step';

  // Use AI to convert TSX to static HTML
  const { text: html } = await generateText({
    model: openai('gpt-4o'),
    prompt: `Convert this Next.js/React TSX code into a single standalone HTML file with inline CSS.

REQUIREMENTS:
1. Extract all Tailwind classes and convert to inline <style> tag
2. Convert all React components to plain HTML
3. Remove all JSX/React syntax
4. Include complete <!DOCTYPE html> structure
5. Add meta tags for SEO
6. Make all styles inline (no external CSS)
7. Ensure all images and assets use absolute URLs
8. Remove any "use client" or import statements
9. Make it a complete, self-contained HTML document

BRAND INFORMATION:
- Title: ${brandAssets.title}
- Description: ${brandAssets.description}
- OG Image: ${brandAssets.ogImage || ''}
- Favicon: ${brandAssets.favicon || ''}

TSX CODE TO CONVERT:
${tsxCode}

Return ONLY the complete HTML code, no explanations or markdown code blocks.`,
  });

  // Clean up any markdown code blocks if present
  let cleanHtml = html.trim();

  // Remove markdown code blocks
  if (cleanHtml.startsWith('```html')) {
    cleanHtml = cleanHtml.replace(/^```html\s*\n/, '');
    cleanHtml = cleanHtml.replace(/\n```\s*$/, '');
  } else if (cleanHtml.startsWith('```')) {
    cleanHtml = cleanHtml.replace(/^```\s*\n/, '');
    cleanHtml = cleanHtml.replace(/\n```\s*$/, '');
  }

  return {
    html: cleanHtml.trim(),
  };
}
