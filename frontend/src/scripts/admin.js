document.addEventListener('DOMContentLoaded', function () {
  var loginDiv  = document.getElementById('adminLogin');
  var dashDiv   = document.getElementById('adminDash');
  var loginForm = document.getElementById('loginForm');
  var pwInput   = document.getElementById('adminPassword');
  var loginErr  = document.getElementById('loginError');
  var logoutBtn = document.getElementById('logoutBtn');
  var statsEl   = document.getElementById('adminStats');
  var tbody     = document.getElementById('adminTableBody');

  var TOKEN_KEY = '_arz_admin';

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

  logoutBtn.addEventListener('click', function () {
    sessionStorage.removeItem(TOKEN_KEY);
    dashDiv.style.display = 'none';
    loginDiv.style.display = 'flex';
    pwInput.value = '';
    loginErr.style.display = 'none';
  });

  function showDash(token) {
    loginDiv.style.display = 'none';
    dashDiv.style.display = 'block';
    lucide.createIcons();
    loadData(token);
  }

  function loadData(token) {
    tbody.innerHTML = '<tr><td colspan="4" class="admin-table__empty">Loading...</td></tr>';

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

        var logs = d.logs;
        var total = logs.length;
        var contacted = logs.filter(function (l) { return l.contacted; }).length;
        var categories = {};
        logs.forEach(function (l) {
          categories[l.category] = (categories[l.category] || 0) + 1;
        });
        var topCat = Object.keys(categories).sort(function (a, b) { return categories[b] - categories[a]; })[0] || '—';

        statsEl.innerHTML =
          stat(total, 'Total flows generated') +
          stat(contacted, 'Submitted contact form') +
          stat(topCat, 'Top automation category');

        if (logs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="admin-table__empty">No data yet.</td></tr>';
          return;
        }

        tbody.innerHTML = logs.map(function (log) {
          var date = new Date(log.createdAt);
          var time = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          var badge = log.contacted
            ? '<span class="admin-badge admin-badge--contacted">Contacted</span>'
            : '<span class="admin-badge admin-badge--lead">Lead</span>';
          return '<tr>'
            + '<td style="white-space:nowrap;color:var(--text-muted);">' + time + '</td>'
            + '<td><span class="admin-cat">' + (log.category || '—') + '</span></td>'
            + '<td class="admin-msg">' + escHtml(log.message || '—') + '</td>'
            + '<td>' + badge + '</td>'
            + '</tr>';
        }).join('');
      })
      .catch(function () {
        tbody.innerHTML = '<tr><td colspan="4" class="admin-table__empty">Failed to load data.</td></tr>';
      });
  }

  function stat(val, label) {
    return '<div class="stat-card"><div class="stat-card__value">' + val + '</div><div class="stat-card__label">' + label + '</div></div>';
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
});
