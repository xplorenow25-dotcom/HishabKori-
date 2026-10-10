(function () {
  var EMAIL = 'YOUR-EMAIL@gmail.com'; // <-- change this to your real contact email
  var ROOT = (document.body && document.body.dataset.root) || '';
  var FORCED = document.body && document.body.dataset.lang;
  var LS = 'hishab_lang';
  var BD = '০১২৩৪৫৬৭৮৯';
  var TOOLS = [
    { n: 1, href: 'taka-in-words.html', icon: 'ti-coin', live: true },
    { n: 2, href: 'land-converter.html', icon: 'ti-map-2', live: true },
    { n: 3, href: 'loan-emi.html', icon: 'ti-calculator', live: true },
    { n: 4, href: 'dps-fdr.html', icon: 'ti-pig-money', live: true },
    { n: 5, href: 'zakat.html', icon: 'ti-moon-stars', live: true, gold: true },
    { n: 6, href: 'income-tax.html', icon: 'ti-receipt-tax', live: true, gold: true },
    { n: 7, href: 'salary-tax.html', icon: 'ti-wallet', live: true, gold: true },
    { n: 8, href: 'business-tax.html', icon: 'ti-building-store', live: true, gold: true }
  ];

  function getLang() { return FORCED === 'en' ? 'en' : 'bn'; }
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
    if (/^(https?:|mailto:|tel:|#)/.test(h)) return h;
    var hash = '', i = h.indexOf('#');
    if (i > -1) { hash = h.slice(i); h = h.slice(0, i); }
    if (h.charAt(0) === '/') return h + hash;
    h = h.replace(/\.html$/, '');
    if (h === 'index') h = '';
    return (lang === 'en' ? '/en/' : '/') + h + hash;
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

  var navBound = false;
  function closeMenu() {
    var p = document.getElementById('mpanel'), b = document.querySelector('.burger');
    if (p) p.classList.remove('open');
    if (b) { b.setAttribute('aria-expanded', 'false'); var i = b.querySelector('i'); if (i) i.className = 'ti ti-menu-2'; }
  }
  function bindNav() {
    if (navBound) return; navBound = true;
    document.addEventListener('click', function (e) {
      var tg = e.target, b = tg.closest ? tg.closest('.burger') : null;
      if (b) {
        var p = document.getElementById('mpanel');
        if (!p.classList.contains('open')) { p.classList.add('open'); b.setAttribute('aria-expanded', 'true'); b.querySelector('i').className = 'ti ti-x'; }
        else closeMenu();
        return;
      }
      if (!(tg.closest && tg.closest('.mpanel'))) closeMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  function renderHeader() {
    var el = document.getElementById('site-header');
    if (!el) return;
    var home = document.body.dataset.page === 'home';
    var logoHref = home ? '#' : withLang('index.html');
    function lk(h, k) { return '<a href="' + (home ? h : withLang('index.html' + h)) + '">' + t(k) + '</a>'; }
    function row(href, icon, label) {
      return '<a class="mlink" href="' + href + '"><span class="mi"><i class="ti ' + icon + '"></i></span><span>' + label + '</span><i class="ti ti-chevron-right ar"></i></a>';
    }
    el.innerHTML = '<div class="wrap nav"><a class="logo" href="' + logoHref + '">' + LOGO + '<span>হিসাব</span></a>' +
      '<div class="nav-r"><nav class="menu">' + lk('#tools', 'nav.tools') + '<a href="' + withLang('blog/') + '">' + t('nav.blog') + '</a>' + lk('#why', 'nav.why') + lk('#faq', 'nav.faq') + '</nav>' +
      '<div class="tg" role="group" aria-label="Language"><button type="button" data-l="bn" class="' + (lang === 'bn' ? 'on' : '') + '">বাং</button><button type="button" data-l="en" class="' + (lang === 'en' ? 'on' : '') + '">EN</button></div>' +
      '<button type="button" class="burger" aria-label="' + t('menu.open') + '" aria-expanded="false" aria-controls="mpanel"><i class="ti ti-menu-2"></i></button></div></div>' +
      '<div class="mpanel" id="mpanel"><div class="in">' +
      row(withLang('index.html'), 'ti-home', t('tw.home')) + row(withLang('blog/'), 'ti-article', t('nav.blog')) +
      row(withLang('about.html'), 'ti-info-circle', t('f.about')) + row(withLang('contact.html'), 'ti-mail', t('f.contact')) +
      '</div></div>';
    el.querySelectorAll('.tg button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.dataset.l); });
    });
    bindNav();
  }

  /* ---------- cookie consent ----------
     Choice is saved in localStorage for 12 months. Ads load for everyone. The choice only decides
     personalisation: when Hishab.consent() === 'rejected', request non-personalised ads
     (AdSense: set requestNonPersonalizedAds to 1). Listen for the 'hishab-consent' event for changes. */
  var CK = 'hishab_consent', consentInit = false;
  function getConsent() {
    try {
      var v = JSON.parse(localStorage.getItem(CK) || 'null');
      if (v && v.choice && (Date.now() - v.ts) < 31536000000) return v.choice;
    } catch (e) {}
    return null;
  }
  function saveConsent(c) {
    try { localStorage.setItem(CK, JSON.stringify({ v: 1, choice: c, ts: Date.now() })); } catch (e) {}
    window.HISHAB_CONSENT = c;
    try { document.dispatchEvent(new CustomEvent('hishab-consent', { detail: c })); } catch (e) {}
  }
  function showConsent(force) {
    var old = document.getElementById('ckb');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    if (!force && getConsent()) return;
    var d = document.createElement('div');
    d.id = 'ckb'; d.className = 'ckb';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-labelledby', 'ckt');
    d.innerHTML = '<div class="ckh"><span class="cki"><i class="ti ti-cookie"></i></span><b id="ckt">' + t('ck.title') + '</b></div>' +
      '<p>' + t('ck.text') + ' <a href="' + withLang('privacy.html') + '">' + t('ck.policy') + '</a></p>' +
      '<div class="ckbt"><button type="button" class="ck-no">' + t('ck.reject') + '</button><button type="button" class="ck-yes">' + t('ck.accept') + '</button></div>';
    document.body.appendChild(d);
    function close(c) { saveConsent(c); if (d.parentNode) d.parentNode.removeChild(d); }
    d.querySelector('.ck-yes').addEventListener('click', function () { close('accepted'); });
    d.querySelector('.ck-no').addEventListener('click', function () { close('rejected'); });
    (window.requestAnimationFrame || setTimeout)(function () { d.className = 'ckb show'; });
  }

  function renderBack() {
    var pg = document.body.dataset.page;
    if (pg !== 'tool' && pg !== 'legal') return;
    var bc = document.querySelector('.bc');
    if (!bc) return;
    var b = bc.querySelector('.back');
    if (!b) {
      b = document.createElement('a'); b.className = 'back';
      bc.insertBefore(b, bc.firstChild);
      var sp = document.createElement('span'); sp.className = 'crumb';
      while (b.nextSibling) sp.appendChild(b.nextSibling);
      bc.appendChild(sp);
    }
    b.href = withLang('index.html');
    b.innerHTML = '<i class="ti ti-arrow-left"></i><span>' + t('back') + '</span>';
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
      '<div><h4>' + t('f.company') + '</h4><a href="' + withLang('blog/') + '">' + t('nav.blog') + '</a><a href="' + withLang('about.html') + '">' + t('f.about') + '</a><a href="' + withLang('contact.html') + '">' + t('f.contact') + '</a></div>' +
      '<div><h4>' + t('f.legal') + '</h4><a href="' + withLang('privacy.html') + '">' + t('f.privacy') + '</a><a href="' + withLang('terms.html') + '">' + t('f.terms') + '</a><a href="#" data-cookie>' + t('ck.settings') + '</a></div>' +
      '</div><div class="disc">' + t('f.disc') + '<br>' + t('f.copy') + '</div></div>';
    el.querySelectorAll('[data-cookie]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); showConsent(true); });
    });
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
    renderHeader(); renderFooter(); renderAds(); renderBack();
    if (document.body.dataset.page === 'tool' && !window.__rptLoad) {
      window.__rptLoad = true;
      var rs = document.createElement('script'), cs = document.querySelector('script[src*="common.js"]');
      rs.src = cs ? cs.src.replace(/common\.js.*$/, 'report.js') : ROOT + 'js/report.js'; document.body.appendChild(rs);
    }
    if (document.getElementById('ckb')) showConsent(true);
    else if (!consentInit) { consentInit = true; showConsent(false); }
    if (b.dataset.tool) renderRelated(parseInt(b.dataset.tool, 10));
    document.dispatchEvent(new Event('langchange'));
  }

  function setLang(l) {
    if (l === lang) return;
    var d = document.body.dataset, alt = l === 'en' ? d.altEn : d.altBn;
    location.href = alt || (l === 'en' ? '/en/' : '/');
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
    copyText: copyText, whatsapp: whatsapp, apply: apply, email: EMAIL, consent: getConsent, reopenConsent: function () { showConsent(true); }, num: num, fmt: fmt, money: money, bindNum: bindNum
  };

  document.addEventListener('DOMContentLoaded', apply);
})();
