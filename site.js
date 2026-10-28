(function () {
  var d = document, root = d.documentElement;

  /* the hour decides which light the page opens in */
  var h = new Date().getHours();
  var slot = h >= 5 && h < 11 ? 'morning' : h >= 11 && h < 17 ? 'midday' : 'evening';
  root.setAttribute('data-slot', slot);
  var lines = {
    morning: 'Good morning. A flat white and a plain bagel?',
    midday: 'Midday. A warm bowl and a cold brew?',
    evening: 'Evening, 6pm club. Your morning starts now.'
  };
  var heads = { morning: 'Good morning.', midday: 'Good afternoon.', evening: 'Evening, 6pm club.' };
  var subs = { morning: 'Flat white, bagel, or something bigger?', midday: 'A warm bowl and a cold brew, maybe?', evening: 'Your morning starts now. What are you having?' };
  var live = d.getElementById('live'); if (live) live.textContent = lines[slot];
  var g = d.getElementById('greet'); if (g) g.textContent = heads[slot];
  var gs = d.getElementById('greet-sub'); if (gs) gs.textContent = subs[slot];
  var idx = { morning: 0, midday: 1, evening: 2 }[slot];

  /* hero: the panel for this hour is marked; on a phone one panel shows and the tabs swap it */
  var pns = d.querySelectorAll('.pn');
  var htabs = d.querySelectorAll('.tabs button');
  function showPanel(i) {
    pns.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    htabs.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
  }
  pns.forEach(function (p, k) { p.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
  if (pns.length) showPanel(idx);
  htabs.forEach(function (b, k) { b.addEventListener('click', function () { showPanel(k); }); });

  /* menu by the hour */
  var dt = d.querySelectorAll('.dtab'), bands = d.querySelectorAll('.bands');
  function showBands(i) {
    dt.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
    bands.forEach(function (p, k) { if (k === i) p.removeAttribute('hidden'); else p.setAttribute('hidden', ''); });
  }
  if (dt.length) {
    showBands(idx);
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
