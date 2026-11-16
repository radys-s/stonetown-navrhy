/* Variant C – Saloon. Doors (skip + scroll swing), hero parallax, bill-of-fare rendering. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doors = document.querySelector('.doors');
  var hero = document.querySelector('.hero');
  var photo = document.querySelector('.hero__photo');

  /* ---------- doors: one swing, any input skips it ---------- */
  function settle() {
    root.classList.remove('doors-auto');
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) {
      window.removeEventListener(t, settle, true);
    });
  }
  if (root.classList.contains('doors-auto')) {
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) {
      window.addEventListener(t, settle, { capture: true, passive: true });
    });
    var right = document.querySelector('.door--r');
    if (right) right.addEventListener('animationend', settle);
    setTimeout(settle, 2600);
  }

  /* ---------- scroll: doors swing a touch more, the street drifts behind the glass ---------- */
  if (!reduce && hero && doors) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var h = hero.offsetHeight || 1;
      var p = Math.min(1, Math.max(0, window.scrollY / h));
      if (p > 0.02 && root.classList.contains('doors-auto')) settle();
      doors.style.setProperty('--x', (p * 8).toFixed(2) + 'deg');
      if (photo) photo.style.transform = 'translate3d(0,' + (p * 70).toFixed(1) + 'px,0) scale(1.08)';
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---------- bill of fare from ST.programs ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function day(iso) { var p = iso.split('-'); return (+p[2]) + '. ' + (+p[1]) + '.'; }

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.querySelector('[data-fares]');
    var ST = window.ST;
    if (!el || !ST || !ST.programs) return;
    el.innerHTML = ST.programs.map(function (p) {
      var free = ST.terms.filter(function (t) {
        return t.programs.indexOf(p.id) !== -1 && t.status !== 'obsazeno';
      }).slice(0, 4);
      var price = p.priceFrom ? p.priceFrom + '–' + p.priceTo + '&nbsp;Kč' : 'na dotaz';
      var terms = free.length
        ? '<p class="fare__terms"><span>Nejbližší volné dny</span>' + free.map(function (t) {
            return '<b class="chip chip--' + t.status + '">' + day(t.date) +
              (t.status === 'posledni' ? ' <i>poslední místa</i>' : '') + '</b>';
          }).join('') + '</p>'
        : '<p class="fare__terms"><span>Termín</span> domluvíme podle vás</p>';
      return (
        '<article class="fare">' +
        '<p class="fare__for">' + esc(p.audienceLabel) + '</p>' +
        '<h3 class="fare__row"><span class="fare__title">' + esc(p.title) + '</span>' +
        '<span class="fare__dots" aria-hidden="true"></span><span class="fare__price">' + price + '</span></h3>' +
        '<p class="fare__note">' + esc(p.priceNote) + '</p>' +
        '<p class="fare__sum">' + esc(p.summary) + '</p>' +
        '<ul class="fare__acts">' + p.activities.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
        '<dl class="fare__facts"><div><dt>Délka</dt><dd>' + esc(p.duration) + '</dd></div>' +
        '<div><dt>Skupina</dt><dd>' + p.min + '–' + p.max + ' lidí</dd></div></dl>' +
        terms +
        '<button class="btn fare__cta" type="button" data-pick="' + p.id + '">Poptat tento program</button>' +
        '</article>'
      );
    }).join('');
  });
})();
