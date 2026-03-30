document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('chatInput');
  var send = document.getElementById('chatSend');
  var messages = document.getElementById('chatMessages');
  var modelBtn = document.getElementById('modelBtn');
  var modelMenu = document.getElementById('modelMenu');
  var modelLabel = document.getElementById('modelLabel');

  // Model dropdown toggle
  modelBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    modelMenu.classList.toggle('open');
  });
  document.addEventListener('click', function () {
    modelMenu.classList.remove('open');
  });
  modelMenu.querySelectorAll('.model-item').forEach(function (item) {
    item.addEventListener('click', function () {
      modelMenu.querySelectorAll('.model-item').forEach(function (i) {
        i.classList.remove('selected');
        var dot = i.querySelector('.model-item__dot');
        if (dot) dot.remove();
      });
      item.classList.add('selected');
      var dot = document.createElement('span');
      dot.className = 'model-item__dot';
      item.appendChild(dot);
      modelLabel.textContent = item.dataset.model;
      modelMenu.classList.remove('open');
    });
  });

  // Send button active state
  input.addEventListener('input', function () {
    send.classList.toggle('active', input.value.trim().length > 0);
  });

  function appendMessage(role, text) {
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
    bubble.textContent = text;

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    messages.appendChild(msg);
    lucide.createIcons();
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;
    appendMessage('human', text);
    input.value = '';
    send.classList.remove('active');
    // Placeholder response — replace with fetch('/api/chat', ...) when backend is ready
    setTimeout(function () {
      appendMessage('ai', 'Great question! Based on your needs, I\'d suggest starting with our Automation Suite for workflow orchestration, paired with a custom integration layer. Want me to outline a technical architecture?');
    }, 800);
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });
});
