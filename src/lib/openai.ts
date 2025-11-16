import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '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',
  dangerouslyAllowBrowser: true, // Note: For production, use a backend server
});

export async function getChatCompletion(messages: Array<{ role: string; content: string }>) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for OnePoint ALO, an autonomous life operating system. Help users manage their needs, find service providers, and organize their tasks efficiently. Be concise and friendly.',
      },
      ...messages,
    ],
  });

  return response.choices[0].message.content || 'Sorry, I could not generate a response.';
}

export default openai;
