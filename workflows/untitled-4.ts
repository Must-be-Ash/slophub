/**
 * Generated Workflow: Untitled 4
 *
 * This file was automatically generated from a workflow definition.
 * DO NOT EDIT MANUALLY - regenerate from the workflow editor instead.
 *
 * MODIFIED: Updated to accept input parameter and pass data between steps
 */

import { firecrawlScrapeStep } from './steps/scrape-step';
import { perplexitySearchStep } from './steps/search-step';
import { generateTextStep } from './steps/generate-text-step';
import { createChatStep } from './steps/create-chat-step';

export async function untitled4Workflow(input: { url: string }) {
  "use workflow";

  // Scrape Site
  const scrapeResult = await firecrawlScrapeStep({
    url: input.url,
  });

  // Search News
  const searchResult = await perplexitySearchStep({
    query: `Industry news related to ${scrapeResult.metadata.industry}`,
    searchFocus: "internet",
  });

  // Write Spec
  const specResult = await generateTextStep({
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

  // Create Blog Page
  const blogResult = await createChatStep({
    message: `Create a complete, production-ready blog page using React and Tailwind CSS based on this specification:

${specResult.text}

Requirements:
- Use modern React components
- Style with Tailwind CSS
- Make it responsive and mobile-friendly
- Include proper SEO meta tags
- Make it visually appealing with good typography
- Include the website's brand colors if mentioned in the spec`,
  });

  return {
    blogPage: blogResult.blogPage,
    spec: specResult.text,
    scrapeMetadata: scrapeResult.metadata,
    newsResults: searchResult.results,
    citations: searchResult.citations,
  };
}
