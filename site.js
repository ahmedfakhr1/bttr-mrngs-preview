(function () {
  var d = document, root = d.documentElement;

  /* the menu page greets by the hour */
  var h = new Date().getHours();
  var slot = h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'midday' : 'evening';
  var heads = { morning: 'Good morning.', midday: 'Good afternoon.', evening: 'Good evening.' };
  var subs = { morning: 'Flat white, bagel, or something bigger?', midday: 'A warm bowl and a cold brew, maybe?', evening: 'Something sweet with that?' };
  var g = d.getElementById('greet'); if (g) g.textContent = heads[slot];
  var gs = d.getElementById('greet-sub'); if (gs) gs.textContent = subs[slot] + ' All prices in LE.';

  /* hero: on a phone one panel shows and the tabs swap it */
  var pns = d.querySelectorAll('.pn');
  var htabs = d.querySelectorAll('.tabs button');
  function showPanel(i) {
    pns.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    htabs.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
  }
  if (pns.length) showPanel(1);
  htabs.forEach(function (b, k) { b.addEventListener('click', function () { showPanel(k); }); });

  /* the menu, by kind */
  var dt = d.querySelectorAll('.dtab'), bands = d.querySelectorAll('.bands');
  function showBands(i) {
    dt.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
    bands.forEach(function (p, k) { if (k === i) p.removeAttribute('hidden'); else p.setAttribute('hidden', ''); });
  }
  if (dt.length) {
    showBands(0);
    dt.forEach(function (b, k) {
      b.addEventListener('click', function () { showBands(k); });
      b.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? k + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? k - 1 : null;
        if (n === null) return; n = (n + dt.length) % dt.length; showBands(n); dt[n].focus(); e.preventDefault();
      });
    });
  }

  /* the bar takes the colour of the chapter under it */
  if ('IntersectionObserver' in window) {
    var nav = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) d.body.setAttribute('data-nav', e.target.getAttribute('data-c')); });
    }, { rootMargin: '-64px 0px -85% 0px' });
    d.querySelectorAll('[data-c]').forEach(function (s) { nav.observe(s); });
  }

  /* prints: tap brings one to the front */
  d.querySelectorAll('.print').forEach(function (p) {
    p.addEventListener('click', function () {
      var on = p.classList.contains('up');
      d.querySelectorAll('.print').forEach(function (q) { q.classList.remove('up'); });
      if (!on) p.classList.add('up');
    });
  });

  /* entrances, once */
  var rise = d.querySelectorAll('.rise');
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rise.forEach(function (el) { rio.observe(el); });
  } else { rise.forEach(function (el) { el.classList.add('in'); }); }

  /* menu chips follow the section in view */
  var chips = d.querySelectorAll('.chips a');
  if (chips.length && 'IntersectionObserver' in window) {
    var map = {};
    chips.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (a) {
          a.setAttribute('aria-current', 'true');
          var bar = a.parentNode;
          if (bar.scrollWidth > bar.clientWidth + 2) {
            var l = a.offsetLeft - bar.scrollLeft, r = l + a.offsetWidth;
            if (l < 24 || r > bar.clientWidth - 24) bar.scrollLeft = Math.max(0, a.offsetLeft - 24);
          }
        }
      });
    }, { rootMargin: '-160px 0px -70% 0px' });
    d.querySelectorAll('.cat').forEach(function (s) { cio.observe(s); });
  }
})();
