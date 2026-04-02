document.addEventListener('DOMContentLoaded', function () {
  var loginDiv  = document.getElementById('adminLogin');
  var dashDiv   = document.getElementById('adminDash');
  var loginForm = document.getElementById('loginForm');
  var pwInput   = document.getElementById('adminPassword');
  var loginErr  = document.getElementById('loginError');
  var logoutBtn  = document.getElementById('logoutBtn');
  var testKvBtn  = document.getElementById('testKvBtn');
  var statsEl   = document.getElementById('adminStats');
  var tbody     = document.getElementById('adminTableBody');
  var modal     = document.getElementById('adminModal');
  var modalContent = document.getElementById('modalContent');
  var modalClose = document.getElementById('modalClose');

  var TOKEN_KEY = '_arz_admin';
  var allLogs = [];

  // Check existing session
  if (sessionStorage.getItem(TOKEN_KEY)) {
    showDash(sessionStorage.getItem(TOKEN_KEY));
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = pwInput.value.trim();
    if (!pw) return;

    fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password: pw }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.token) {
          sessionStorage.setItem(TOKEN_KEY, d.token);
          showDash(d.token);
        } else {
          loginErr.style.display = 'block';
          pwInput.value = '';
          pwInput.focus();
        }
      })
      .catch(function () {
        loginErr.textContent = 'Connection error.';
        loginErr.style.display = 'block';
      });
  });

  testKvBtn.addEventListener('click', function () {
    var token = sessionStorage.getItem(TOKEN_KEY);
    testKvBtn.disabled = true;
    testKvBtn.textContent = 'Testing...';
    fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test-kv', token: token }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        testKvBtn.disabled = false;
        testKvBtn.innerHTML = '<i data-lucide="database" style="width:14px;height:14px;"></i> Test Storage';
        lucide.createIcons();
        alert(d.ok ? 'KV storage is working correctly.' : 'KV error: ' + (d.error || JSON.stringify(d)));
      })
      .catch(function () {
        testKvBtn.disabled = false;
        testKvBtn.innerHTML = '<i data-lucide="database" style="width:14px;height:14px;"></i> Test Storage';
        lucide.createIcons();
        alert('Connection error during KV test.');
      });
  });

  logoutBtn.addEventListener('click', function () {
    sessionStorage.removeItem(TOKEN_KEY);
    dashDiv.style.display = 'none';
    loginDiv.style.display = 'flex';
    pwInput.value = '';
    loginErr.style.display = 'none';
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    modal.style.display = 'none';
    modalContent.innerHTML = '';
  }

  function openModal(log) {
    modalContent.innerHTML = renderDetail(log);
    lucide.createIcons();
    modal.style.display = 'block';

    // Render mermaid diagram if present
    var diagramCode = extractSection(log.reply || '', 'DIAGRAM');
    if (diagramCode) {
      var match = diagramCode.match(/```mermaid\s*([\s\S]*?)```/);
      var code = match ? match[1].trim() : diagramCode.trim();
      var el = document.getElementById('modalDiagram');
      if (el && window._mermaid) {
        window._mermaid.render('admin-diagram-' + Date.now(), code).then(function (result) {
          el.innerHTML = result.svg;
        }).catch(function (err) {
          el.innerHTML = '<pre style="font-size:12px;color:var(--text-muted);">' + escHtml(code) + '</pre>';
        });
      }
    }
  }

  function renderDetail(log) {
    var date = new Date(log.createdAt);
    var time = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    var summary = extractSection(log.reply || '', 'SUMMARY');
    var timeline = extractSection(log.reply || '', 'TIMELINE');
    var hasDiagram = (log.reply || '').indexOf('```mermaid') !== -1;

    var html = '';

    // Header
    html += '<div style="margin-bottom:28px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">';
    html += '<span class="admin-cat">' + escHtml(log.category || '—') + '</span>';
    html += '<span style="font-size:12px;color:var(--text-muted);">' + time + '</span>';
    html += '</div>';
    html += '<h2 style="font-size:20px;font-weight:700;color:var(--text-primary);letter-spacing:-0.01em;">' + escHtml(log.message || '—') + '</h2>';
    html += '</div>';

    // Conversation
    if (log.messages && log.messages.length > 0) {
      html += '<div style="margin-bottom:28px;">';
      html += '<h3 style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Conversation</h3>';
      html += '<div style="display:flex;flex-direction:column;gap:10px;">';
      log.messages.forEach(function (msg) {
        var isUser = msg.role === 'user';
        var label = isUser ? 'Client' : 'Arzisoft AI';
        var bg = isUser ? 'var(--bg-muted)' : 'rgba(0,0,0,0.03)';
        var align = isUser ? 'flex-start' : 'flex-end';
        html += '<div style="display:flex;flex-direction:column;align-items:' + align + ';">';
        html += '<span style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">' + label + '</span>';
        html += '<div style="background:' + bg + ';border:1px solid var(--border);border-radius:10px;padding:10px 14px;max-width:85%;font-size:13px;color:var(--text-secondary);line-height:1.6;">';
        html += escHtml(msg.content || '');
        html += '</div></div>';
      });
      html += '</div></div>';
    }

    // Metadata grid
    var meta = [];
    if (log.country || log.city)  meta.push(['Location',   [log.city, log.region, log.country].filter(Boolean).join(', ')]);
    if (log.org)                  meta.push(['ISP / Org',  log.org]);
    if (log.timezone)             meta.push(['Timezone',   log.timezone]);
    if (log.deviceType)           meta.push(['Device',     log.deviceType]);
    if (log.browser || log.os)    meta.push(['Browser',    [log.browser, log.os].filter(Boolean).join(' / ')]);
    if (log.referrer)             meta.push(['Came from',  log.referrer]);
    if (log.questionsAnswered != null) meta.push(['Questions answered', log.questionsAnswered + ' / 3']);
    if (log.timeSpent != null)    meta.push(['Time on page', log.timeSpent + 's']);
    if (log.scrollDepth != null)  meta.push(['Scroll depth', log.scrollDepth + '%']);
    meta.push(['Popup shown',     log.popupShown ? 'Yes' : 'No']);
    if (log.popupShown)           meta.push(['Popup dismissed', log.popupDismissed ? 'Yes (ignored)' : 'No (submitted or pending)']);

    if (meta.length > 0) {
      html += '<div style="margin-bottom:28px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
      meta.forEach(function (item) {
        html += '<div style="background:var(--bg-muted);border:1px solid var(--border);border-radius:8px;padding:10px 14px;">';
        html += '<div style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">' + escHtml(item[0]) + '</div>';
        html += '<div style="font-size:13px;color:var(--text-secondary);word-break:break-all;">' + escHtml(String(item[1])) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Summary
    if (summary) {
      html += '<div style="margin-bottom:20px;padding:16px 20px;background:var(--bg-muted);border-radius:10px;border:1px solid var(--border);">';
      html += '<h3 style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Summary</h3>';
      html += '<p style="font-size:14px;color:var(--text-secondary);line-height:1.7;margin:0;">' + escHtml(summary.trim()) + '</p>';
      if (timeline) {
        html += '<p style="font-size:13px;color:var(--text-muted);margin-top:8px;margin-bottom:0;">Ready in: <strong style="color:var(--text-primary);">' + escHtml(timeline.trim()) + '</strong></p>';
      }
      html += '</div>';
    }

    // Diagram
    if (hasDiagram) {
      html += '<div>';
      html += '<h3 style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Automation Flow</h3>';
      html += '<div id="modalDiagram" style="overflow-x:auto;border:1px solid var(--border);border-radius:10px;padding:20px;background:var(--bg-muted);text-align:center;">Rendering diagram...</div>';
      html += '</div>';
    }

    return html;
  }

  function extractSection(text, name) {
    var start = text.indexOf('---' + name + '---');
    if (start === -1) return null;
    start += ('---' + name + '---').length;
    var nextMarker = text.indexOf('---', start + 1);
    var end = nextMarker !== -1 ? nextMarker : text.length;
    return text.slice(start, end).trim();
  }

  function showDash(token) {
    loginDiv.style.display = 'none';
    dashDiv.style.display = 'block';
    lucide.createIcons();
    loadData(token);
  }

  function loadData(token) {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-table__empty">Loading...</td></tr>';

    fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logs', token: token }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.logs) {
          sessionStorage.removeItem(TOKEN_KEY);
          dashDiv.style.display = 'none';
          loginDiv.style.display = 'flex';
          return;
        }

        if (d.kv_available === false) {
          var warn = document.getElementById('kvWarning');
          if (warn) warn.style.display = 'block';
        }

        allLogs = d.logs;
        var total = allLogs.length;
        var contacted = allLogs.filter(function (l) { return l.contacted; }).length;
        var categories = {};
        allLogs.forEach(function (l) {
          categories[l.category] = (categories[l.category] || 0) + 1;
        });
        var topCat = Object.keys(categories).sort(function (a, b) { return categories[b] - categories[a]; })[0] || '—';

        statsEl.innerHTML =
          stat(total, 'Total flows generated') +
          stat(contacted, 'Submitted contact form') +
          stat(topCat, 'Top automation category');

        if (allLogs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="admin-table__empty">No data yet.</td></tr>';
          return;
        }

        tbody.innerHTML = allLogs.map(function (log, i) {
          var date = new Date(log.createdAt);
          var time = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          var badge = log.contacted
            ? '<span class="admin-badge admin-badge--contacted">Contacted</span>'
            : log.completed
              ? '<span class="admin-badge admin-badge--lead">Flow Generated</span>'
              : '<span class="admin-badge admin-badge--partial">Partial</span>';
          var location = [log.city, log.country].filter(Boolean).join(', ') || '—';
          var questions = log.questionsAnswered != null ? log.questionsAnswered + '/3' : '—';
          return '<tr class="admin-row" data-idx="' + i + '" style="cursor:pointer;">'
            + '<td style="white-space:nowrap;color:var(--text-muted);">' + time + '</td>'
            + '<td><span class="admin-cat">' + escHtml(log.category || '—') + '</span></td>'
            + '<td style="font-size:12px;color:var(--text-muted);">' + escHtml(location) + '</td>'
            + '<td class="admin-msg">' + escHtml(log.message || '—') + '</td>'
            + '<td style="white-space:nowrap;font-size:12px;color:var(--text-muted);">' + questions + '</td>'
            + '<td>' + badge + '</td>'
            + '</tr>';
        }).join('');

        // Row click → open detail modal
        tbody.querySelectorAll('.admin-row').forEach(function (row) {
          row.addEventListener('click', function () {
            var idx = parseInt(row.getAttribute('data-idx'), 10);
            openModal(allLogs[idx]);
          });
        });
      })
      .catch(function () {
        tbody.innerHTML = '<tr><td colspan="6" class="admin-table__empty">Failed to load data.</td></tr>';
      });
  }

  function stat(val, label) {
    return '<div class="stat-card"><div class="stat-card__value">' + val + '</div><div class="stat-card__label">' + label + '</div></div>';
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
});
