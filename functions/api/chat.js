const MODEL_MAP = {
  'Arizi-7B': 'meta/llama-3.1-8b-instruct',
  'Arizi-13B': 'meta/llama-3.3-70b-instruct',
  'Arizi-70B': 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
};

const SYSTEM_PROMPT =
  'You are Arizi AI, an intelligent assistant for Arzisoft — a solution development company ' +
  'specialising in WhatsApp automation, AI integration, smart dashboards, web development, and app design. ' +
  'Be helpful, concise, and professional.';

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { message, model } = body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return json({ error: 'message is required' }, 400);
  }

  const apiKey = env.NVIDIA_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, 503);
  }

  const apiModel = MODEL_MAP[model] || MODEL_MAP['Arizi-7B'];

  let nvidiaRes;
  try {
    nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
  } catch {
    return json({ error: 'Failed to reach AI service' }, 502);
  }

  if (!nvidiaRes.ok) {
    return json({ error: 'AI service returned an error' }, 502);
  }

  const data = await nvidiaRes.json();
  const reply =
    data.choices?.[0]?.message?.content?.trim() ||
    'Sorry, I could not generate a response.';

  return json({ reply });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
