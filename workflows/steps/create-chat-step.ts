export async function createChatStep({
  message
}: {
  message: string;
}) {
  'use step';

  const apiKey = process.env.V0_API_KEY;

  if (!apiKey) {
    throw new Error('V0_API_KEY is not configured');
  }

  // V0 API endpoint for creating UI from text (OpenAI-compatible format)
  const response = await fetch('https://api.v0.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'v0-1.0-md',
      max_tokens: 16000, // Request longer output to avoid truncation of blog pages
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`V0 API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // V0 uses OpenAI-compatible format: choices[0].message.content
  const blogPage = data.choices?.[0]?.message?.content || '';

  return {
    blogPage: blogPage,
    model: 'v0-1.0-md',
    prompt: message,
  };
}
