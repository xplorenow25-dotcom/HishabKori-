(function () {
  var EMAIL = 'YOUR-EMAIL@gmail.com'; // <-- change this to your real contact email
  var LS = 'hishab_lang';
  var BD = '০১২৩৪৫৬৭৮৯';
  var TOOLS = [
    { n: 1, href: 'taka-in-words.html', icon: 'ti-coin', live: true },
    { n: 2, href: 'land-converter.html', icon: 'ti-map-2', live: true },
    { n: 3, href: 'loan-emi.html', icon: 'ti-calculator', live: true },
    { n: 4, href: 'dps-fdr.html', icon: 'ti-pig-money', live: true },
    { n: 5, href: 'zakat.html', icon: 'ti-moon-stars', live: true, gold: true },
    { n: 6, href: 'income-tax.html', icon: 'ti-receipt-tax', live: true, gold: true }
  ];

  function getLang() {
    try { var p = new URLSearchParams(location.search).get('lang'); if (p === 'bn' || p === 'en') return p; } catch (e) {}
    try { var s = localStorage.getItem(LS); if (s === 'bn' || s === 'en') return s; } catch (e) {}
    return 'bn';
  }
  var lang = getLang();

  function t(k) {
    var d = window.I18N[lang], v;
    if (d && d[k] !== undefined) v = d[k];
    else v = window.I18N.bn[k] !== undefined ? window.I18N.bn[k] : k;
    return String(v).replace(/\{\{email\}\}/g, EMAIL);
  }
  function toBn(s) { return String(s).replace(/[0-9]/g, function (d) { return BD.charAt(d); }); }
  function toEn(s) { return String(s).replace(/[০-৯]/g, function (d) { return BD.indexOf(d); }); }
  function groupIndian(s) {
    if (s.length <= 3) return s;
    return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3);
  }
  function withLang(h) {
    var p = h.split('#');
    return p[0] + '?lang=' + lang + (p[1] ? '#' + p[1] : '');
  }


  function num(v) {
    v = toEn(String(v)).replace(/[,\s]/g, '');
    if (v === '' || v === '.' || !/^\d*\.?\d*$/.test(v)) return null;
    return parseFloat(v);
  }
  function fmt(n, maxd) {
    maxd = maxd === undefined ? 2 : maxd;
    var f = Math.pow(10, maxd), r = Math.round(n * f) / f;
    var s = r.toFixed(maxd);
    if (maxd) s = s.replace(/\.?0+$/, '');
    var p = s.split('.');
    var out = groupIndian(p[0]) + (p[1] ? '.' + p[1] : '');
    return lang === 'bn' ? toBn(out) : out;
  }
  function money(n, d) { return '৳ ' + fmt(n, d === undefined ? 0 : d); }
  var bound = [];
  function bindNum(el, cb) {
    bound.push(el);
    el.addEventListener('input', function () {
      el.value = el.value.replace(/[^0-9০-৯.,]/g, '');
      cb();
    });
    el.addEventListener('blur', function () {
      var v = num(el.value);
      if (v !== null) el.value = fmt(v, 6);
    });
  }
  document.addEventListener('langchange', function () {
    bound.forEach(function (el) { var v = num(el.value); if (v !== null) el.value = fmt(v, 6); });
  });

  var LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#0B6B4F"/><rect x="12" y="12" width="17" height="17" rx="5" fill="#fff" fill-opacity=".9"/><rect x="35" y="12" width="17" height="17" rx="5" fill="#fff" fill-opacity=".55"/><rect x="12" y="35" width="17" height="17" rx="5" fill="#fff" fill-opacity=".55"/><rect x="35" y="35" width="17" height="17" rx="5" fill="#F2A81D"/><rect x="39" y="40" width="9" height="2.6" rx="1.3" fill="#0B6B4F"/><rect x="39" y="45" width="9" height="2.6" rx="1.3" fill="#0B6B4F"/></svg>';

  function renderHeader() {
    var el = document.getElementById('site-header');
    if (!el) return;
    var home = document.body.dataset.page === 'home';
    var base = home ? '' : withLang('index.html');
    var logoHref = home ? '#' : withLang('index.html');
    var m = home ? '#' : withLang('index.html') ;
    function lk(h, k) { return '<a href="' + (home ? h : withLang('index.html' + h)) + '">' + t(k) + '</a>'; }
    el.innerHTML = '<div class="wrap nav"><a class="logo" href="' + logoHref + '">' + LOGO + '<span>হিসাব</span></a>' +
      '<nav class="menu">' + lk('#tools', 'nav.tools') + lk('#why', 'nav.why') + lk('#faq', 'nav.faq') +
      '<div class="tg" role="group" aria-label="Language"><button data-l="bn" class="' + (lang === 'bn' ? 'on' : '') + '">বাং</button><button data-l="en" class="' + (lang === 'en' ? 'on' : '') + '">EN</button></div></nav></div>';
    el.querySelectorAll('.tg button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.dataset.l); });
    });
  }

  function renderFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    var tl = TOOLS.map(function (x) {
      return x.live ? '<a href="' + withLang(x.href) + '">' + t('c' + x.n + 't') + '</a>'
        : '<span class="fi" style="opacity:.6">' + t('c' + x.n + 't') + '</span>';
    }).join('');
    var wa = 'https://wa.me/?text=' + encodeURIComponent(t('share.msg') + ' ' + location.origin);
    el.innerHTML = '<div class="wrap"><div class="fg">' +
      '<div><a class="logo" href="' + withLang('index.html') + '">' + LOGO + '<span>হিসাব</span></a><p>' + t('f.blurb') + '</p>' +
      '<a href="' + wa + '" target="_blank" rel="noopener" style="margin-top:8px;color:#F2A81D"><i class="ti ti-brand-whatsapp"></i> ' + t('f.share') + '</a></div>' +
      '<div><h4>' + t('f.tools') + '</h4>' + tl + '</div>' +
      '<div><h4>' + t('f.company') + '</h4><a href="' + withLang('about.html') + '">' + t('f.about') + '</a><a href="' + withLang('contact.html') + '">' + t('f.contact') + '</a></div>' +
      '<div><h4>' + t('f.legal') + '</h4><a href="' + withLang('privacy.html') + '">' + t('f.privacy') + '</a><a href="' + withLang('terms.html') + '">' + t('f.terms') + '</a></div>' +
      '</div><div class="disc">' + t('f.disc') + '<br>' + t('f.copy') + '</div></div>';
  }

  function renderAds() {
    document.querySelectorAll('.ad').forEach(function (a) {
      a.textContent = t('ad') + (a.classList.contains('rect') ? ' · 336×280' : ' · 728×90');
    });
  }

  function renderRelated(currentN) {
    var el = document.getElementById('related');
    if (!el) return;
    el.innerHTML = TOOLS.filter(function (x) { return x.n !== currentN; }).map(function (x) {
      var inner = '<div class="ic' + (x.gold ? ' g' : '') + '"><i class="ti ' + x.icon + '"></i></div><h3>' + t('c' + x.n + 't') + '</h3><p>' + t('c' + x.n + 'd') + '</p>';
      return x.live ? '<a class="card" href="' + withLang(x.href) + '">' + inner + '</a>'
        : '<div class="card soon">' + inner + '<span class="badge">' + t('soon') + '</span></div>';
    }).join('');
  }

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (e) { e.innerHTML = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (e) { e.placeholder = t(e.dataset.i18nPh); });
    var b = document.body;
    if (b.dataset.title) document.title = t(b.dataset.title);
    var md = document.querySelector('meta[name="description"]');
    if (md && b.dataset.desc) md.setAttribute('content', t(b.dataset.desc));
    document.querySelectorAll('a[data-int]').forEach(function (a) { a.href = withLang(a.dataset.int); });
    renderHeader(); renderFooter(); renderAds();
    if (b.dataset.tool) renderRelated(parseInt(b.dataset.tool, 10));
    document.dispatchEvent(new Event('langchange'));
  }

  function setLang(l) {
    lang = l;
    try { localStorage.setItem(LS, l); } catch (e) {}
    try { var u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u); } catch (e) {}
    apply();
  }

  function copyText(text, btn, keepLabel) {
    function done() {
      if (!btn) return;
      var old = btn.innerHTML;
      btn.innerHTML = '<i class="ti ti-check"></i> ' + t('copied');
      setTimeout(function () { btn.innerHTML = old; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }
  function whatsapp(text) {
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }

  window.Hishab = {
    lang: function () { return lang; }, t: t, toBn: toBn, toEn: toEn, groupIndian: groupIndian,
    copyText: copyText, whatsapp: whatsapp, apply: apply, email: EMAIL, num: num, fmt: fmt, money: money, bindNum: bindNum
  };

  document.addEventListener('DOMContentLoaded', apply);
})();
