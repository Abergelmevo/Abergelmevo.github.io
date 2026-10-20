(function () {
  'use strict';

  // Menu mobile
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Filtres de la page Projets
  var grid = document.querySelector('[data-cards]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-stage]'));
    var count = document.querySelector('[data-count]');
    var state = { stage: 'all', context: 'all', theme: 'all' };

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = (state.stage === 'all' || card.dataset.stage === state.stage) &&
          (state.context === 'all' || card.dataset.context === state.context) &&
          (state.theme === 'all' || (' ' + card.dataset.themes + ' ').indexOf(' ' + state.theme + ' ') !== -1);
        if (ok && card.hidden) {
          // Carte réaffichée : petite entrée en scène, décalée d'une carte à l'autre
          card.classList.remove('fx-pop');
          card.style.setProperty('--d', Math.min(shown, 8) * 0.04 + 's');
          void card.offsetWidth;
          card.classList.add('fx-pop');
        }
        card.hidden = !ok;
        if (ok) shown++;
      });
      if (count) count.textContent = shown + (shown > 1 ? ' projets affichés' : ' projet affiché');
    }

    document.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.filter;
        state[key] = btn.dataset.value;
        document.querySelectorAll('[data-filter="' + key + '"]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply();
      });
    });

    var params = new URLSearchParams(location.search);
    ['stage', 'context', 'theme'].forEach(function (key) {
      var v = params.get(key);
      var btn = v && document.querySelector('[data-filter="' + key + '"][data-value="' + v + '"]');
      if (btn) btn.click();
    });
    apply();
  }

  // Sommaire de fiche projet : section active
  var tocLinks = document.querySelectorAll('.p-toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('is-active'); });
          var link = map[entry.target.id];
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // Agrandissement des captures
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Image agrandie');
  var big = document.createElement('img');
  big.alt = '';
  box.appendChild(big);
  document.body.appendChild(box);
  function close() { box.classList.remove('is-open'); big.removeAttribute('src'); }
  box.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.querySelectorAll('.fig__frame img').forEach(function (img) {
    img.addEventListener('click', function () {
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      box.classList.add('is-open');
    });
  });

  // Barre de lecture des fiches et des articles
  var body = document.querySelector('.p-body');
  if (body && document.querySelector('.p-toc')) {
    var bar = document.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    var progress = function () {
      ticking = false;
      var r = body.getBoundingClientRect();
      var p = (window.innerHeight * 0.6 - r.top) / r.height;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    progress();
  }

  // Effets au défilement : rien n'est masqué sans JavaScript ni quand le mouvement est réduit
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) return;
  // fx-init coupe les transitions le temps de poser l'état de départ (sinon ce qui est visible s'efface en fondu)
  document.documentElement.classList.add('fx', 'fx-init');

  // En-têtes (accueil et autres pages) : la trame de points s'éclaire sous la souris
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.hero, .p-hero').forEach(function (head) {
      var frame = 0, mx = 0, my = 0;
      head.addEventListener('pointermove', function (e) {
        var r = head.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top;
        if (!frame) frame = requestAnimationFrame(function () {
          frame = 0;
          head.style.setProperty('--mx', mx + 'px');
          head.style.setProperty('--my', my + 'px');
          head.classList.add('is-lit');
        });
      });
      head.addEventListener('pointerleave', function () { head.classList.remove('is-lit'); });
    });
  }

  // Schémas : chaque élément reçoit son rang, les liaisons pleines se tracent
  document.querySelectorAll('.fig--diagram svg').forEach(function (svg) {
    var items = Array.prototype.filter.call(svg.children, function (el) { return !/^(title|desc|defs|style)$/i.test(el.tagName); });
    items.forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i * 0.035, 1.4).toFixed(3) + 's');
      var cls = el.getAttribute('class') || '';
      if (/\bdg-line\b/.test(cls) && !/dg-line--warn/.test(cls) && el.getTotalLength) {
        try {
          el.style.setProperty('--len', Math.ceil(el.getTotalLength()) + 'px');
          el.classList.add('fx-draw');
        } catch (err) { /* forme sans longueur : simple fondu */ }
      }
    });
  });

  // Fils rouges : chaque étape suit la précédente
  document.querySelectorAll('.thread__steps').forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (li, i) {
      li.style.setProperty('--d', (i * 0.18).toFixed(2) + 's');
    });
  });

  // Compteurs : « 808 » part de 0, « 100 → 74 » descend de 100 à 74
  var NUM = /\d+(?:[   ]\d{3})*(?:[.,]\d+)?/g;
  var toNumber = function (s) { return parseFloat(s.replace(/[   ]/g, '').replace(',', '.')); };
  var format = function (v, model) {
    var dec = model.match(/[.,](\d+)$/);
    var sep = model.match(/\d([   ])\d{3}/);
    var parts = v.toFixed(dec ? dec[1].length : 0).split('.');
    if (sep) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep[1]);
    return parts[0] + (dec ? model.charAt(model.length - dec[1].length - 1) + parts[1] : '');
  };
  var countUp = function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var jobs = [], node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue, tokens = [], last = 0, m, prev = null;
      NUM.lastIndex = 0;
      while ((m = NUM.exec(text))) {
        var to = toNumber(m[0]);
        var arrow = prev && /^\s*→\s*$/.test(text.slice(prev.end, m.index));
        var tok = { model: m[0], from: to >= 10 ? 0 : to, to: to };
        if (arrow) { prev.tok.from = prev.tok.to; tok.from = prev.tok.to; }
        tokens.push(text.slice(last, m.index));
        tokens.push(tok);
        prev = { end: m.index + m[0].length, tok: tok };
        last = prev.end;
      }
      tokens.push(text.slice(last));
      if (tokens.some(function (t) { return typeof t === 'object' && t.from !== t.to; })) jobs.push({ node: node, tokens: tokens });
    }
    if (!jobs.length) return;
    var start = null, duration = 1400;
    var step = function (now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration), e = 1 - Math.pow(1 - t, 4);
      jobs.forEach(function (job) {
        job.node.nodeValue = job.tokens.map(function (tok) {
          return typeof tok === 'string' ? tok : (t === 1 ? tok.model : format(tok.from + (tok.to - tok.from) * e, tok.model));
        }).join('');
      });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Ce qui apparaît au défilement ; « is-seen » reste, « reveal » est retiré une fois l'entrée finie
  var REVEAL = [
    '.section-head', '.numbers .number', '.stage', '.thread', '.cards > .card', '.cert', '.certs__group',
    '.skill-group', '.brief', '.kpis', '.p-section > h2', '.steps > li', '.incident', '.note',
    '.fig', 'pre.code', '.retro li', 'details.tech', '.timeline > li', '.shift > div', '.p-next a',
    '.contact', '.upcoming__title'
  ].join(',');
  var STAGGER = ['numbers', 'stages', 'cards', 'certs', 'skills', 'retro', 'shift', 'p-next__grid'];
  var vh = window.innerHeight;

  var done = function (el) {
    el.classList.add('is-seen');
    if (el.matches('.kpi__value, .number__value')) countUp(el);
    if (el.classList.contains('reveal')) {
      setTimeout(function () {
        el.classList.remove('reveal');
        el.style.removeProperty('--d');
      }, 1300);
    }
  };

  var io = new IntersectionObserver(function (entries) {
    var batch = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      var parent = el.parentElement;
      if (el.classList.contains('reveal') && parent && STAGGER.some(function (c) { return parent.classList.contains(c); })) {
        el.style.setProperty('--d', Math.min(batch++, 6) * 0.08 + 's');
      }
      done(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  var pending = [];
  var watched = document.querySelectorAll(REVEAL + ', .hbars, .cert__domains, .kpi__value, .number__value');
  Array.prototype.forEach.call(watched, function (el) {
    var r = el.getBoundingClientRect();
    var visible = r.top < vh && r.bottom > 0 && (r.width || r.height);
    if (el.matches(REVEAL) && !visible) el.classList.add('reveal');
    if (visible && !el.matches('.kpi__value, .number__value, .hbars, .cert__domains, .fig--diagram, .thread')) { el.classList.add('is-seen'); return; }
    pending.push(el);
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.remove('fx-init');
      pending.forEach(function (el) { io.observe(el); });
    });
  });
})();
