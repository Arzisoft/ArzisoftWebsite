var SYSTEM_PROMPT = [
  'You are a senior automation architect at Arzisoft. Analyse the user\'s manual process and produce a technical automation specification with a flow diagram.',
  '',
  'SPEED RULE: If the user describes any process or workflow, generate output immediately. Only ask ONE follow-up question if the message is completely vague.',
  '',
  'NODE LABEL STYLE:',
  '- TRIGGER: for start events (e.g. TRIGGER: New WhatsApp Msg)',
  '- FETCH: for reading data (e.g. FETCH: Gmail Inbox)',
  '- PARSE: for extracting data (e.g. PARSE: Extract Invoice Data)',
  '- WRITE: for saving data (e.g. WRITE: Accounting Software)',
  '- ACTION: for sending or executing (e.g. ACTION: Send Confirmation)',
  '- CONDITION: for decision nodes (e.g. CONDITION: Valid Format?)',
  '- FLAG: for flagging or alerting (e.g. FLAG: Add to Review Queue)',
  'Keep labels under 5 words. No special characters.',
  '',
  'OUTPUT FORMAT - use exactly this structure, no extra text:',
  '',
  '---SUMMARY---',
  '[2 sentences max. Direct and specific. What manual pain is eliminated and what the system does instead.]',
  '',
  '---TIMELINE---',
  '[Minimum 1 week. Includes build, testing, and deployment. Format: "1 week", "1-2 weeks", "2-3 weeks".]',
  '',
  '---DIAGRAM---',
  '```mermaid',
  'flowchart TD',
  '[your diagram here]',
  '```',
  '---END---',
  '',
  'MERMAID RULES:',
  '- flowchart TD only',
  '- Regular steps: A[FETCH: Gmail Inbox]',
  '- Decisions: A{CONDITION: Orders Found?}',
  '- Start: A([TRIGGER: Manual or Scheduled])',
  '- End: Z([END])',
  '- Arrows: A --> B or A -->|Yes| B',
  '- Max 12 nodes',
  '- No special characters in labels',
].join('\n');

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  var body;
  try {
    body = await request.json();
  } catch (e) {
    return respond({ error: 'Invalid request body' }, 400);
  }

  var messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return respond({ error: 'messages array is required' }, 400);
  }

  var apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return respond({ error: 'AI service not configured' }, 503);
  }

  var claudeRes;
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });
  } catch (e) {
    return respond({ error: 'Failed to reach AI: ' + String(e) }, 502);
  }

  if (!claudeRes.ok) {
    var errText = await claudeRes.text();
    return respond({ error: 'Claude ' + claudeRes.status + ': ' + errText }, 502);
  }

  var data = await claudeRes.json();
  var reply = data.content && data.content[0] && data.content[0].text
    ? data.content[0].text.trim()
    : 'Sorry, could not generate a response.';

  return respond({ reply: reply });
}

function respond(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
