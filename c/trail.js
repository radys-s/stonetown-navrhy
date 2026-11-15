/* Variant C: the trail fills as you walk down the page, and each stop's marker
   and stamps are "pressed" once when the stop comes into view.
   Without JS (or with reduced motion) everything is simply visible. */
(function () {
  'use strict';
  var trail = document.querySelector('[data-trail]');
  if (!trail) return;
  var fill = trail.querySelector('[data-trail-fill]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stops = [].slice.call(trail.querySelectorAll('.stop'));

  if (reduce || !('IntersectionObserver' in window)) {
    fill.style.transform = 'scaleY(1)';
    stops.forEach(function (s) { s.classList.add('is-in'); });
    return;
  }

  document.documentElement.classList.add('js-trail');

  var ticking = false;
  function update() {
    ticking = false;
    var r = trail.getBoundingClientRect();
    var mid = window.innerHeight * 0.6;
    var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -25% 0px' });
  stops.forEach(function (s) { io.observe(s); });
})();
