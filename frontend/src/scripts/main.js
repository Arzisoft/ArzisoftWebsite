document.addEventListener('DOMContentLoaded', function () {
  // Navbar scroll state
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  var toggle = document.getElementById('navToggle');
  var mobile = document.getElementById('navMobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('open');
      toggle.innerHTML = open
        ? '<i data-lucide="x" style="width:22px;height:22px;"></i>'
        : '<i data-lucide="menu" style="width:22px;height:22px;"></i>';
      lucide.createIcons();
    });
  }
});
