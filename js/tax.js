(function () {
  var H = window.Hishab, T = window.TaxCore;
  var $ = function (id) { return document.getElementById(id); };
  var lastText = null;

  var CATS = ['gen', 'women', 'disabled', 'ff', 'custom'];
  function build() {
    var c = $('cat').value || 'gen';
    $('cat').innerHTML = CATS.map(function (k) { return '<option value="' + k + '">' + H.t('cat.' + k) + '</option>'; }).join('');
    $('cat').value = c;
    $('customWrap').classList.toggle('hide', c !== 'custom');
  }
  function calc() {
    $('customWrap').classList.toggle('hide', $('cat').value !== 'custom');
    var income = H.num($('income').value), out = $('res');
    var th = $('cat').value === 'custom' ? H.num($('custom').value) : T.THRESHOLDS[$('cat').value];
    if (!(income > 0) || th === null) {
      out.innerHTML = '<small>' + H.t('tx.total') + '</small><div class="ph">' + H.t('empty.res') + '</div>';
      $('bands').innerHTML = ''; lastText = null; return;
    }
    var r = T.tax(income, th);
    out.innerHTML = '<small>' + H.t('tx.total') + '</small><div class="big">' + H.money(r.tax, 0) + '</div>' +
      '<div class="stat"><span>' + H.t('tx.eff') + '</span><b>' + H.fmt(r.effective, 2) + '%</b></div>' +
      '<div class="stat"><span>' + H.t('tx.month') + '</span><b>' + H.money(r.monthly, 0) + '</b></div>' +
      '<div class="st">' + H.t('tx.note') + '</div>';
    var h = '<div class="tw"><table class="tbl"><thead><tr><th>' + H.t('tx.th.slab') + '</th><th>' + H.t('tx.th.amt') + '</th><th>' + H.t('tx.th.rate') + '</th><th>' + H.t('tx.th.tax') + '</th></tr></thead><tbody>';
    r.bands.forEach(function (b, i) {
      var label = i === 0 ? H.t('tx.free') : H.fmt(b.from, 0) + ' – ' + H.fmt(b.to, 0);
      h += '<tr><td>' + label + '</td><td>' + H.fmt(b.amount, 0) + '</td><td>' + H.fmt(b.rate, 0) + '%</td><td>' + H.fmt(b.tax, 0) + '</td></tr>';
    });
    $('bands').innerHTML = h + '</tbody></table></div>';
    lastText = 'Hishab – ' + H.t('tx.h1') + '\n' + H.t('tx.income') + ': ' + H.money(income, 0) + '\n' + H.t('tx.total') + ': ' + H.money(r.tax, 0) +
      '\n' + H.t('tx.eff') + ': ' + H.fmt(r.effective, 2) + '%\n' + location.href.split('?')[0];
  }
  ['income', 'custom'].forEach(function (id) { H.bindNum($(id), calc); });
  $('cat').addEventListener('change', calc);
  $('copyB').addEventListener('click', function (e) { if (lastText) H.copyText(lastText, e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (lastText) H.whatsapp(lastText); });
  build(); calc();
  document.addEventListener('langchange', function () { build(); calc(); });
})();
