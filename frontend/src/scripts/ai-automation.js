document.addEventListener('DOMContentLoaded', function () {
  var input      = document.getElementById('chatInput');
  var send       = document.getElementById('chatSend');
  var messages   = document.getElementById('chatMessages');
  var resetBtn   = document.getElementById('resetBtn');
  var outputEmpty  = document.getElementById('outputEmpty');
  var outputResult = document.getElementById('outputResult');
  var outputSummary      = document.getElementById('outputSummary');
  var outputDiagram      = document.getElementById('outputDiagram');
  var diagramError       = document.getElementById('diagramError');
  var diagramMeta        = document.getElementById('diagramMeta');
  var outputTimeline     = document.getElementById('outputTimeline');
  var outputTimelineWrap = document.getElementById('outputTimelineWrap');
  var modalOverlay     = document.getElementById('modalOverlay');
  var modalClose       = document.getElementById('modalClose');
  var modalSummary     = document.getElementById('modalSummary');
  var contactForm      = document.getElementById('contactForm');
  var submitBtn        = document.getElementById('submitBtn');
  var modalError       = document.getElementById('modalError');
  var modalSuccess     = document.getElementById('modalSuccess');

  // Conversation history sent to Claude
  var history = [];
  var popupTriggered = false;

  // Session tracking
  var sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  var sessionStart = Date.now();
  var createdAt = new Date().toISOString();
  var trackState = { popupShown: false, popupDismissed: false, scrolledToDiagram: false, scrollDepth: 0 };

  function sendTrack() {
    var payload = {
      sessionId: sessionId,
      timeSpent: Math.round((Date.now() - sessionStart) / 1000),
      popupShown: trackState.popupShown,
      popupDismissed: trackState.popupDismissed,
      scrolledToDiagram: trackState.scrolledToDiagram,
      scrollDepth: trackState.scrollDepth,
    };
    var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/track', blob);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendTrack();
  });

  window.addEventListener('scroll', function () {
    var depth = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
    if (depth > trackState.scrollDepth) trackState.scrollDepth = depth;
  }, { passive: true });

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'base',
    themeVariables: {
      background: '#ffffff',
      primaryColor: '#f8fafc',
      primaryTextColor: '#0f172a',
      primaryBorderColor: '#1e293b',
      lineColor: '#3b82f6',
      secondaryColor: '#f1f5f9',
      tertiaryColor: '#e2e8f0',
      edgeLabelBackground: '#ffffff',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      fontSize: '11px',
      clusterBkg: '#f8fafc',
      clusterBorder: '#1e293b',
    }
  });

  // Send button active state
  input.addEventListener('input', function () {
    send.classList.toggle('active', input.value.trim().length > 0);
  });

  function appendMessage(role, html, isHTML) {
    var msg = document.createElement('div');
    msg.className = 'message' + (role === 'human' ? ' message--human' : '');

    var avatar = document.createElement('div');
    avatar.className = 'message__avatar message__avatar--' + role;
    var icon = document.createElement('i');
    icon.setAttribute('data-lucide', role === 'ai' ? 'bot' : 'user');
    icon.style.cssText = 'width:15px;height:15px;';
    avatar.appendChild(icon);

    var bubble = document.createElement('div');
    bubble.className = 'message__bubble message__bubble--' + role;
    if (isHTML) {
      bubble.innerHTML = html;
    } else {
      bubble.textContent = html;
    }

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    messages.appendChild(msg);
    lucide.createIcons();
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  function parseAndRender(reply) {
    // Check if reply contains the output markers
    if (reply.indexOf('---SUMMARY---') === -1) return false;

    var summaryMatch  = reply.match(/---SUMMARY---([\s\S]*?)---TIMELINE---/);
    var timelineMatch = reply.match(/---TIMELINE---([\s\S]*?)---DIAGRAM---/);
    var diagramMatch  = reply.match(/```mermaid([\s\S]*?)```/);

    if (!summaryMatch || !diagramMatch) return false;

    var summary  = summaryMatch[1].trim();
    var timeline = timelineMatch ? timelineMatch[1].trim() : '';
    var diagram  = diagramMatch[1].trim();

    // Summary
    outputSummary.textContent = summary;

    // Timeline
    if (timeline) {
      outputTimeline.textContent = timeline;
      outputTimelineWrap.style.display = 'flex';
    }

    // Diagram topbar meta
    var nodeCount = (diagram.match(/\[|\{|\(\[/g) || []).length;
    diagramMeta.textContent = nodeCount + ' nodes · generated ' + new Date().toLocaleTimeString();

    // Render Mermaid diagram
    diagramError.style.display = 'none';
    outputDiagram.innerHTML = '';
    var id = 'mermaid-' + Date.now();
    try {
      mermaid.render(id, diagram).then(function (result) {
        outputDiagram.innerHTML = result.svg;
        outputDiagram.querySelectorAll('.flowchart-link, path.edge-path').forEach(function (path) {
          path.style.strokeDasharray = '6 4';
          path.style.animation = 'flowDash 0.5s linear infinite';
        });
      }).catch(function () {
        diagramError.style.display = 'block';
        outputDiagram.innerHTML = '<pre style="font-size:11px;color:var(--text-muted);white-space:pre-wrap;font-family:monospace;">' + diagram + '</pre>';
      });
    } catch (e) {
      diagramError.style.display = 'block';
    }

    // Store for modal
    window._autoSummary = summary;

    // Show output panel
    outputEmpty.style.display = 'none';
    outputResult.style.display = 'flex';

    // Schedule popup after user scrolls to diagram
    schedulePopup();

    return true;
  }

  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;

    appendMessage('human', text, false);
    history.push({ role: 'user', content: text });
    input.value = '';
    send.classList.remove('active');

    var typing = appendMessage('ai', 'Thinking...', false);
    typing.setAttribute('data-typing', '1');

    var bubble = typing.querySelector('.message__bubble');
    bubble.textContent = '';

    fetch('/api/automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, sessionId: sessionId, createdAt: createdAt }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) { throw new Error(res.status + ': ' + t.slice(0, 120)); });
        }
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var fullText = '';

        function readChunk() {
          return reader.read().then(function (result) {
            if (result.done) return fullText;
            var chunk = decoder.decode(result.value, { stream: true });
            fullText += chunk;
            // Stream question text live; show a fixed label while diagram is generating
            if (fullText.indexOf('---SUMMARY---') === -1) {
              bubble.textContent = fullText;
            } else {
              bubble.textContent = 'Generating your automation flow...';
            }
            messages.scrollTop = messages.scrollHeight;
            return readChunk();
          });
        }

        return readChunk();
      })
      .then(function (reply) {
        history.push({ role: 'assistant', content: reply });
        var isDiagram = parseAndRender(reply);
        if (isDiagram) {
          bubble.innerHTML = 'Your automation flow is ready. Check the panel on the right.<br><br><span class="example-hint">Scroll down to see the diagram and contact us to build it.</span>';
        } else {
          bubble.textContent = reply;
        }
        typing.removeAttribute('data-typing');
        messages.scrollTop = messages.scrollHeight;
      })
      .catch(function (err) {
        bubble.textContent = 'Error: ' + (err && err.message ? err.message : 'Connection failed. Please try again.');
        typing.removeAttribute('data-typing');
      });
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });

  // Modal open
  function openModal() {
    trackState.popupShown = true;
    if (window._autoSummary) {
      modalSummary.textContent = window._autoSummary;
      modalSummary.classList.add('visible');
    }
    contactForm.style.display = 'flex';
    modalSuccess.style.display = 'none';
    modalError.style.display = 'none';
    modalOverlay.classList.add('open');
    lucide.createIcons();
  }

  function schedulePopup() {
    if (popupTriggered) return;
    function onScroll() {
      var distFromBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      if (distFromBottom < 60 && !popupTriggered) {
        popupTriggered = true;
        trackState.scrolledToDiagram = true;
        window.removeEventListener('scroll', onScroll);
        openModal();
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Modal close
  function closeModal() {
    if (modalOverlay.classList.contains('open') && !trackState.formSubmitted) {
      trackState.popupDismissed = true;
    }
    modalOverlay.classList.remove('open');
  }
  modalClose.addEventListener('click', closeModal);
  var overlayMousedownOnBackdrop = false;
  modalOverlay.addEventListener('mousedown', function (e) {
    overlayMousedownOnBackdrop = e.target === modalOverlay;
  });
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay && overlayMousedownOnBackdrop) closeModal();
  });

  // Contact strip button
  var contactStripBtn = document.getElementById('contactStripBtn');
  if (contactStripBtn) {
    contactStripBtn.addEventListener('click', openModal);
  }

  // Form submit
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = document.getElementById('fieldName').value.trim();
    var email = document.getElementById('fieldEmail').value.trim();
    var phone = document.getElementById('fieldPhone').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    modalError.style.display = 'none';

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        name: name,
        email: email,
        phone: phone,
        summary: window._autoSummary || '',
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          trackState.formSubmitted = true;
          contactForm.style.display = 'none';
          modalSuccess.style.display = 'flex';
          lucide.createIcons();
        } else {
          modalError.textContent = data.error || 'Something went wrong. Please try again.';
          modalError.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="send" style="width:15px;height:15px;"></i> Send request';
          lucide.createIcons();
        }
      })
      .catch(function () {
        modalError.textContent = 'Connection error. Please try again.';
        modalError.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="send" style="width:15px;height:15px;"></i> Send request';
        lucide.createIcons();
      });
  });

  resetBtn.addEventListener('click', function () {
    history = [];
    popupTriggered = false;
    sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStart = Date.now();
    createdAt = new Date().toISOString();
    trackState = { popupShown: false, popupDismissed: false, scrolledToDiagram: false, scrollDepth: 0, formSubmitted: false };
    messages.innerHTML = '';
    outputEmpty.style.display = 'flex';
    outputResult.style.display = 'none';
    outputDiagram.innerHTML = '';
    appendMessage('ai', 'Describe any manual task and I\'ll generate your full automation flow instantly — no back and forth.\n\nExample: "Every morning I get WhatsApp invoices and manually enter them into an Excel sheet."', false);
  });
});
