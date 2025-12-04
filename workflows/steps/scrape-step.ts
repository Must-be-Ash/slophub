export async function firecrawlScrapeStep({ url }: { url: string }) {
  'use step';

  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY is not configured');
  }

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      includeTags: ['meta', 'title'],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Extract brand information from metadata
  const metadata = data.data?.metadata || {};
  const html = data.data?.html || '';

  // Try to detect industry from content
  let industry = 'general';
  const content = (data.data?.markdown || '').toLowerCase();

  if (content.includes('crypto') || content.includes('blockchain') || content.includes('bitcoin')) {
    industry = 'cryptocurrency';
  } else if (content.includes('ai') || content.includes('machine learning') || content.includes('artificial intelligence')) {
    industry = 'artificial intelligence';
  } else if (content.includes('saas') || content.includes('software')) {
    industry = 'software';
  } else if (content.includes('finance') || content.includes('fintech')) {
    industry = 'finance';
  } else if (content.includes('health') || content.includes('medical')) {
    industry = 'healthcare';
  }

  return {
    markdown: data.data?.markdown || '',
    html: html,
    metadata: {
      title: metadata.title || metadata.ogTitle || 'Untitled',
      description: metadata.description || metadata.ogDescription || '',
      ogImage: metadata.ogImage || '',
      favicon: metadata.favicon || '',
      keywords: metadata.keywords || '',
      author: metadata.author || '',
      industry: industry,
      url: url,
    },
  };
}
