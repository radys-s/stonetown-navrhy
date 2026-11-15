/* Shared behaviour for all three design variants.
   Renders programmes and events from ST data and builds the inquiry form from
   the selected programme (fields, limits and price estimate come from the data,
   nothing is hand-written per programme). Demo mode: nothing is sent anywhere. */
(function () {
  'use strict';
  var ST = window.ST;
  var DAYS = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];
  var STATUS = { volno: 'volno', posledni: 'poslední místa', obsazeno: 'obsazeno' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function parse(iso) {
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function dShort(iso) {
    var d = parse(iso);
    return d.getDate() + '. ' + (d.getMonth() + 1) + '.';
  }
  function dLong(iso) {
    var d = parse(iso);
    return DAYS[d.getDay()] + ' ' + d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear();
  }
  function range(ev) {
    if (!ev.to) return dShort(ev.from) + ' ' + parse(ev.from).getFullYear();
    return dShort(ev.from) + ' – ' + dShort(ev.to) + ' ' + parse(ev.to).getFullYear();
  }
  function kc(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Kč';
  }
  function program(id) {
    return ST.programs.filter(function (p) { return p.id === id; })[0];
  }
  function termsFor(id) {
    return ST.terms.filter(function (t) { return t.programs.indexOf(id) !== -1; });
  }
  function priceText(p) {
    return p.priceFrom ? p.priceFrom + '–' + p.priceTo + ' Kč' : 'na dotaz';
  }

  /* ---------- programmes ---------- */
  ST.renderPrograms = function (el) {
    el.innerHTML = ST.programs.map(function (p) {
      var free = termsFor(p.id).filter(function (t) { return t.status !== 'obsazeno'; }).slice(0, 4);
      var terms = free.length
        ? '<p class="prog__terms"><span class="prog__terms-l">Nejbližší volné dny</span> ' +
          free.map(function (t) {
            return '<span class="chip chip--' + t.status + '">' + dShort(t.date) + '</span>';
          }).join(' ') + '</p>'
        : '<p class="prog__terms"><span class="prog__terms-l">Termín</span> domluvíme podle vás</p>';
      return (
        '<article class="prog" data-audience="' + p.audience + '">' +
        '<p class="prog__for">' + esc(p.audienceLabel) + '</p>' +
        '<h3 class="prog__title">' + esc(p.title) + '</h3>' +
        '<p class="prog__sum">' + esc(p.summary) + '</p>' +
        '<ul class="prog__acts">' + p.activities.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
        '<dl class="prog__facts">' +
        '<div><dt>Délka</dt><dd>' + esc(p.duration) + '</dd></div>' +
        '<div><dt>Cena</dt><dd>' + priceText(p) + '</dd></div>' +
        '<div><dt>Skupina</dt><dd>' + p.min + '–' + p.max + ' lidí</dd></div>' +
        '</dl>' + terms +
        '<button class="btn prog__cta" type="button" data-pick="' + p.id + '">Poptat tento program</button>' +
        '</article>'
      );
    }).join('');
  };

  /* ---------- events ---------- */
  ST.renderEvents = function (el) {
    el.innerHTML = ST.events.map(function (e) {
      return (
        '<li class="ev">' +
        '<time class="ev__date" datetime="' + e.from + '">' + range(e) + '</time>' +
        '<div class="ev__body"><h3 class="ev__title">' + esc(e.title) + '</h3>' +
        '<p class="ev__text">' + esc(e.text) + '</p></div>' +
        '<span class="ev__open">' + esc(e.open) + '</span>' +
        '</li>'
      );
    }).join('');
  };

  /* ---------- inquiry form ---------- */
  function field(name, label, control, hint) {
    return (
      '<div class="f-field" data-field="' + name + '">' +
      '<label class="f-label" for="f-' + name + '">' + label + '</label>' + control +
      (hint ? '<p class="f-hint" id="h-' + name + '">' + hint + '</p>' : '') +
      '<p class="f-err" id="e-' + name + '" hidden></p></div>'
    );
  }
  function input(name, type, extra) {
    return '<input class="f-input" id="f-' + name + '" name="' + name + '" type="' + type + '" ' + (extra || '') + ' />';
  }

  ST.mountInquiry = function (root) {
    var state = { program: ST.programs[0].id };
    var KEY = 'stonetown_demo_inquiries';

    function extraFields(p) {
      if (p.audience === 'skola') {
        return (
          field('org', 'Název školy', input('org', 'text', 'autocomplete="organization" required')) +
          field('grade', 'Ročník',
            '<select class="f-input" id="f-grade" name="grade">' +
            ['Mateřská škola', '1.–3. třída', '4.–5. třída', '6.–9. třída', 'Střední škola']
              .map(function (g) { return '<option>' + g + '</option>'; }).join('') + '</select>')
        );
      }
      if (p.audience === 'tabor') {
        return (
          field('org', 'Oddíl nebo organizace', input('org', 'text', 'autocomplete="organization" required')) +
          field('nights', 'Počet nocí', input('nights', 'number', 'min="1" max="14" value="2" inputmode="numeric" required'))
        );
      }
      return field('org', 'Firma nebo skupina', input('org', 'text', 'autocomplete="organization"'), 'Nepovinné.');
    }

    function termControl(p) {
      var list = termsFor(p.id);
      var opts = list.map(function (t) {
        return '<option value="' + t.id + '"' + (t.status === 'obsazeno' ? ' disabled' : '') + '>' +
          dLong(t.date) + ' – ' + STATUS[t.status] + '</option>';
      }).join('');
      if (!list.length) {
        return field('date', 'Kdy chcete přijet', input('date', 'date', 'min="2027-01-01" required'),
          'Pro tento program vypisujeme termín po domluvě.');
      }
      return (
        field('term', 'Termín',
          '<select class="f-input" id="f-term" name="term" required>' +
          '<option value="">Vyberte den</option>' + opts +
          '<option value="other">Jiný den</option></select>',
          'Nabízíme jen dny, kdy je ve městečku místo.') +
        '<div data-other hidden>' + field('date', 'Který den by se vám hodil', input('date', 'date', 'min="2027-01-01"')) + '</div>'
      );
    }

    function build() {
      var p = program(state.program);
      var people = p.audience === 'skola' ? 'Počet dětí' : 'Počet lidí';
      root.innerHTML =
        '<form class="f" novalidate>' +
        '<div class="f-main">' +
        '<fieldset class="f-set"><legend class="f-legend">Program a termín</legend>' +
        field('program', 'Program',
          '<select class="f-input" id="f-program" name="program">' +
          ST.programs.map(function (x) {
            return '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(x.title) + '</option>';
          }).join('') + '</select>') +
        termControl(p) + '</fieldset>' +
        '<fieldset class="f-set"><legend class="f-legend">Kdo přijede</legend>' +
        field('count', people, input('count', 'number',
          'min="' + p.min + '" max="' + p.max + '" inputmode="numeric" required'),
          'Tento program děláme pro ' + p.min + ' až ' + p.max + ' lidí.') +
        (p.audience === 'skola'
          ? field('adults', 'Počet dospělých', input('adults', 'number', 'min="1" max="20" value="2" inputmode="numeric" required'), 'Doprovod neplatí.')
          : '') +
        extraFields(p) + '</fieldset>' +
        '<fieldset class="f-set"><legend class="f-legend">Kam vám máme odpovědět</legend>' +
        field('name', 'Jméno a příjmení', input('name', 'text', 'autocomplete="name" required')) +
        field('email', 'E-mail', input('email', 'email', 'autocomplete="email" required')) +
        field('phone', 'Telefon', input('phone', 'tel', 'autocomplete="tel"'), 'Nepovinné. Hodí se, když je potřeba něco rychle doladit.') +
        field('note', 'Na co se máme připravit',
          '<textarea class="f-input" id="f-note" name="note" rows="3"></textarea>',
          'Třeba alergie, vozíčkář ve skupině nebo oběd.') +
        '<div class="f-hp" aria-hidden="true"><label>Nevyplňujte<input type="text" name="website" tabindex="-1" autocomplete="off" /></label></div>' +
        '<div class="f-field f-check" data-field="consent">' +
        '<input id="f-consent" name="consent" type="checkbox" required />' +
        '<label for="f-consent">Souhlasím, aby Stonetown použil tyto údaje k vyřízení poptávky.</label>' +
        '<p class="f-err" id="e-consent" hidden></p></div>' +
        '</fieldset></div>' +
        '<aside class="f-side" aria-live="polite">' +
        '<h3 class="f-side__h">Vaše poptávka</h3><dl class="f-sum" data-sum></dl>' +
        '<button class="btn f-submit" type="submit">Odeslat poptávku</button>' +
        '<p class="f-note">Poptávka je nezávazná. Odpovíme e-mailem a termín potvrdíme.</p>' +
        '</aside></form>';
      summary();
    }

    function val(name) {
      var el = root.querySelector('[name="' + name + '"]');
      return el ? el.value.trim() : '';
    }
    function termText() {
      var t = val('term');
      if (t && t !== 'other') {
        var term = ST.terms.filter(function (x) { return x.id === t; })[0];
        return dLong(term.date);
      }
      var d = val('date');
      return d ? dLong(d) + ' (na dotaz)' : '';
    }
    function estimate(p) {
      var n = parseInt(val('count'), 10);
      if (!p.priceFrom) return 'připravíme na míru';
      if (!n || n < p.min || n > p.max) return p.priceFrom + '–' + p.priceTo + ' Kč za dítě';
      return kc(n * p.priceFrom) + ' až ' + kc(n * p.priceTo);
    }
    function summary() {
      var p = program(state.program);
      var rows = [
        ['Program', p.title],
        ['Termín', termText() || 'zatím nevybrán'],
        [p.audience === 'skola' ? 'Dětí' : 'Lidí', val('count') || '–'],
        ['Odhad ceny', estimate(p)]
      ];
      root.querySelector('[data-sum]').innerHTML = rows.map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>';
      }).join('');
    }

    function setErr(name, msg) {
      var wrap = root.querySelector('[data-field="' + name + '"]');
      if (!wrap) return;
      var err = wrap.querySelector('.f-err');
      var ctl = wrap.querySelector('input, select, textarea');
      err.textContent = msg || '';
      err.hidden = !msg;
      wrap.classList.toggle('is-bad', !!msg);
      if (msg) {
        ctl.setAttribute('aria-invalid', 'true');
        ctl.setAttribute('aria-describedby', err.id);
      } else {
        ctl.removeAttribute('aria-invalid');
        ctl.removeAttribute('aria-describedby');
      }
    }

    function validate() {
      var p = program(state.program);
      var bad = [];
      function check(name, msg) { setErr(name, msg); if (msg) bad.push(name); }
      var hasTerms = termsFor(p.id).length > 0;
      var t = val('term');
      if (hasTerms) {
        var full = ST.terms.some(function (x) { return x.id === t && x.status === 'obsazeno'; });
        check('term', !t ? 'Vyberte den, kdy chcete přijet.' : full ? 'Tento den je už obsazený. Vyberte jiný.' : '');
        if (t === 'other') check('date', val('date') ? '' : 'Napište, který den by se vám hodil.');
      } else {
        check('date', val('date') ? '' : 'Vyberte den, kdy chcete přijet.');
      }
      var n = parseInt(val('count'), 10);
      check('count', !n ? 'Napište, kolik vás přijede.'
        : n < p.min ? 'Program děláme nejméně pro ' + p.min + ' lidí. Menší skupina může přijet v otevírací době.'
        : n > p.max ? 'Najednou se k nám vejde nejvýš ' + p.max + ' lidí. Větší skupinu rozdělíme do dvou dnů, napište nám.'
        : '');
      if (root.querySelector('[name="adults"]')) check('adults', parseInt(val('adults'), 10) >= 1 ? '' : 'S dětmi musí přijet aspoň jeden dospělý.');
      var org = root.querySelector('[name="org"]');
      if (org && org.required) check('org', val('org') ? '' : 'Doplňte název, ať víme, komu odpovídáme.');
      if (root.querySelector('[name="nights"]')) check('nights', parseInt(val('nights'), 10) >= 1 ? '' : 'Napište, kolik nocí chcete zůstat.');
      check('name', val('name') ? '' : 'Doplňte své jméno.');
      check('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email')) ? '' : 'Zkontrolujte e-mail, na tento se nedá odpovědět.');
      check('consent', root.querySelector('[name="consent"]').checked ? '' : 'Bez souhlasu poptávku nemůžeme zpracovat.');
      return bad;
    }

    function done(data) {
      var p = program(data.program);
      var lines = [
        'Dobrý den,',
        '',
        'děkujeme za poptávku. Tady je její shrnutí:',
        '',
        'Program: ' + p.title,
        'Termín: ' + data.termText,
        (p.audience === 'skola' ? 'Dětí: ' : 'Lidí: ' ) + data.count + (data.adults ? ', dospělých: ' + data.adults : ''),
        data.org ? 'Organizace: ' + data.org + (data.grade ? ' (' + data.grade + ')' : '') : null,
        data.nights ? 'Nocí: ' + data.nights : null,
        'Odhad ceny: ' + data.estimate,
        data.note ? 'Poznámka: ' + data.note : null,
        '',
        'Termín vám potvrdíme e-mailem.',
        'Stonetown, ' + ST.contact.phone
      ].filter(function (l) { return l !== null; });
      root.innerHTML =
        '<div class="f-done" tabindex="-1">' +
        '<h3 class="f-done__h">Poptávka odeslána</h3>' +
        '<p>Tohle je ukázka, takže se nic neodeslalo a nikam neuložilo mimo váš prohlížeč. ' +
        'V ostrém provozu se poptávka zapíše do databáze a odejdou dva e-maily: potvrzení vám a upozornění do Stonetownu.</p>' +
        '<div class="mail"><p class="mail__head"><span>Komu</span> ' + esc(data.email) + '</p>' +
        '<p class="mail__head"><span>Předmět</span> Poptávka: ' + esc(p.title) + ', ' + esc(data.termText) + '</p>' +
        '<pre class="mail__body">' + esc(lines.join('\n')) + '</pre></div>' +
        '<button class="btn" type="button" data-again>Poslat další poptávku</button></div>';
      root.querySelector('.f-done').focus();
    }

    root.addEventListener('input', function (e) {
      if (e.target.name === 'program') {
        state.program = e.target.value;
        build();
        root.querySelector('#f-program').focus();
        return;
      }
      if (e.target.name === 'term') {
        var other = root.querySelector('[data-other]');
        if (other) other.hidden = e.target.value !== 'other';
      }
      var wrap = e.target.closest('.f-field');
      if (wrap && wrap.classList.contains('is-bad')) setErr(wrap.getAttribute('data-field'), '');
      summary();
    });

    root.addEventListener('submit', function (e) {
      e.preventDefault();
      if (val('website')) return;
      var bad = validate();
      if (bad.length) {
        root.querySelector('[data-field="' + bad[0] + '"] input, [data-field="' + bad[0] + '"] select').focus();
        return;
      }
      var p = program(state.program);
      var data = {
        program: p.id, termText: termText(), count: val('count'), adults: val('adults'),
        org: val('org'), grade: val('grade'), nights: val('nights'), name: val('name'),
        email: val('email'), phone: val('phone'), note: val('note'), estimate: estimate(p),
        createdAt: new Date().toISOString()
      };
      try {
        var all = JSON.parse(localStorage.getItem(KEY) || '[]');
        all.push(data);
        localStorage.setItem(KEY, JSON.stringify(all));
      } catch (err) { /* storage is optional in the demo */ }
      done(data);
    });

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-again]')) {
        build();
        root.querySelector('#f-program').focus();
      }
    });

    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick]');
      if (!b) return;
      state.program = b.getAttribute('data-pick');
      build();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      var first = root.querySelector('#f-term, #f-date');
      if (first) first.focus({ preventScroll: true });
    });

    build();
  };

  document.addEventListener('DOMContentLoaded', function () {
    var p = document.querySelector('[data-programs]');
    var e = document.querySelector('[data-events]');
    var f = document.querySelector('[data-inquiry]');
    if (p) ST.renderPrograms(p);
    if (e) ST.renderEvents(e);
    if (f) ST.mountInquiry(f);
  });
})();
