export async function onRequestPost(context) {
  var request = context.request;

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

  // TEST: return hardcoded response to confirm function routing works
  return respond({
    reply: '---SUMMARY---\nTest response. The function is running.\n---TIMELINE---\n1 week\n---DIAGRAM---\n```mermaid\nflowchart TD\n    A([TRIGGER: Test]) --> B[FETCH: Data] --> Z([END])\n```\n---END---'
  });
}

function respond(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
