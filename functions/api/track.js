export async function onRequestPost(context) {
  try {
    var body = await context.request.json();
    var kv = context.env.AUTOMATION_KV;
    if (!kv || !body.sessionId) return new Response('ok');

    var key = 'session:' + body.sessionId;
    var existing = await kv.get(key, 'json');
    if (!existing) return new Response('ok');

    if (body.timeSpent != null)         existing.timeSpent        = body.timeSpent;
    if (body.popupShown != null)        existing.popupShown       = body.popupShown;
    if (body.popupDismissed != null)    existing.popupDismissed   = body.popupDismissed;
    if (body.scrolledToDiagram != null) existing.scrolledToDiagram = body.scrolledToDiagram;
    if (body.scrollDepth != null)       existing.scrollDepth      = body.scrollDepth;

    context.waitUntil(
      kv.put(key, JSON.stringify(existing), { expirationTtl: 60 * 60 * 24 * 180 })
    );
  } catch (e) { /* silent — analytics must never break the page */ }

  return new Response('ok');
}
