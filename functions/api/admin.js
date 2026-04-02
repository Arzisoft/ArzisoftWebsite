export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  var body;
  try {
    body = await request.json();
  } catch (e) {
    return respond({ error: 'Invalid body' }, 400);
  }

  var action   = body.action;
  var password = env.ADMIN_PASSWORD;
  var kv       = env.AUTOMATION_KV;

  if (!password) {
    return respond({ error: 'Admin not configured' }, 503);
  }

  // Login
  if (action === 'login') {
    if (body.password !== password) {
      return respond({ error: 'Unauthorized' }, 401);
    }
    // Simple token: hash of password + secret salt
    var token = await sha256(password + (env.ADMIN_SALT || 'arzisoft-admin-2026'));
    return respond({ token: token });
  }

  // Data access
  if (action === 'logs') {
    var expected = await sha256(password + (env.ADMIN_SALT || 'arzisoft-admin-2026'));
    if (body.token !== expected) {
      return respond({ error: 'Unauthorized' }, 401);
    }

    if (!kv) {
      return respond({ logs: [], kv_available: false, note: 'KV not configured' });
    }

    // List all log entries (prefix: log:)
    var listed = await kv.list({ prefix: 'log:' });
    var keys = listed.keys || [];

    // Fetch up to 200 most recent entries
    keys = keys.slice(-200).reverse();

    var logs = [];
    for (var i = 0; i < keys.length; i++) {
      try {
        var val = await kv.get(keys[i].name, 'json');
        if (val) logs.push(val);
      } catch (e) { /* skip */ }
    }

    // Sort newest first
    logs.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return respond({ logs: logs, kv_available: true });
  }

  // KV connectivity test
  if (action === 'test-kv') {
    var expected2 = await sha256(password + (env.ADMIN_SALT || 'arzisoft-admin-2026'));
    if (body.token !== expected2) return respond({ error: 'Unauthorized' }, 401);
    if (!kv) return respond({ ok: false, error: 'AUTOMATION_KV binding not found' });
    var testKey = 'test:' + Date.now();
    try {
      await kv.put(testKey, 'ok', { expirationTtl: 60 });
      var readBack = await kv.get(testKey);
      await kv.delete(testKey);
      return respond({ ok: readBack === 'ok', read_back: readBack });
    } catch (e) {
      return respond({ ok: false, error: String(e) });
    }
  }

  return respond({ error: 'Unknown action' }, 400);
}

async function sha256(message) {
  var encoder = new TextEncoder();
  var data = encoder.encode(message);
  var hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(function (b) {
    return b.toString(16).padStart(2, '0');
  }).join('');
}

function respond(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
