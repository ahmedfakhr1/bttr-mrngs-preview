(function () {
  var d = document;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the story viewer ---------- */
  var viewer = d.querySelector('.viewer');
  if (viewer) {
    var frame = viewer.querySelector('.frame');
    var chapters = [].slice.call(d.querySelectorAll('.chapter'));
    var slides = [].slice.call(frame.querySelectorAll('.slide'));
    var bars = frame.querySelector('.bars');
    var cap = frame.querySelector('.cap');
    var nameEl = viewer.querySelector('.name');
    var factEl = viewer.querySelector('.fact');
    var mapsEl = viewer.querySelector('.maps');
    var menuEl = viewer.querySelector('.cta-main');
    var tray = [].slice.call(viewer.querySelectorAll('.tr'));
    var ch = -1, sl = 0, paused = false, held = false, inView = true;

    function slidesOf(c) { return slides.filter(function (s) { return +s.getAttribute('data-ch') === c; }); }

    function setName(text) {
      var lines = text.split(' ');
      var shown = lines.map(function (l) { return '<span class="w"><span>' + l + '</span></span>'; }).join('');
      var next = d.createElement('span'); next.className = 'line'; next.innerHTML = shown;
      var prev = nameEl.querySelector('.line:not(.out)');
      if (prev) {
        prev.classList.add('out');
        if (!reduce) {
          prev.querySelectorAll('.w>span').forEach(function (s, i) { s.style.transition = 'transform .5s var(--ease) ' + (i * 40) + 'ms'; s.style.transform = 'translateY(-110%)'; });
        }
        setTimeout(function () { if (prev.parentNode) prev.parentNode.removeChild(prev); }, 700);
      }
      nameEl.appendChild(next);
      if (!reduce) {
        var inner = next.querySelectorAll('.w>span');
        inner.forEach(function (s, i) { s.style.transform = 'translateY(110%)'; });
        next.getBoundingClientRect();
        inner.forEach(function (s, i) { s.style.transition = 'transform .8s var(--ease) ' + (120 + i * 70) + 'ms'; s.style.transform = 'none'; });
      }
      nameEl.setAttribute('aria-label', text);
    }

    function drawBars() {
      var list = slidesOf(ch);
      bars.innerHTML = '';
      list.forEach(function (s, i) {
        var seg = d.createElement('i'); seg.appendChild(d.createElement('b'));
        if (i < sl) seg.className = 'done'; else if (i === sl) seg.className = 'cur';
        bars.appendChild(seg);
      });
      var cur = bars.querySelector('.cur b');
      if (cur) cur.addEventListener('animationend', function () { next(); });
    }

    function show(c, s, dir) {
      var chChanged = c !== ch;
      var list = slidesOf(c);
      s = Math.max(0, Math.min(list.length - 1, s));
      var target = list[s];
      var current = frame.querySelector('.slide.on');
      if (current === target) return;
      frame.setAttribute('data-d', dir >= 0 ? '1' : '-1');
      slides.forEach(function (x) { x.classList.remove('was'); });
      if (current) { current.classList.remove('on'); current.classList.add('was'); }
      target.classList.add('on');
      setTimeout(function () { if (current) current.classList.remove('was'); }, 900);
      ch = c; sl = s;
      drawBars();
      var data = chapters[c];
      cap.textContent = target.getAttribute('data-cap');
      cap.classList.remove('swap'); void cap.offsetWidth; cap.classList.add('swap');
      if (chChanged) {
        viewer.setAttribute('data-k', data.getAttribute('data-k'));
        setName(data.getAttribute('data-name'));
        factEl.textContent = data.getAttribute('data-fact');
        if (data.getAttribute('data-maps')) { mapsEl.href = data.getAttribute('data-maps'); mapsEl.hidden = false; }
        else { mapsEl.hidden = true; }
        tray.forEach(function (t, i) { t.setAttribute('aria-current', i === c ? 'true' : 'false'); });
        if (history.replaceState) history.replaceState(null, '', c === 0 ? location.pathname : '#' + data.id);
      }
    }
    function next() {
      var list = slidesOf(ch);
      if (sl < list.length - 1) show(ch, sl + 1, 1);
      else show((ch + 1) % chapters.length, 0, 1);
    }
    function prev() {
      if (sl > 0) show(ch, sl - 1, -1);
      else { var p = (ch - 1 + chapters.length) % chapters.length; show(p, slidesOf(p).length - 1, -1); }
    }
    function goChapter(c, dir) { show((c + chapters.length) % chapters.length, 0, dir === undefined ? (c >= ch ? 1 : -1) : dir); }

    function setPaused(p) { paused = p; frame.classList.toggle('paused', p || held || !inView || d.hidden); }
    frame.querySelector('.zone.next').addEventListener('click', function () { if (!wasHold) next(); });
    frame.querySelector('.zone.prev').addEventListener('click', function () { if (!wasHold) prev(); });
    frame.querySelector('.pp').addEventListener('click', function () { setPaused(!paused); });
    tray.forEach(function (t, i) { t.addEventListener('click', function () { goChapter(i); }); });

    /* hold to pause, swipe for the next or previous place */
    var wasHold = false, holdTimer = null, sx = 0, sy = 0, st = 0;
    frame.addEventListener('pointerdown', function (e) {
      sx = e.clientX; sy = e.clientY; st = Date.now(); wasHold = false;
      holdTimer = setTimeout(function () { held = true; wasHold = true; frame.classList.add('held'); setPaused(paused); }, 260);
    });
    function endHold(e) {
      clearTimeout(holdTimer);
      if (held) { held = false; frame.classList.remove('held'); setPaused(paused); setTimeout(function () { wasHold = false; }, 50); }
      if (e && e.type === 'pointerup') {
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) { wasHold = true; if (dx < 0) goChapter(ch + 1, 1); else goChapter(ch - 1, -1); setTimeout(function () { wasHold = false; }, 80); }
      }
    }
    frame.addEventListener('pointerup', endHold);
    frame.addEventListener('pointercancel', endHold);
    frame.addEventListener('pointerleave', function () { clearTimeout(holdTimer); });

    d.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input,textarea')) return;
      if (e.key === 'ArrowRight') { next(); }
      else if (e.key === 'ArrowLeft') { prev(); }
      else if (e.key === ' ' && viewer.contains(e.target) && e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') { setPaused(!paused); e.preventDefault(); }
    });
    d.addEventListener('visibilitychange', function () { setPaused(paused); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; setPaused(paused); }, { threshold: 0.4 }).observe(viewer);
    }

    var start = 0;
    var hash = location.hash.replace('#', '');
    chapters.forEach(function (c, i) { if (c.id === hash) start = i; });
    window.addEventListener('hashchange', function () {
      var hh = location.hash.replace('#', '');
      chapters.forEach(function (c, i) { if (c.id === hh && i !== ch) goChapter(i); });
    });
    frame.setAttribute('data-d', '1');
    show(start, 0, 1);
    if (reduce) { frame.classList.add('paused'); paused = true; }
  }

  /* ---------- entrances ---------- */
  var rise = d.querySelectorAll('.rise');
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rise.forEach(function (el) { rio.observe(el); });
  } else { rise.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- menu page ---------- */
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
    }, { rootMargin: '-160px 0px -70% 0px' });
    d.querySelectorAll('.cat').forEach(function (s) { cio.observe(s); });
  }
})();
