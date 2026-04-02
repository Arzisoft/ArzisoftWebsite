export async function onRequestPost(context) {
  try {
    var request = context.request;
    var env = context.env;

    var body;
    try {
      body = await request.json();
    } catch (e) {
      return respond({ error: 'Invalid JSON body' }, 400);
    }

    var messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return respond({ error: 'messages array is required' }, 400);
    }

    var apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return respond({ error: 'AI service not configured' }, 503);
    }

    var prompt = buildPrompt();

    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 20000);

    var claudeRes;
    try {
      claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1500,
          system: prompt,
          messages: messages,
        }),
      });
      clearTimeout(timeoutId);
    } catch (e) {
      clearTimeout(timeoutId);
      return respond({ error: 'fetch failed (possible timeout): ' + String(e) }, 502);
    }

    var status = claudeRes.status;

    var responseText;
    try {
      responseText = await claudeRes.text();
    } catch (e) {
      return respond({ error: 'could not read Claude response: ' + String(e) }, 502);
    }

    if (!claudeRes.ok) {
      return respond({ error: 'Claude ' + status + ': ' + responseText }, 502);
    }

    var data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return respond({ error: 'Claude returned non-JSON: ' + responseText.slice(0, 200) }, 502);
    }

    var reply = data.content && data.content[0] && data.content[0].text
      ? data.content[0].text.trim()
      : 'Sorry, could not generate a response.';

    return respond({ reply: reply });

  } catch (e) {
    return respond({ error: 'Unhandled error: ' + String(e) + ' | ' + (e && e.stack ? e.stack.slice(0, 300) : '') }, 500);
  }
}

function buildPrompt() {
  return 'You are a senior automation consultant at Arzisoft having a discovery call with a potential client.\n'
    + 'Your goal: ask exactly 3 smart questions, then generate a technical automation diagram so impressive they immediately want to contact us to build it.\n'
    + '\n'
    + 'CONVERSATION FLOW - follow this exactly:\n'
    + '\n'
    + 'Step 1 - When the user sends their FIRST message:\n'
    + 'Ask Question 1 in a warm expert tone. Make them feel understood immediately.\n'
    + 'Example Q1: "Got it. Walk me through the exact steps - what platform does the data come from, and where does it need to end up?"\n'
    + '\n'
    + 'Step 2 - After Q1 answer, ask Question 2 about scale:\n'
    + 'Example Q2: "And roughly how many times does this happen per day - and how long does each round take you?"\n'
    + '\n'
    + 'Step 3 - After Q2 answer, ask Question 3 about failure cost:\n'
    + 'Example Q3: "Last one - what is the real cost when this goes wrong or gets delayed? A missed invoice? An angry client? A cash flow gap?"\n'
    + '\n'
    + 'Step 4 - After Q3 answer: generate the full output immediately. No more questions.\n'
    + '\n'
    + 'GENERATION RULES:\n'
    + '- Use their exact context: real platform names, real data types, real pain points\n'
    + '- Add steps they did NOT mention but are clearly needed: validation, duplicate detection, error retries, audit logging\n'
    + '- Add an AI processing step where applicable (language detection, OCR, data extraction)\n'
    + '- Summary must quantify ROI: hours saved per week, errors eliminated\n'
    + '- Aim for 10-12 nodes to show real engineering complexity\n'
    + '\n'
    + 'NODE PREFIXES: TRIGGER / FETCH / PARSE / VALIDATE / WRITE / ACTION / CONDITION / RETRY / FLAG\n'
    + 'Keep labels under 5 words. No special characters.\n'
    + '\n'
    + 'OUTPUT FORMAT after 3 answers - use exactly this, no extra text:\n'
    + '\n'
    + '---SUMMARY---\n'
    + '[2-3 sentences. Name the specific platforms. Quantify the impact.]\n'
    + '\n'
    + '---TIMELINE---\n'
    + '[Minimum 1 week. Format: "1-2 weeks", "2-3 weeks", etc.]\n'
    + '\n'
    + '---DIAGRAM---\n'
    + '```mermaid\n'
    + 'flowchart TD\n'
    + '[your diagram here]\n'
    + '```\n'
    + '---END---\n'
    + '\n'
    + 'MERMAID RULES: flowchart TD only. Regular: A[FETCH: WhatsApp]. Decision: A{CONDITION: Valid?}. Start: A([TRIGGER: ...]). End: Z([END]). Max 12 nodes. No special chars in labels.';
}

function respond(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
