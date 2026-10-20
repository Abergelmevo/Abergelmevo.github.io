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
})();
