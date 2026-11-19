/* yepdose.com: open an English page in German, French or Spanish when that is the visitor's language.
   A language the visitor picked (yd-lang, kept on this device by site.js) wins; otherwise the first of the
   browser's languages this site has. Read here, sent nowhere: no location lookup, no cookie.
   Loaded in <head> of the English pages only, so an address under /de/, /fr/ or /es/ is never redirected.
   P is the list of pages that exist in all four languages; scripts/check-site-langs.py keeps it honest. */
(function () {
  try {
    var S = ['en', 'de', 'fr', 'es'];
    var P = ['/', '/press', '/compare', '/switch-from-medisafe', '/vs-apple-health', '/support', '/privacy', '/terms'];
    var p = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
    if (p.length > 1) p = p.replace(/\/$/, '');
    if (P.indexOf(p) < 0) return;
    var pick = function (list, stored) {
      if (S.indexOf(stored) >= 0) return stored;
      for (var i = 0; i < list.length; i++) {
        var b = String(list[i] || '').toLowerCase().split('-')[0];
        if (S.indexOf(b) >= 0) return b;
      }
      return 'en';
    };
    var st = null, ok = 1;
    try { st = localStorage.getItem('yd-lang'); } catch (e) { ok = 0; }
    /* Storage blocked: a pick cannot be kept, so a visitor coming from another page of this site stays on
       the page they asked for. */
    if (!ok && document.referrer.indexOf(location.origin + '/') === 0) return;
    var c = pick(navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language], st);
    if (c !== 'en') location.replace('/' + c + (p === '/' ? '/' : p) + location.search + location.hash);
  } catch (e) {}
})();
