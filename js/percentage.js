(function () {
  var H = window.Hishab, C = window.PercentageCore;
  var $ = function (id) { return document.getElementById(id); };
  var lastText = null;

  function n4(n) { return H.fmt(n, 4); }
  function ph(el, title, msg) { el.innerHTML = '<small>' + title + '</small><div class="ph">' + (msg || H.t('empty.res')) + '</div>'; }
  function fill(s, o) { Object.keys(o).forEach(function (k) { s = s.replace('{' + k + '}', o[k]); }); return s; }

  function calc() {
    var lines = [];
    // 1) p% of n
    var p = H.num($('p1a').value), n = H.num($('p1b').value);
    if (p !== null && n !== null) {
      var r1 = C.of(p, n), s1 = fill(H.t('pc.r1'), { p: n4(p), n: n4(n), r: n4(r1) });
      $('res1').innerHTML = '<small>' + H.t('pc.t1') + '</small><div class="big">' + n4(r1) + '</div><div class="st">' + s1 + '</div>';
      lines.push(s1);
    } else ph($('res1'), H.t('pc.t1'));

    // 2) a is what percent of b
    var a = H.num($('p2a').value), b = H.num($('p2b').value);
    if (a !== null && b !== null) {
      var r2 = C.whatPercent(a, b);
      if (r2 === null) ph($('res2'), H.t('pc.t2'), H.t('pc.e2'));
      else {
        var s2 = fill(H.t('pc.r2'), { a: n4(a), b: n4(b), r: n4(r2) });
        $('res2').innerHTML = '<small>' + H.t('pc.t2') + '</small><div class="big">' + n4(r2) + '%</div><div class="st">' + s2 + '</div>';
        lines.push(s2);
      }
    } else ph($('res2'), H.t('pc.t2'));

    // 3) change from -> to
    var f = H.num($('p3a').value), t = H.num($('p3b').value);
    if (f !== null && t !== null) {
      var r3 = C.change(f, t);
      if (r3 === null) ph($('res3'), H.t('pc.t3'), H.t('pc.e3'));
      else {
        var dir = r3.diff > 0 ? H.t('pc.inc') : (r3.diff < 0 ? H.t('pc.dec') : H.t('pc.same'));
        var sign = r3.diff > 0 ? '+' : (r3.diff < 0 ? '−' : '');
        var mag = n4(Math.abs(r3.pct)), dm = n4(Math.abs(r3.diff));
        var s3 = r3.diff === 0 ? H.t('pc.same') : fill(H.t('pc.r3'), { a: n4(f), b: n4(t), r: mag, d: dir });
        $('res3').innerHTML = '<small>' + H.t('pc.t3') + '</small><div class="big">' + sign + mag + '%</div>' +
          '<div class="stat"><span>' + H.t('pc.diff') + '</span><b>' + sign + dm + '</b></div>' +
          '<div class="stat"><span>' + H.t('pc.dir') + '</span><b>' + dir + '</b></div><div class="st">' + s3 + '</div>';
        lines.push(s3);
      }
    } else ph($('res3'), H.t('pc.t3'));

    lastText = lines.length ? 'Hishab – ' + H.t('pc.h1') + '\n' + lines.join('\n') + '\n' + location.href.split('?')[0] : null;
  }

  ['p1a', 'p1b', 'p2a', 'p2b', 'p3a', 'p3b'].forEach(function (id) { H.bindNum($(id), calc); });
  $('copyB').addEventListener('click', function (e) { if (lastText) H.copyText(lastText, e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (lastText) H.whatsapp(lastText); });
  calc();
  document.addEventListener('langchange', calc);
})();
