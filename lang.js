/* yepdose.com: open an English page in the visitor's language when the site has it.
   A language the visitor picked (yd-lang, kept on this device by site.js) wins; otherwise the first of the
   browser's languages this site has. Read here, sent nowhere: no location lookup, no cookie.
   Loaded in <head> of the English pages only, so an address under /de/, /fr/ and the rest is never redirected.
   S is the list of language folders and P the list of pages that exist in every language;
   scripts/check-site-langs.py keeps both honest. */
(function () {
  try {
    var S = ['en', 'de', 'fr', 'es', 'it', 'ja', 'zh', 'ar'];
    var P = ['/', '/press', '/compare', '/switch-from-medisafe', '/vs-apple-health', '/support', '/privacy', '/terms'];
    var p = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
    if (p.length > 1) p = p.replace(/\/$/, '');
    if (P.indexOf(p) < 0) return;
    /* A browser tag to a folder: "de-CH" is de, "zh-Hans-CN" is zh. The Chinese pages are Simplified, so a
       browser set to Traditional Chinese (zh-TW, zh-HK, zh-MO, zh-Hant) is not sent to them. */
    var base = function (tag) {
      var t = String(tag || '').toLowerCase();
      if (/^zh-(hant|tw|hk|mo)\b/.test(t)) return '';
      return t.split('-')[0];
    };
    var pick = function (list, stored) {
      var s = String(stored || '').toLowerCase().split('-')[0];
      if (s && S.indexOf(s) >= 0) return s;
      for (var i = 0; i < list.length; i++) {
        var b = base(list[i]);
        if (b && S.indexOf(b) >= 0) return b;
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
