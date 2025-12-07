import OpenAI from 'openai';

export async function generateTextStep({
  aiPrompt,
  aiModel,
  aiFormat
}: {
  aiPrompt: string;
  aiModel: string;
  aiFormat: string;
}) {
  'use step';

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  // Create OpenAI client
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  // Use OpenAI GPT-4o for high-quality blog spec generation
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: aiPrompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const text = completion.choices[0]?.message?.content || '';

  return {
    text: text,
    model: 'gpt-4o',
    format: aiFormat,
  };
}
