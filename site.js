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
  var live = d.getElementById('live');
  if (live) live.textContent = lines[slot].hero;
  var head = d.getElementById('greet');
  if (head) head.textContent = lines[slot].head;
  var sub = d.getElementById('greet-sub');
  if (sub) sub.textContent = lines[slot].sub;

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

  /* one frame, contents change */
  var frame = d.querySelector('.gal-frame');
  if (frame) {
    var imgs = frame.querySelectorAll('img');
    var dots = d.querySelectorAll('.dots button');
    var cap = d.getElementById('cap');
    var i = 0, timer = null;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(n) {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      dots.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      if (cap) cap.textContent = imgs[i].getAttribute('data-cap');
    }
    function start() { if (!reduce && !timer) timer = setInterval(function () { show(i + 1); }, 3200); }
    function stop() { clearInterval(timer); timer = null; }
    show(0);
    frame.addEventListener('click', function () { stop(); show(i + 1); start(); });
    dots.forEach(function (b, k) { b.addEventListener('click', function () { stop(); show(k); start(); }); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(frame);
    } else { start(); }
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
