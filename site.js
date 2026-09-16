/* yepdose.com — progressive enhancement only. Nothing here is required to read or use the page. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, $ = function (s, c) { return (c || doc).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var pre = root.classList.contains('pre');

  /* 1. Settle: the hero head once fonts are ready (or after 1.5 s), ch07's head when it comes into view. */
  var h1 = $('.hero h1');
  if (h1) {
    var settled = false, settle = function () { if (!settled) { settled = true; h1.classList.add('settle'); } };
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(settle, settle);
    setTimeout(settle, 1500);
  }
  var h7 = $('#h-07');
  if (h7 && pre && 'IntersectionObserver' in window) {
    h7.classList.add('armed');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { h7.classList.add('settle'); io.disconnect(); } }); }, { threshold: 0.3 });
    io.observe(h7);
  }

  /* 2. Snap row: say "Swipe for more" only when there is more, and be a tab stop only when scrollable. */
  var row = $('.surfaces');
  if (row) {
    var check = function () { var can = row.scrollWidth > row.clientWidth + 1; row.classList.toggle('can-scroll', can); if (can) row.setAttribute('tabindex', '0'); else row.removeAttribute('tabindex'); };
    check();
    if ('ResizeObserver' in window) new ResizeObserver(check).observe(row); else addEventListener('resize', check);
  }

  /* 3. Live-region receipts: one short announcement per change. */
  var say = function (out, text) { if (out) { out.textContent = ''; setTimeout(function () { out.textContent = text; }, 30); } };
  $$('.answer').forEach(function (g) {
    var out = $('output', g), med = out && out.getAttribute('data-med') || 'Metformin';
    g.addEventListener('change', function (e) {
      var id = e.target.id || '';
      var msg = /took/.test(id) ? 'Taken, 8:02 pm, ' + med : /snooze/.test(id) ? 'Snoozed, asking again at 8:10 pm, ' + med : /skip/.test(id) ? 'Skipped, 8:02 pm, ' + med : 'Not answered, ' + med;
      say(out, msg);
    });
  });
  var amlo = $('#t-amlo');
  if (amlo) amlo.addEventListener('change', function () { say($('.ledger output'), amlo.checked ? 'Taken, 2:22 pm, Amlodipine' : 'Not answered, Amlodipine, 22 minutes late'); });

  /* 4. Cancelled ladder steps leave the tab order and the accessibility tree. */
  var ch02 = $('.ch02');
  if (ch02) {
    var steps = $$('.step:not(.s0)', ch02);
    var sync = function () { var off = ($('#l-took') || {}).checked || ($('#l-skip') || {}).checked; steps.forEach(function (s) { if (off) s.setAttribute('inert', ''); else s.removeAttribute('inert'); }); };
    ch02.addEventListener('change', function (e) { if (e.target.name === 'ladder') sync(); });
    sync();
  }

  /* 5. Live Activity countdown: ticks once a second only while visible and the tab is active; stops at 0:00. */
  var cd = $('#la-cd');
  if (cd && pre && 'IntersectionObserver' in window) {
    var secs = 12 * 60 + 41, timer = null, seen = false;
    var tick = function () { if (secs <= 0) { clearInterval(timer); timer = null; return; } secs--; cd.textContent = Math.floor(secs / 60) + ':' + ('0' + secs % 60).slice(-2); };
    var run = function () { if (seen && !doc.hidden && !timer && secs > 0) timer = setInterval(tick, 1000); else if ((!seen || doc.hidden) && timer) { clearInterval(timer); timer = null; } };
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; run(); }).observe(cd);
    doc.addEventListener('visibilitychange', run);
  }
})();
