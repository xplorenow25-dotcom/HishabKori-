(function () {
  var H = window.Hishab, C = window.TakaCore;
  var inp = document.getElementById('amt');
  var res = document.getElementById('res');
  var msg = document.getElementById('msg');
  var sw = document.getElementById('digits');
  var digitsBn = H.lang() === 'bn';
  var last = null; // last good result

  function fmtDigits(s) { return digitsBn ? H.toBn(s) : s; }

  function clean(raw) {
    var s = H.toEn(raw).replace(/[^0-9.]/g, '');
    var i = s.indexOf('.');
    var ip = i > -1 ? s.slice(0, i) : s;
    var dp = i > -1 ? s.slice(i + 1).replace(/\./g, '').slice(0, 2) : null;
    ip = ip.replace(/^0+(?=\d)/, '');
    return { ip: ip, dp: dp };
  }

  function reformat() {
    var caret = inp.selectionStart || 0;
    var before = H.toEn(inp.value.slice(0, caret)).replace(/[^0-9.]/g, '').length;
    var c = clean(inp.value);
    var tooLong = c.ip.length > 13;
    if (tooLong) c.ip = c.ip.slice(0, 13);
    var shown = H.groupIndian(c.ip) + (c.dp !== null ? '.' + c.dp : '');
    inp.value = fmtDigits(shown);
    var pos = inp.value.length, cnt = 0;
    if (before === 0) pos = 0;
    else for (var i = 0; i < inp.value.length; i++) {
      if (/[0-9০-৯.]/.test(inp.value.charAt(i))) cnt++;
      if (cnt === before) { pos = i + 1; break; }
    }
    try { inp.setSelectionRange(pos, pos); } catch (e) {}
    msg.textContent = tooLong ? H.t('tw.err.toolong') : '';
    return { str: c.ip + (c.dp !== null ? '.' + c.dp : ''), shown: shown };
  }

  function words(r) { return H.lang() === 'bn' ? r.bn : r.en; }
  function otherWords(r) { return H.lang() === 'bn' ? r.en : r.bn; }

  function render(f) {
    var r = (f && f.str && f.str !== '.') ? C.convert(f.str) : null;
    if (!r || !r.ok) {
      last = null;
      res.innerHTML = '<small>' + H.t('tw.res') + '</small><div class="ph">' + H.t('tw.empty') + '</div>';
      return;
    }
    last = { r: r, amount: fmtDigits(f.shown) };
    res.innerHTML =
      '<small>' + H.t('tw.res') + '</small>' +
      '<div class="amt">৳ ' + last.amount + '</div>' +
      '<div class="w" lang="' + H.lang() + '">' + words(r) + '</div>' +
      '<div class="w2" lang="' + (H.lang() === 'bn' ? 'en' : 'bn') + '">' + otherWords(r) + '</div>' +
      '<button type="button" class="link" id="copyOther">' + (H.lang() === 'bn' ? H.t('tw.copyOther') : H.t('tw.copyOtherEn')) + '</button>';
    document.getElementById('copyOther').addEventListener('click', function (e) {
      H.copyText(otherWords(r), e.currentTarget);
    });
  }

  function update() { render(reformat()); }

  inp.addEventListener('input', update);
  document.getElementById('clear').addEventListener('click', function () {
    inp.value = ''; update(); inp.focus();
  });
  document.querySelectorAll('.chip[data-v]').forEach(function (b) {
    b.addEventListener('click', function () { inp.value = b.dataset.v; update(); });
  });
  sw.addEventListener('change', function () { digitsBn = sw.checked; update(); });

  document.getElementById('copyMain').addEventListener('click', function (e) {
    if (last) H.copyText(words(last.r), e.currentTarget);
  });
  document.getElementById('shareMain').addEventListener('click', function () {
    if (!last) return;
    H.whatsapp('৳ ' + last.amount + '\n' + words(last.r) + '\n' + location.href.split('?')[0]);
  });

  document.addEventListener('langchange', function () {
    digitsBn = H.lang() === 'bn';
    sw.checked = digitsBn;
    update();
  });

  sw.checked = digitsBn;
  update();
})();
