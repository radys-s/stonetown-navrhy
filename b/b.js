/* Variant B: posters are "posted" one after another the first time the wall
   comes into view. Without JS or with reduced motion they are simply on the wall. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var wall = document.querySelector('.posters');
  if (!wall) return;
  document.documentElement.classList.add('js-post');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { wall.classList.add('is-up'); io.disconnect(); }
    });
  }, { rootMargin: '0px 0px -20% 0px' });
  io.observe(wall);
  /* safety net: never leave posters hidden */
  setTimeout(function () { wall.classList.add('is-up'); }, 6000);
})();
