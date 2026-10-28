(function () {
  var d = document;

  /* the hour decides which club you are in */
  var lines = {
    morning: { hero: 'Good morning. A flat white and a plain bagel?', head: 'Good morning.', sub: 'Flat white, bagel, or something bigger?' },
    midday: { hero: 'Midday. A warm bowl and a cold brew?', head: 'Good afternoon.', sub: 'A warm bowl and a cold brew, maybe?' },
    evening: { hero: 'Evening, 6pm club. Your morning starts now.', head: 'Evening, 6pm club.', sub: 'Your morning starts now. What are you having?' }
  };
  var h = new Date().getHours();
  var slot = h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'midday' : 'evening';
  var hero = d.getElementById('live');
  if (hero) hero.textContent = lines[slot].hero;
  var head = d.getElementById('greet');
  if (head) head.textContent = lines[slot].head;
  var sub = d.getElementById('greet-sub');
  if (sub) sub.textContent = lines[slot].sub;

  /* pinned story: three zones, the one under the middle of the screen sets the state */
  var stage = d.querySelector('.stage');
  if (stage && 'IntersectionObserver' in window) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) stage.setAttribute('data-state', e.target.getAttribute('data-z'));
      });
    }, { rootMargin: '-50% 0px -49.9% 0px' });
    d.querySelectorAll('.zone').forEach(function (z) { zio.observe(z); });
  }

  /* entrances, once */
  var rise = d.querySelectorAll('.rise');
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rise.forEach(function (el) { rio.observe(el); });
  } else {
    rise.forEach(function (el) { el.classList.add('in'); });
  }

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
    }, { rootMargin: '-140px 0px -70% 0px' });
    d.querySelectorAll('.cat').forEach(function (s) { cio.observe(s); });
  }
})();
