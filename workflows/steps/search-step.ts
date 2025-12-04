export async function perplexitySearchStep({
  query,
  searchFocus
}: {
  query: string;
  searchFocus: string;
}) {
  'use step';

  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that searches the web for recent news and information. Provide concise, factual summaries with sources.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 1000,
      temperature: 0.2,
      search_domain_filter: searchFocus === 'internet' ? undefined : [searchFocus],
      return_citations: true,
      search_recency_filter: 'month', // Focus on recent news
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const results = data.choices?.[0]?.message?.content || 'No results found';
  const citations = data.citations || [];

  return {
    results: results,
    citations: citations,
    query: query,
  };
}
