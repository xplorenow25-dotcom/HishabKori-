(function () {
  var H = window.Hishab, L = window.LandCore;
  var $ = function (id) { return document.getElementById(id); };
  var base = null;     // area in square feet
  var active = null;   // unit key being typed in
  var set = { kathaSqft: 720, bighaMode: 'std', bighaDecimals: 33 };
  var PRICE_UNITS = ['katha', 'decimal', 'bigha', 'sqft'];

  function num(s) {
    s = H.toEn(String(s)).replace(/[,\s]/g, '');
    if (s === '' || s === '.' || !/^\d*\.?\d*$/.test(s)) return null;
    return parseFloat(s);
  }
  function fmt(n, maxd) {
    maxd = maxd === undefined ? 4 : maxd;
    var f = Math.pow(10, maxd), r = Math.round(n * f) / f;
    var s = r.toFixed(maxd);
    if (maxd) s = s.replace(/\.?0+$/, '');
    var p = s.split('.');
    var out = H.groupIndian(p[0]) + (p[1] ? '.' + p[1] : '');
    return H.lang() === 'bn' ? H.toBn(out) : out;
  }
  function units() { return L.units(set); }

  function buildRows() {
    var h = '';
    L.ORDER.forEach(function (k) {
      h += '<div class="urow"><label for="u_' + k + '" data-u="' + k + '"></label>' +
        '<input id="u_' + k + '" type="text" inputmode="decimal" autocomplete="off"></div>';
    });
    $('rows').innerHTML = h;
    L.ORDER.forEach(function (k) {
      var el = $('u_' + k);
      el.addEventListener('input', function () {
        active = k;
        el.value = el.value.replace(/[^0-9০-৯.,]/g, '');
        var v = num(el.value);
        if (el.value.trim() === '') base = null;
        else if (v !== null) base = L.toSqft(v, k, units());
        else return;
        refresh();
      });
      el.addEventListener('focus', function () { active = k; el.select(); });
      el.addEventListener('blur', function () { active = null; refresh(); });
    });
  }

  function labels() {
    document.querySelectorAll('#rows label').forEach(function (l) { l.textContent = H.t('u.' + l.dataset.u); });
  }

  function buildSelects() {
    var cur = $('bighaMode').value || set.bighaMode;
    $('bighaMode').innerHTML = ['std', 'd33', 'd52', 'custom'].map(function (m) {
      return '<option value="' + m + '">' + H.t('ln.b.' + m) + '</option>';
    }).join('');
    $('bighaMode').value = cur;
    var pu = $('punit').value || 'katha';
    $('punit').innerHTML = PRICE_UNITS.map(function (k) {
      return '<option value="' + k + '">' + H.t('u.' + k) + '</option>';
    }).join('');
    $('punit').value = pu;
    var pd = $('pdim').value || 'ft';
    $('pdim').innerHTML = '<option value="ft">' + H.t('ln.ft') + '</option><option value="m">' + H.t('ln.m') + '</option>';
    $('pdim').value = pd;
  }

  function mixedText(u) {
    var m = L.mixed(base, u), s = [];
    if (m.katha) s.push(fmt(m.katha, 0) + ' ' + H.t('u.katha'));
    if (m.chatak) s.push(fmt(m.chatak, 0) + ' ' + H.t('u.chatak'));
    if (m.sqft > 0 || !s.length) s.push(fmt(m.sqft) + ' ' + H.t('u.sqft'));
    return s.join(' ');
  }

  function refresh() {
    var u = units();
    L.ORDER.forEach(function (k) {
      if (k === active) return;
      $('u_' + k).value = base === null ? '' : fmt(L.fromSqft(base, k, u));
    });
    $('mixed').textContent = base === null ? H.t('ln.mixed.empty') : mixedText(u);
    $('customWrap').style.display = set.bighaMode === 'custom' ? 'block' : 'none';
    plot();
  }

  function plot() {
    var u = units();
    var len = num($('plen').value), wid = num($('pwid').value), price = num($('pprice').value);
    var out = $('plotOut');
    if (!(len > 0) || !(wid > 0)) { out.style.display = 'none'; return; }
    var p = L.plot(len, wid, $('pdim').value, price > 0 ? price : 0, $('punit').value, u);
    var h = '<small>' + H.t('ln.area') + '</small><div class="w">' + fmt(p.sqft) + ' ' + H.t('u.sqft') + '</div>' +
      '<div class="w2">' + fmt(L.fromSqft(p.sqft, 'katha', u)) + ' ' + H.t('u.katha') + ' · ' +
      fmt(L.fromSqft(p.sqft, 'decimal', u)) + ' ' + H.t('u.decimal') + ' · ' +
      fmt(L.fromSqft(p.sqft, 'sqm', u)) + ' ' + H.t('u.sqm') + '</div>';
    if (p.total !== null) h += '<small style="margin-top:12px">' + H.t('ln.total') + '</small><div class="w">৳ ' + fmt(p.total, 0) + '</div>';
    out.innerHTML = h;
    out.style.display = 'block';
  }

  function summary() {
    var u = units();
    var lines = ['Hishab – ' + H.t('ln.h1')];
    L.ORDER.forEach(function (k) { lines.push(H.t('u.' + k) + ': ' + fmt(L.fromSqft(base, k, u))); });
    lines.push(location.href.split('?')[0]);
    return lines.join('\n');
  }

  // settings
  $('kathaSz').addEventListener('input', function () {
    var v = num(this.value);
    if (v > 0) { set.kathaSqft = v; refresh(); }
  });
  $('bighaMode').addEventListener('change', function () { set.bighaMode = this.value; refresh(); });
  $('customDec').addEventListener('input', function () {
    var v = num(this.value);
    if (v > 0) { set.bighaDecimals = v; refresh(); }
  });
  ['plen', 'pwid', 'pprice'].forEach(function (id) { $(id).addEventListener('input', plot); });
  ['pdim', 'punit'].forEach(function (id) { $(id).addEventListener('change', plot); });

  $('copyConv').addEventListener('click', function (e) { if (base !== null) H.copyText(summary(), e.currentTarget); });
  $('shareConv').addEventListener('click', function () { if (base !== null) H.whatsapp(summary()); });
  $('resetConv').addEventListener('click', function () { base = null; active = null; refresh(); });

  buildRows();
  buildSelects();
  labels();
  refresh();

  document.addEventListener('langchange', function () { buildSelects(); labels(); refresh(); });
})();
