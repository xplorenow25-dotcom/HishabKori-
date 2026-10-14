(function () {
  var H = window.Hishab, B = window.BmiCore;
  var $ = function (id) { return document.getElementById(id); };
  var lastText = null;
  var COL = { under: '#3B82C4', normal: '#0B6B4F', over: '#E39A0B', obese: '#D64545' };
  var TXT = { under: '#2F6FAE', normal: '#0B6B4F', over: '#B87300', obese: '#C13B3B' };

  function build() {
    var hu = $('hu').value || 'ftin', wu = $('wu').value || 'kg', sd = $('std').value || 'asia';
    $('hu').innerHTML = '<option value="ftin">' + H.t('bmi.hu.ftin') + '</option><option value="cm">' + H.t('bmi.hu.cm') + '</option>';
    $('hu').value = hu;
    $('wu').innerHTML = '<option value="kg">' + H.t('bmi.kg') + '</option><option value="lb">' + H.t('bmi.lb') + '</option>';
    $('wu').value = wu;
    $('std').innerHTML = '<option value="asia">' + H.t('bmi.std.asia') + '</option><option value="who">' + H.t('bmi.std.who') + '</option>';
    $('std').value = sd;
    $('ftWrap').classList.toggle('hide', $('hu').value !== 'ftin');
    $('cmWrap').classList.toggle('hide', $('hu').value !== 'cm');
  }

  // ---- gauge ----
  function pol(cx, cy, r, th) { return [cx + r * Math.cos(th), cy - r * Math.sin(th)]; }
  function ang(v) { v = Math.max(10, Math.min(40, v)); return Math.PI * (1 - (v - 10) / 30); }
  function arc(v1, v2, color) {
    var a = pol(120, 120, 100, ang(v1)), b = pol(120, 120, 100, ang(v2));
    return '<path d="M' + a[0].toFixed(2) + ' ' + a[1].toFixed(2) + ' A100 100 0 0 1 ' + b[0].toFixed(2) + ' ' + b[1].toFixed(2) +
      '" fill="none" stroke="' + color + '" stroke-width="20" stroke-linecap="butt"/>';
  }
  function gauge(value, sys) {
    var c = B.CUT[sys], g = 0.12;
    var s = '<svg viewBox="0 0 240 140" role="img" aria-hidden="true">' +
      arc(10, 18.5 - g, COL.under) + arc(18.5 + g, c.t1 - g, COL.normal) + arc(c.t1 + g, c.t2 - g, COL.over) + arc(c.t2 + g, 40, COL.obese);
    var tip = pol(120, 120, 80, ang(value));
    s += '<line x1="120" y1="120" x2="' + tip[0].toFixed(2) + '" y2="' + tip[1].toFixed(2) + '" stroke="#14201B" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="120" cy="120" r="9" fill="#14201B"/><circle cx="120" cy="120" r="3.5" fill="#fff"/></svg>';
    return s;
  }
  function legend(sys, active) {
    var c = B.CUT[sys];
    function f(n) { return H.fmt(n, 1); }
    var rows = [
      ['under', '< ' + f(18.5)], ['normal', f(18.5) + ' – ' + f(c.t1 - 0.1)],
      ['over', f(c.t1) + ' – ' + f(c.t2 - 0.1)], ['obese', '≥ ' + f(c.t2)]
    ];
    return '<div class="legend">' + rows.map(function (r) {
      return '<div class="lg' + (r[0] === active ? ' on' : '') + '"><i style="background:' + COL[r[0]] + '"></i><span>' + H.t('bmi.c.' + r[0]) + '</span><em>' + r[1] + '</em></div>';
    }).join('') + '</div>';
  }

  function calc() {
    $('ftWrap').classList.toggle('hide', $('hu').value !== 'ftin');
    $('cmWrap').classList.toggle('hide', $('hu').value !== 'cm');
    var out = $('res'), unit = $('hu').value;
    var ft = H.num($('hft').value), inch = H.num($('hin').value) || 0, cm = H.num($('hcm').value), w = H.num($('wt').value);
    var haveH = unit === 'cm' ? cm > 0 : (ft > 0 || inch > 0) && ft !== null;
    if (!haveH || !(w > 0)) { out.innerHTML = '<small>' + H.t('bmi.your') + '</small><div class="ph">' + H.t('empty.res') + '</div>'; lastText = null; return; }
    var m = B.heightM({ unit: unit, ft: ft, inch: inch, cm: cm }), kg = B.weightKg(w, $('wu').value);
    var sys = $('std').value, r = B.analyse(kg, m, sys);
    if (!(m >= 0.5 && m <= 2.5) || !(kg >= 10 && kg <= 400) || r.bmi < 5 || r.bmi > 100) {
      out.innerHTML = '<small>' + H.t('bmi.your') + '</small><div class="ph">' + H.t('bmi.err') + '</div>'; lastText = null; return;
    }
    var lbl = $('wu').value === 'lb';
    function wv(x) { return H.fmt(lbl ? x / 0.45359237 : x, 1) + ' ' + H.t(lbl ? 'bmi.lb' : 'bmi.kg'); }
    var cmp = r.gapKg === 0 ? H.t('bmi.inrange') : H.t(r.gapKg > 0 ? 'bmi.above' : 'bmi.below').replace('{x}', wv(Math.abs(r.gapKg)));
    var catName = H.t('bmi.c.' + r.cat), val = H.fmt(Math.round(r.bmi * 10) / 10, 1);
    out.innerHTML = '<small>' + H.t('bmi.your') + '</small>' +
      '<div class="gauge">' + gauge(r.bmi, sys) + '</div>' +
      '<div class="big">' + val + '</div>' +
      '<div class="w" style="color:' + TXT[r.cat] + '">' + catName + '</div>' +
      legend(sys, r.cat) +
      '<div class="stat"><span>' + H.t('bmi.range') + '</span><b>' + wv(r.minKg) + ' – ' + wv(r.maxKg) + '</b></div>' +
      '<div class="stat"><span>' + H.t('bmi.cmp') + '</span><b>' + cmp + '</b></div>' +
      '<div class="stat"><span>' + H.t('bmi.used') + '</span><b>' + H.t('bmi.std.' + sys) + '</b></div>' +
      '<div class="st">' + H.t('bmi.note') + '</div>';
    lastText = 'Hishab – ' + H.t('bmi.h1') + '\n' + H.t('bmi.your') + ': ' + val + ' (' + catName + ')\n' +
      H.t('bmi.range') + ': ' + wv(r.minKg) + ' – ' + wv(r.maxKg) + '\n' + H.t('bmi.used') + ': ' + H.t('bmi.std.' + sys) + '\n' + location.href.split('?')[0];
  }

  ['hft', 'hin', 'hcm', 'wt'].forEach(function (id) { H.bindNum($(id), calc); });
  ['hu', 'wu', 'std'].forEach(function (id) { $(id).addEventListener('change', calc); });
  $('copyB').addEventListener('click', function (e) { if (lastText) H.copyText(lastText, e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (lastText) H.whatsapp(lastText); });
  build(); calc();
  document.addEventListener('langchange', function () { build(); calc(); });
})();
