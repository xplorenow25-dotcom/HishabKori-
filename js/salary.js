(function () {
  var H = window.Hishab, T = window.TaxCore;
  var $ = function (id) { return document.getElementById(id); };
  var lastText = null;
  var CATS = ['gen', 'women', 'disabled', 'ff'];

  function build() {
    var c = $('cat').value || 'gen', f = $('when').value || 'none';
    $('cat').innerHTML = CATS.map(function (k) { return '<option value="' + k + '">' + H.t('cat.' + k) + '</option>'; }).join('');
    $('cat').value = c;
    $('when').innerHTML = ['none', 'early', 'q3', 'q4'].map(function (k) { return '<option value="' + k + '">' + H.t('sl.f.' + k) + '</option>'; }).join('');
    $('when').value = f;
  }
  function row(k, v, minus) { return '<div class="stat"><span>' + H.t(k) + '</span><b>' + (minus ? '− ' : '') + H.money(v, 0) + '</b></div>'; }

  function calc() {
    var monthly = H.num($('monthly').value), bonus = H.num($('bonus').value) || 0, inv = H.num($('invest').value) || 0;
    var out = $('res');
    if (!(monthly > 0)) {
      out.innerHTML = '<small>' + H.t('sl.final') + '</small><div class="ph">' + H.t('empty.res') + '</div>';
      $('bands').innerHTML = ''; lastText = null; return;
    }
    var r = T.salary({ monthly: monthly, bonus: bonus, invest: inv, threshold: T.THRESHOLDS[$('cat').value],
      newTaxpayer: $('newtp').checked, filing: $('when').value });
    var h = '<small>' + H.t('sl.final') + '</small><div class="big">' + H.money(r.final, 0) + '</div>' +
      row('sl.annual', r.annual) + row('sl.exempt', r.exempt, true) + row('sl.taxable', r.taxable) + row('sl.slabtax', r.slabTax);
    if (r.rebate > 0) h += row('sl.rebate', r.rebate, true);
    if (r.minApplied) h += '<div class="stat"><span>' + H.t('sl.min') + '</span><b>' + H.money(r.minTax, 0) + '</b></div>';
    if (r.filingAdj !== 0) h += '<div class="stat"><span>' + H.t('sl.adj') + '</span><b>' + (r.filingAdj < 0 ? '− ' : '+ ') + H.money(Math.abs(r.filingAdj), 0) + '</b></div>';
    h += '<div class="stat"><span>' + H.t('sl.month') + '</span><b>' + H.money(r.monthly, 0) + '</b></div>';
    h += '<div class="st">' + (r.final === 0 ? H.t('sl.free') : H.t('sl.note')) + '</div>';
    out.innerHTML = h;
    var t = '<div class="tw"><table class="tbl"><thead><tr><th>' + H.t('tx.th.slab') + '</th><th>' + H.t('tx.th.amt') + '</th><th>' + H.t('tx.th.rate') + '</th><th>' + H.t('tx.th.tax') + '</th></tr></thead><tbody>';
    r.bands.forEach(function (b, i) {
      t += '<tr><td>' + (i === 0 ? H.t('tx.free') : H.fmt(b.from, 0) + ' – ' + H.fmt(b.to, 0)) + '</td><td>' + H.fmt(b.amount, 0) + '</td><td>' + H.fmt(b.rate, 0) + '%</td><td>' + H.fmt(b.tax, 0) + '</td></tr>';
    });
    $('bands').innerHTML = t + '</tbody></table></div>';
    lastText = 'Hishab – ' + H.t('sl.h1') + '\n' + H.t('sl.annual') + ': ' + H.money(r.annual, 0) + '\n' + H.t('sl.taxable') + ': ' + H.money(r.taxable, 0) +
      '\n' + H.t('sl.final') + ': ' + H.money(r.final, 0) + '\n' + H.t('sl.month') + ': ' + H.money(r.monthly, 0) + '\n' + location.href.split('?')[0];
  }
  ['monthly', 'bonus', 'invest'].forEach(function (id) { H.bindNum($(id), calc); });
  ['cat', 'when', 'newtp'].forEach(function (id) { $(id).addEventListener('change', calc); });
  $('copyB').addEventListener('click', function (e) { if (lastText) H.copyText(lastText, e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (lastText) H.whatsapp(lastText); });
  build(); calc();
  document.addEventListener('langchange', function () { build(); calc(); });
})();
