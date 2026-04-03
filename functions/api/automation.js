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

    var sessionId = body.sessionId || null;

    var apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return respond({ error: 'AI service not configured' }, 503);
    }

    // 8b for first 2 questions only — 70b from turn 3+ since the model may generate the diagram early
    var userTurns = messages.filter(function (m) { return m.role === 'user'; }).length;
    var model = userTurns <= 2 ? 'llama3-8b-8192' : 'llama-3.3-70b-versatile';
    var maxTokens = userTurns <= 2 ? 120 : 1000;

    var groqMessages = [{ role: 'system', content: buildPrompt() }].concat(messages);

    // Try Groq with streaming first
    var aiRes;
    var groqOk = false;
    try {
      aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: model, messages: groqMessages, max_tokens: maxTokens, temperature: 0.3, stream: true }),
      });
      if (aiRes.ok) groqOk = true;
    } catch (e) { /* fall through to NVIDIA */ }

    // If Groq failed, fall back to NVIDIA (non-streaming)
    if (!groqOk) {
      var nvidiaKey = env.NVIDIA_API_KEY_13B;
      if (!nvidiaKey) return respond({ error: 'AI service unavailable' }, 503);
      try {
        var nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + nvidiaKey },
          body: JSON.stringify({ model: 'meta/llama-3.3-70b-instruct', messages: groqMessages, max_tokens: maxTokens, temperature: 0.3 }),
        });
        var nvidiaText = await nvidiaRes.text();
        if (!nvidiaRes.ok) return respond({ error: 'AI fallback ' + nvidiaRes.status }, 502);
        var nvidiaData = JSON.parse(nvidiaText);
        var fallbackReply = nvidiaData.choices[0].message.content.trim();
        await writeKV(context, env, request, body, sessionId, messages, fallbackReply);
        return streamText(fallbackReply);
      } catch (e) {
        return respond({ error: 'All AI providers failed: ' + String(e) }, 502);
      }
    }

    // Stream Groq SSE response to client, accumulate for KV
    var kv = env.AUTOMATION_KV;
    var cf = request.cf || {};
    var ua = request.headers.get('user-agent') || '';

    var { readable, writable } = new TransformStream();
    var writer = writable.getWriter();
    var encoder = new TextEncoder();

    context.waitUntil((async function () {
      var reader = aiRes.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';
      var fullReply = '';
      try {
        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          buf += decoder.decode(chunk.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop();
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (!line.startsWith('data: ')) continue;
            var raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;
            try {
              var token = JSON.parse(raw).choices[0].delta.content || '';
              if (token) {
                fullReply += token;
                await writer.write(encoder.encode(token));
              }
            } catch (e) {}
          }
        }
      } finally {
        await writer.close();
      }
      await writeKV(context, env, request, body, sessionId, messages, fullReply);
    })());

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });

  } catch (e) {
    return respond({ error: 'Crash: ' + String(e) }, 500);
  }
}

function parseUA(ua) {
  var browser = 'Other', os = 'Other';
  if (ua.indexOf('Edg') !== -1) browser = 'Edge';
  else if (ua.indexOf('OPR') !== -1 || ua.indexOf('Opera') !== -1) browser = 'Opera';
  else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('Safari') !== -1) browser = 'Safari';

  if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';
  else if (ua.indexOf('Android') !== -1) os = 'Android';
  else if (ua.indexOf('Windows') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac OS') !== -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';

  return { browser: browser, os: os };
}

