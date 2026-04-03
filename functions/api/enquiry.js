export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return json({ error: 'Name, email and message are required' }, 400);
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return json({ error: 'Email service not configured' }, 503);
  }

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff;">
      <div style="margin-bottom:32px;">
        <div style="display:inline-block;background:#1a1a1a;color:#fff;padding:8px 16px;border-radius:99px;font-size:13px;font-weight:600;margin-bottom:20px;">
          New Enquiry
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 8px;letter-spacing:-0.02em;">
          ${escapeHtml(name)} sent you a message
        </h1>
        <p style="font-size:15px;color:#6b7280;margin:0;">Via arzisoft.com</p>
      </div>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Contact</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:60px;">Name</td><td style="padding:6px 0;font-size:14px;font-weight:500;color:#1a1a1a;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Email</td><td style="padding:6px 0;font-size:14px;font-weight:500;color:#1a1a1a;"><a href="mailto:${escapeHtml(email)}" style="color:#3b82f6;">${escapeHtml(email)}</a></td></tr>
        </table>
      </div>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Message</p>
        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">arzisoft.com</p>
      </div>
    </div>
  `;

  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: 'Arzisoft <notifications@arzisoft.com>',
        to: ['hello@arzisoft.com'],
        reply_to: email,
        subject: `Enquiry from ${name}`,
        html,
      }),
    });
  } catch {
    return json({ error: 'Failed to reach email service' }, 502);
  }

  if (!res.ok) {
    const err = await res.text();
    return json({ error: 'Failed to send: ' + err }, 502);
  }

  return json({ success: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
