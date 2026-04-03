document.addEventListener('DOMContentLoaded', function () {
  var overlay    = document.getElementById('enquiryOverlay');
  var openBtn    = document.getElementById('openEnquiryBtn');
  var closeBtn   = document.getElementById('closeEnquiryBtn');
  var form       = document.getElementById('enquiryForm');
  var submitBtn  = document.getElementById('enqSubmitBtn');
  var errorEl    = document.getElementById('enqError');
  var successEl  = document.getElementById('enqSuccess');

  function openModal() {
    overlay.style.display = 'flex';
    lucide.createIcons();
  }

  function closeModal() {
    overlay.style.display = 'none';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  var overlayMousedownOnBackdrop = false;
  overlay.addEventListener('mousedown', function (e) {
    overlayMousedownOnBackdrop = e.target === overlay;
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay && overlayMousedownOnBackdrop) closeModal();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name    = document.getElementById('enqName').value.trim();
    var email   = document.getElementById('enqEmail').value.trim();
    var message = document.getElementById('enqMessage').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    errorEl.style.display = 'none';

    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, message: message }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          form.style.display = 'none';
          successEl.style.display = 'flex';
          lucide.createIcons();
        } else {
          errorEl.textContent = data.error || 'Something went wrong. Please try again.';
          errorEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        }
      })
      .catch(function () {
        errorEl.textContent = 'Connection error. Please try again.';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      });
  });
});
