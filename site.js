/* yepdose.com — progressive enhancement. Every section reads fine without this file. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var motion = root.classList.contains('motion');
  var hasIO = 'IntersectionObserver' in window;
  var say = function (el, text) { if (!el) return; el.textContent = ''; setTimeout(function () { el.textContent = text; }, 40); };

  /* 1. Masthead gets a backing once the page moves. */
  var mast = $('.mast');
  var onScrollMast = function () { if (mast) mast.classList.toggle('scrolled', scrollY > 8); };
  addEventListener('scroll', onScrollMast, { passive: true }); onScrollMast();

  /* 2. Reveal on scroll, staggered among siblings. */
  var reveals = $$('[data-reveal]');
  reveals.forEach(function (el) {
    var sibs = $$(':scope > [data-reveal]', el.parentNode);
    el.style.setProperty('--i', Math.min(sibs.indexOf(el), 5));
  });
  if (motion && hasIO) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* 3. Hero: the dial's hand sweeps the follow-up ladder; the notification answers it. */
  var art = $('.hero-art');
  if (art) {
    var hand = $('.hand', art), marks = $$('.mk', art), stamp = $('.stamp', art);
    var card = $('.demo', art), actions = $('.n-actions', card), result = $('.n-result', card), msg = $('.n-msg', card), live = $('#demo-live'), when = $('.n-when', card);
    var STOPS = [0, 10, 30, 60, 120], LOOP = 26000, HOLD = 2600;
    var deg = function (min) { return Math.min(min, 120) / 120 * 300; };
    var state = 'idle', start = performance.now(), lastMin = -1, raf = null, inView = true, visible = true;
    var setHand = function (d) { hand.style.setProperty('--hand', d + 'deg'); };
    var ping = function (i) { var m = marks[i]; if (!m) return; m.classList.remove('hit'); void m.getBBox(); m.classList.add('hit'); };
    var frame = function (now) {
      raf = null;
      if (state !== 'idle' || !visible) return;
      var t = (now - start) % (LOOP + HOLD);
      var min = Math.min(t / LOOP * 128, 120);
      if (min < lastMin) lastMin = -1;
      STOPS.forEach(function (s, i) { if (lastMin < s && min >= s) ping(i); });
      lastMin = min;
      setHand(deg(min));
      when.textContent = min < 1 ? 'now' : Math.round(min) + ' min ago';
      raf = requestAnimationFrame(frame);
    };
    var go = function () { if (motion && !raf && state === 'idle' && visible) raf = requestAnimationFrame(frame); };
    if (!motion) setHand(25);
    var STAMPS = { took: ['Taken', '8:02 pm'], snooze: ['Snoozed', 'till 8:10 pm'], skip: ['Skipped', '8:02 pm'] };
    var MSGS = { took: 'Taken 8:02 pm', snooze: 'Snoozed. Asking again at 8:10 pm.', skip: 'Skipped 8:02 pm' };
    var LIVE = { took: 'Taken, 8:02 pm, Metformin', snooze: 'Snoozed, asking again at 8:10 pm, Metformin', skip: 'Skipped, 8:02 pm, Metformin', idle: 'Not answered, Metformin' };
    var setState = function (s) {
      state = s; art.setAttribute('data-state', s);
      if (s === 'idle') {
        result.hidden = true; actions.hidden = false; start = performance.now(); lastMin = -1; when.textContent = 'now';
        if (!motion) setHand(25);
        go(); $('.n-btn', card).focus();
      } else {
        stamp.firstElementChild.textContent = STAMPS[s][0]; stamp.lastElementChild.textContent = STAMPS[s][1];
        msg.textContent = MSGS[s]; actions.hidden = true; result.hidden = false;
        if (s === 'snooze') setHand(deg(10)); else if (s === 'took') setHand(deg(2));
        $('.undo', card).focus();
      }
      if (motion) { card.classList.remove('bump'); void card.offsetWidth; card.classList.add('bump'); }
      say(live, LIVE[s]);
    };
    card.addEventListener('click', function (e) { var b = e.target.closest('[data-act]'); if (b) setState(b.getAttribute('data-act') === 'undo' ? 'idle' : b.getAttribute('data-act')); });
    var sync = function () { visible = inView && !doc.hidden; go(); };
    if (hasIO) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; sync(); }).observe(art);
    doc.addEventListener('visibilitychange', sync);
    go();
    /* a little parallax on the print shapes */
    if (motion && matchMedia('(pointer:fine)').matches) {
      var hero = $('.hero');
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        art.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
        art.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
      });
      hero.addEventListener('pointerleave', function () { art.style.setProperty('--px', 0); art.style.setProperty('--py', 0); });
    }
  }

  /* 4. The ladder scene: scrolling is the clock. */
  var scene = $('#scene');
  if (scene) {
    var num = $('#bignum'), meter = $('.meter', scene), nudges = $$('.nudge', scene), tookBtn = $('#scene-took');
    var COLORS = ['var(--ink)', 'var(--ink)', 'var(--amber-text)', 'var(--amber-text)', 'var(--clay-text)'];
    var curStep = -1, shown = -1, ticking = false;
    var paint = function (min) {
      var step = min >= 120 ? 4 : min >= 60 ? 3 : min >= 30 ? 2 : min >= 10 ? 1 : 0;
      var n = Math.round(min);
      if (n !== shown) { shown = n; num.textContent = n; if (motion) { num.classList.remove('roll'); void num.offsetWidth; num.classList.add('roll'); } }
      meter.style.setProperty('--p', (min / 120 * 100).toFixed(2) + '%');
      scene.style.setProperty('--pp', (min / 120).toFixed(4));
      if (step !== curStep) {
        curStep = step;
        scene.style.setProperty('--nc', COLORS[step]);
        for (var i = 0; i < 5; i++) scene.classList.toggle('s' + i, i === step);
        nudges.forEach(function (li) { var k = +li.getAttribute('data-step'); li.classList.toggle('on', k <= step); li.classList.toggle('past', k < step); });
      }
    };
    var measure = function () {
      ticking = false;
      var r = scene.getBoundingClientRect(), span = r.height - innerHeight;
      var p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 1;
      paint(Math.min(p * 1.12, 1) * 120);
    };
    if (motion) {
      addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(measure); } }, { passive: true });
      addEventListener('resize', measure);
      measure();
    } else {
      paint(120);
    }
    tookBtn.addEventListener('click', function () {
      var on = !scene.classList.contains('took');
      scene.classList.toggle('took', on);
      tookBtn.setAttribute('aria-pressed', on);
      tookBtn.textContent = on ? 'Taken at 8:02. Undo that tap' : 'What if you tap Took it at 8:02?';
    });
  }

  /* 5. Live Activity countdown: ticks only while visible; stops at 0:00. */
  var cd = $('#la-cd');
  if (cd && motion && hasIO) {
    var secs = 12 * 60 + 41, timer = null, seen = false;
    var tick = function () { if (secs <= 0) { clearInterval(timer); timer = null; return; } secs--; cd.textContent = Math.floor(secs / 60) + ':' + ('0' + secs % 60).slice(-2); };
    var run = function () { if (seen && !doc.hidden && !timer && secs > 0) timer = setInterval(tick, 1000); else if ((!seen || doc.hidden) && timer) { clearInterval(timer); timer = null; } };
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; run(); }).observe(cd);
    doc.addEventListener('visibilitychange', run);
  }

  /* 6. Profiles: a radio group with arrow keys. */
  var group = $('.profiles');
  if (group) {
    var profs = $$('.prof', group), status = $('.prof-status');
    var TEXT = { you: 'You · 4 medicines · next 8:00 pm', amma: 'Amma · 6 medicines · shared with Ravi (Family)', theo: 'Theo · 1 medicine · half a tablet, evenings' };
    var pick = function (b, focus) {
      profs.forEach(function (p) { var on = p === b; p.setAttribute('aria-checked', on); p.tabIndex = on ? 0 : -1; });
      status.textContent = TEXT[b.getAttribute('data-who')];
      if (focus) b.focus();
    };
    profs.forEach(function (p, i) {
      p.tabIndex = i === 0 ? 0 : -1;
      p.addEventListener('click', function () { pick(p); });
      p.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (d) { e.preventDefault(); pick(profs[(i + d + profs.length) % profs.length], true); }
      });
    });
  }

  /* 7. Gentle parallax on the phone screenshots. */
  var par = $$('[data-parallax]');
  if (par.length && motion) {
    var pt = false;
    var pmove = function () {
      pt = false;
      par.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var off = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.getAttribute('data-parallax'));
        el.style.setProperty('--py', off.toFixed(1) + 'px');
      });
    };
    addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(pmove); } }, { passive: true });
    pmove();
  }
})();
