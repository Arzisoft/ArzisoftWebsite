const SYSTEM_PROMPT = `You are a senior automation architect at Arzisoft. Your job is to analyse a user's manual process and immediately produce a technical automation specification with a flow diagram.

SPEED RULE — this is critical:
- If the user's first message describes any kind of process, task, or workflow → generate the output immediately. Do NOT ask questions first.
- Only ask ONE follow-up question if the message is completely vague (e.g. "automate my business" with zero details). Ask: "Walk me through exactly what you do step by step — what do you open, click, copy, or fill in?"
- Never ask more than one question total before generating output.
- When in doubt, generate. A diagram based on partial info is better than making the user wait.

NODE LABEL STYLE — make it look technical and professional:
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

OUTPUT FORMAT — use exactly this structure, no extra text:

---SUMMARY---
[2 sentences max. Be direct and specific — what manual pain does this eliminate and what does the system do instead. Sound like a senior engineer who understood the problem immediately. No fluff, no "this automation will..."]

---TIMELINE---
[Always minimum 1 week. Includes build, testing, and deployment. Format as a plain range only. Examples: "1 week", "1–2 weeks", "2–3 weeks". Never below 1 week regardless of simplicity.]

---DIAGRAM---
\`\`\`mermaid
flowchart TD
[your diagram here]
\`\`\`
---END---

MERMAID RULES — follow exactly:
- flowchart TD only (top to bottom, vertical)
- Regular steps: A[FETCH: Gmail Inbox]
- Decisions: A{CONDITION: Orders Found?}
- Start: A([TRIGGER: Manual / Scheduled])
- End: Z([END])
- Arrows: A --> B or A -->|Yes| B
- Max 12 nodes
- No special characters in labels (no &, /, quotes, colons after the prefix colon is fine)

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

// ── Cache key extraction ──────────────────────────────────────────────────────
// Maps automation descriptions to a normalised category key like "whatsapp--excel"
// so repetitive patterns skip Claude entirely.

const SOURCE_MAP = [
  ['whatsapp', 'whatsapp'],
  ['telegram', 'telegram'],
  ['instagram', 'instagram'],
  ['gmail',    'email'],
  ['email',    'email'],
  ['form',     'form'],
  ['typeform', 'form'],
  ['sms',      'sms'],
  ['phone',    'phone'],
  ['invoice',  'invoice'],
  ['pdf',      'pdf'],
];

const DEST_MAP = [
  ['google sheets', 'gsheets'],
  ['excel',         'excel'],
  ['sheets',        'gsheets'],
  ['quickbooks',    'accounting'],
  ['xero',          'accounting'],
  ['accounting',    'accounting'],
  ['zoho',          'crm'],
  ['salesforce',    'crm'],
  ['hubspot',       'crm'],
  ['crm',           'crm'],
  ['notion',        'notion'],
  ['airtable',      'airtable'],
  ['slack',         'slack'],
  ['trello',        'trello'],
  ['jira',          'jira'],
  ['database',      'database'],
];

function extractCacheKey(messages) {
  const text = messages.map(m => m.content).join(' ').toLowerCase();

  let source = 'general';
  for (const [kw, val] of SOURCE_MAP) {
    if (text.includes(kw)) { source = val; break; }
  }

  let dest = 'general';
  for (const [kw, val] of DEST_MAP) {
    if (text.includes(kw)) { dest = val; break; }
  }

  return `${source}--${dest}`;
}

// ── Log entry (fire-and-forget, never blocks the response) ────────────────────
function saveLog(kv, entry) {
  if (!kv) return;
  const key = 'log:' + Date.now() + ':' + Math.random().toString(36).slice(2, 7);
  kv.put(key, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 90 }) // 90 days
    .catch(() => {});
}

// ── Handler ───────────────────────────────────────────────────────────────────
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

  const kv       = env.AUTOMATION_KV || null;
  const category = extractCacheKey(messages);
  const cacheKey = 'cache:' + category;

  // ── Cache hit ──────────────────────────────────────────────────────────────
  if (kv) {
    try {
      const cached = await kv.get(cacheKey, 'json');
      if (cached) {
        saveLog(kv, {
          message:   messages[0]?.content || '',
          category,
          cacheHit:  true,
          createdAt: new Date().toISOString(),
        });
        return json({ reply: cached.reply });
      }
    } catch (_) { /* KV unavailable — fall through to Claude */ }
  }

  // ── Call Claude ────────────────────────────────────────────────────────────
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
        max_tokens: 1200,
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

  const data  = await claudeRes.json();
  const reply = data.content?.[0]?.text?.trim() || 'Sorry, I could not generate a response.';

  // ── Persist (only valid diagram responses) ─────────────────────────────────
  if (kv && reply.includes('---SUMMARY---')) {
    // Cache this category for future identical requests
    kv.put(cacheKey, JSON.stringify({ reply, cachedAt: new Date().toISOString() }))
      .catch(() => {});

    // Analytics log
    saveLog(kv, {
      message:   messages[0]?.content || '',
      category,
      cacheHit:  false,
      createdAt: new Date().toISOString(),
    });
  }

  return json({ reply });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
