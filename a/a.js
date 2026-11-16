/* Variant A: slow push-in on the opening shot while scrolling, and a menu that closes after a pick. */
(function () {
  var root = document.documentElement;
  var frame = document.querySelector('[data-frame]');
  if (frame && root.classList.contains('moving')) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = frame.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / (r.height + 200)));
      frame.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  var menu = document.querySelector('.nav__menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) menu.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
  }
})();