function buildPrompt() {
  return 'You are a senior automation consultant at Arzisoft having a discovery call with a potential client.'
    + ' Your goal: ask exactly 3 smart questions, then generate a technical automation diagram so impressive they immediately want to contact us to build it.'
    + '\n\nCONVERSATION FLOW - follow this exactly:'
    + '\n\nStep 1 - When the user sends their FIRST message: Ask Question 1 in a warm expert tone.'
    + '\nExample Q1: "Got it. Walk me through the exact steps - what platform does the data come from, and where does it need to end up?"'
    + '\n\nStep 2 - After Q1 answer: Ask Question 2 about scale.'
    + '\nExample Q2: "And roughly how many times does this happen per day - and how long does each round take you?"'
    + '\n\nStep 3 - After Q2 answer: Ask Question 3 about failure cost.'
    + '\nExample Q3: "Last one - what is the real cost when this goes wrong or gets delayed? A missed invoice? An angry client? A cash flow gap?"'
    + '\n\nStep 4 - After Q3 answer: generate the full output immediately. No more questions.'
    + '\n\nGENERATION RULES:'
    + '\n- Use their exact context: real platform names, real data types, real pain points'
    + '\n- Add steps they did NOT mention but clearly needed: validation, duplicate detection, error retries, audit logging'
    + '\n- Add an AI processing step where applicable (language detection, OCR, data extraction, classification)'
    + '\n- Summary must quantify ROI: hours saved per week, errors eliminated'
    + '\n- Aim for 10-12 nodes to show real engineering complexity'
    + '\n\nNODE LABEL STYLE: Plain business language. No technical jargon. Write what actually happens in plain words.'
    + '\nExamples: "New WhatsApp message arrives" / "Is this an invoice?" / "Pull out order details" / "Save to Excel" / "Send confirmation to client" / "Something went wrong - retry" / "Mark as done"'
    + '\nKeep each label under 6 words. No special characters.'
    + '\n\nOUTPUT FORMAT after 3 answers - output ONLY this, nothing before or after:'
    + '\n\n---SUMMARY---'
    + '\n[2-3 sentences. Name the specific platforms. Quantify the impact.]'
    + '\n\n---TIMELINE---'
    + '\n[Minimum 1 week. Format: "1-2 weeks" etc.]'
    + '\n\n---DIAGRAM---'
    + '\n```mermaid'
    + '\nflowchart TD'
    + '\n[your diagram here]'
    + '\n```'
    + '\n---END---'
    + '\n\nMERMAID RULES: flowchart TD only. Regular: A[Save to Excel]. Decision: A{Is this an invoice?}. Start: A([New message arrives]). End: Z([Done]). Arrows: A --> B or A -->|Yes| B. Max 12 nodes. No special chars.';
}

function extractCategory(messages) {
  var text = messages.map(function (m) { return m.content || ''; }).join(' ').toLowerCase();
  var src = 'general';
  var sources = [['whatsapp','whatsapp'],['telegram','telegram'],['gmail','email'],['email','email'],['form','form'],['sms','sms'],['invoice','invoice']];
  var dests = [['google sheets','gsheets'],['excel','excel'],['quickbooks','accounting'],['xero','accounting'],['accounting','accounting'],['zoho','crm'],['salesforce','crm'],['crm','crm'],['notion','notion']];
  for (var i = 0; i < sources.length; i++) { if (text.indexOf(sources[i][0]) !== -1) { src = sources[i][1]; break; } }
  var dst = 'general';
  for (var j = 0; j < dests.length; j++) { if (text.indexOf(dests[j][0]) !== -1) { dst = dests[j][1]; break; } }
  return src + '--' + dst;
}

function streamText(text) {
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}

async function writeKV(context, env, request, body, sessionId, messages, reply) {
  var isDiagram = reply.indexOf('---SUMMARY---') !== -1;
  var kv = env.AUTOMATION_KV;
  if (!kv) return;

  if (sessionId) {
    var cf = request.cf || {};
    var ua = request.headers.get('user-agent') || '';
    var parsed = parseUA(ua);
    var entry = {
      sessionId: sessionId,
      message: messages[0] && messages[0].content ? messages[0].content : '',
      messages: messages,
      reply: isDiagram ? reply : null,
      category: extractCategory(messages),
      questionsAnswered: messages.filter(function (m) { return m.role === 'user'; }).length,
      completed: isDiagram,
      contacted: false,
      createdAt: body.createdAt || new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      country: cf.country || null, city: cf.city || null, region: cf.region || null, timezone: cf.timezone || null,
      org: cf.asOrganization || null,
      deviceType: cf.deviceType || null, browser: parsed.browser, os: parsed.os,
      referrer: request.headers.get('referer') || null,
      timeSpent: null, popupShown: false, popupDismissed: false, scrolledToDiagram: false, scrollDepth: null,
    };
    context.waitUntil(kv.put('session:' + sessionId, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 180 }));
  } else if (isDiagram) {
    var legacyKey = 'log:' + Date.now() + ':' + Math.random().toString(36).slice(2, 6);
    context.waitUntil(kv.put(legacyKey, JSON.stringify({
      message: messages[0] && messages[0].content ? messages[0].content : '',
      messages: messages, reply: reply, category: extractCategory(messages),
      contacted: false, createdAt: new Date().toISOString(),
    }), { expirationTtl: 60 * 60 * 24 * 180 }));
  }
}

function respond(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
