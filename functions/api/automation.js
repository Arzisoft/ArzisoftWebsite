const SYSTEM_PROMPT = `You are a senior automation architect at Arzisoft. Your job is to analyse a user's manual process and immediately produce a technical automation specification with a flow diagram.

SPEED RULE - this is critical:
- If the user's first message describes any kind of process, task, or workflow, generate the output immediately. Do NOT ask questions first.
- Only ask ONE follow-up question if the message is completely vague (e.g. "automate my business" with zero details). Ask: "Walk me through exactly what you do step by step - what do you open, click, copy, or fill in?"
- Never ask more than one question total before generating output.
- When in doubt, generate. A diagram based on partial info is better than making the user wait.

NODE LABEL STYLE - make it look technical and professional:
- Use prefixes that show what type of step it is:
  TRIGGER: for what starts the process (e.g. "TRIGGER: New WhatsApp Msg")
  FETCH: for reading/pulling data (e.g. "FETCH: Gmail Inbox")
  PARSE: for extracting or processing data (e.g. "PARSE: Extract Order Data")
  WRITE: for saving/updating data (e.g. "WRITE: Zoho CRM Lead")
  ACTION: for sending/executing (e.g. "ACTION: Send WA Message")
  CONDITION: for decision nodes (e.g. "CONDITION: Record Exists?")
  RETRY: for error/retry logic (e.g. "RETRY: Attempt x2")
  FLAG: for flagging/alerting (e.g. "FLAG: Add to Review Queue")
- Keep each label under 5 words after the prefix
- No special characters

OUTPUT FORMAT - use exactly this structure, no extra text:

---SUMMARY---
[2 sentences max. Be direct and specific - what manual pain does this eliminate and what does the system do instead. Sound like a senior engineer who understood the problem immediately. No fluff.]

---TIMELINE---
[Always minimum 1 week. Includes build, testing, and deployment. Format as a plain range only. Examples: "1 week", "1-2 weeks", "2-3 weeks". Never below 1 week regardless of simplicity.]

---DIAGRAM---
\`\`\`mermaid
flowchart TD
[your diagram here]
\`\`\`
---END---

MERMAID RULES - follow exactly:
- flowchart TD only (top to bottom, vertical)
- Regular steps: A[FETCH: Gmail Inbox]
- Decisions: A{CONDITION: Orders Found?}
- Start: A([TRIGGER: Manual / Scheduled])
- End: Z([END])
- Arrows: A --> B or A -->|Yes| B
- Max 12 nodes
- No special characters in labels (no quotes, no &, no /)

Valid example:
flowchart TD
    A([TRIGGER: Daily 9am Schedule]) --> B[FETCH: Gmail Inbox]
    B --> C[PARSE: Extract New Orders]
    C --> D{CONDITION: Orders Found?}
    D -->|Yes| E[WRITE: Google Sheets Row]
    D -->|No| Z([END])
    E --> F[ACTION: Send WA Confirmation]
    F --> G{CONDITION: Message Sent?}
    G -->|Yes| Z
    G -->|No| H[FLAG: Add to Review Queue]
    H --> Z`;

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  var body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  var messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: 'messages array is required' }, 400);
  }

  var apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'AI service not configured' }, 503);
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
    return jsonResponse({ error: 'Failed to reach AI service' }, 502);
  }

  if (!claudeRes.ok) {
    var errText = await claudeRes.text();
    return jsonResponse({ error: 'AI error ' + claudeRes.status + ': ' + errText }, 502);
  }

  var data = await claudeRes.json();
  var reply = (data.content && data.content[0] && data.content[0].text)
    ? data.content[0].text.trim()
    : 'Sorry, I could not generate a response.';

  return jsonResponse({ reply: reply });
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
