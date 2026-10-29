(function () {
  var d = document;

  /* entrances: text rises, images open once as they arrive */
  var els = d.querySelectorAll('.rise, .rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  /* menu page */
  var h = new Date().getHours();
  var slot = h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'midday' : 'evening';
  var heads = { morning: 'Good morning.', midday: 'Good afternoon.', evening: 'Good evening.' };
  var subs = { morning: 'Flat white, bagel, or something bigger?', midday: 'A warm bowl and a cold brew, maybe?', evening: 'Something sweet with that?' };
  var g = d.getElementById('greet'); if (g) g.textContent = heads[slot];
  var gs = d.getElementById('greet-sub'); if (gs) gs.textContent = subs[slot] + ' All prices in LE.';
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
    }, { rootMargin: '-180px 0px -70% 0px' });
    d.querySelectorAll('.cat').forEach(function (s) { cio.observe(s); });
  }
})();
