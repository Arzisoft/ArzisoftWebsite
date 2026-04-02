export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { name, email, phone, summary, complexity } = body;
  if (!name || !email) {
    return json({ error: 'Name and email are required' }, 400);
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return json({ error: 'Email service not configured' }, 503);
  }

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff;">
      <div style="margin-bottom:32px;">
        <div style="display:inline-block;background:#1a1a1a;color:#fff;padding:8px 16px;border-radius:99px;font-size:13px;font-weight:600;margin-bottom:20px;">
          New Automation Request
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 8px;letter-spacing:-0.02em;">
          ${escapeHtml(name)} wants to automate their business
        </h1>
        <p style="font-size:15px;color:#6b7280;margin:0;">Submitted via the Automation Flow Designer on arzisoft.com</p>
      </div>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Contact Details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;width:80px;">Name</td><td style="padding:6px 0;font-size:14px;font-weight:500;color:#1a1a1a;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Email</td><td style="padding:6px 0;font-size:14px;font-weight:500;color:#1a1a1a;"><a href="mailto:${escapeHtml(email)}" style="color:#3b82f6;">${escapeHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Phone</td><td style="padding:6px 0;font-size:14px;font-weight:500;color:#1a1a1a;">${escapeHtml(phone)}</td></tr>` : ''}
        </table>
      </div>

      ${summary ? `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Automation Summary</p>
        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;">${escapeHtml(summary)}</p>
        ${complexity ? `<p style="margin:12px 0 0;font-size:13px;font-weight:600;color:#1a1a1a;">Complexity: ${escapeHtml(complexity)}</p>` : ''}
      </div>
      ` : ''}

      <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">Arzisoft Automation Flow Designer &mdash; arzisoft.com</p>
      </div>
    </div>
  `;

  let resendRes;
  try {
    resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Arzisoft <onboarding@resend.dev>',
        to: ['arzisoft@arzisoft.com'],
        reply_to: email,
        subject: `Automation Request — ${name}`,
        html,
      }),
    });
  } catch {
    return json({ error: 'Failed to reach email service' }, 502);
  }

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error('Resend error:', err);
    return json({ error: 'Failed to send email' }, 502);
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
