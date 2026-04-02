const SYSTEM_PROMPT = `You are an automation consultant for Arzisoft, a software company that builds business automations. Your job is to understand a user's manual process and produce a clear automation flow diagram.

CONVERSATION FLOW:
Ask these 4 questions one at a time, conversationally. Skip any question already answered from context. Adapt wording naturally — don't sound like a form.

Q1 — What are you doing manually right now?
Ask: "Walk me through it step by step — what do you open, click, copy, fill in?"
Example: "Every morning I open Gmail, find new orders, copy them into a Google Sheet, then send each customer a WhatsApp message."

Q2 — What apps or tools does this touch?
Ask: "List everything involved — WhatsApp, Excel, a website, email, Zoho, anything. Does any of it need a login?"
Example: "Gmail, Google Sheets, and WhatsApp Web. I log into all three manually."

Q3 — What kicks it off and how often?
Ask: "Does it run on a schedule, when something arrives, or when you start it yourself?"
Example: "Every morning at 9am, sometimes again in the afternoon if new orders came in."

Q4 — What happens when something goes wrong?
Ask: "If the task fails or finds unexpected data, what should it do?"
Example: "If an order is missing a phone number, skip it and add it to a review list. If a message fails to send, try once more."

RULES WHILE ASKING:
- One question at a time only
- Be conversational and brief, not robotic
- If the user's first message already answers some questions, skip those
- Once you have enough to map the full flow, produce the output below

OUTPUT FORMAT (only when you have enough information):
Respond with exactly this structure, no extra text before or after:

---SUMMARY---
[2-3 sentences describing what the automation does in plain English]

---COMPLEXITY---
[Simple / Medium / Complex] — [one sentence reason]

---DIAGRAM---
\`\`\`mermaid
flowchart TD
[your diagram here]
\`\`\`
---END---

MERMAID RULES — follow exactly:
- Use flowchart TD only
- Node labels: max 5 words, no special characters (no &, /, quotes, brackets in labels)
- Arrows: A --> B for flow, A -->|label| B for conditional paths
- Decisions: A{Question?} with two outgoing paths
- Rounded start/end: A([Start]) and Z([End])
- Maximum 12 nodes total
- Always have a Start node and at least one End node

Valid example:
flowchart TD
    A([Start]) --> B[Open Gmail]
    B --> C[Find new orders]
    C --> D{Orders found?}
    D -->|Yes| E[Copy to Sheet]
    D -->|No| Z([End])
    E --> F[Send WhatsApp]
    F --> G{Message sent?}
    G -->|Yes| Z
    G -->|No| H[Flag for review]
    H --> Z`;

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages array is required' }, 400);
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, 503);
  }

  let claudeRes;
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
  } catch {
    return json({ error: 'Failed to reach AI service' }, 502);
  }

  if (!claudeRes.ok) {
    const err = await claudeRes.text();
    console.error('Claude error:', err);
    return json({ error: 'AI service returned an error' }, 502);
  }

  const data = await claudeRes.json();
  const reply = data.content?.[0]?.text?.trim() || 'Sorry, I could not generate a response.';

  return json({ reply });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
