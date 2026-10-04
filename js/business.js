(function () {
  var H = window.Hishab, T = window.TaxCore;
  var $ = function (id) { return document.getElementById(id); };
  var tab = 'co', lastText = null;
  var TYPES = ['other', 'listed10', 'listedLess', 'firm', 'coop', 'bankListed', 'bankUnlisted', 'university'];
  var CATS = ['gen', 'women', 'disabled', 'ff'];
  function row(label, v, d) { return '<div class="stat"><span>' + label + '</span><b>' + H.money(v, d === undefined ? 0 : d) + '</b></div>'; }

  function build() {
    var ty = $('ctype').value || 'other', c = $('cat').value || 'gen';
    $('ctype').innerHTML = TYPES.map(function (k) { return '<option value="' + k + '">' + H.t('bt.t.' + k) + '</option>'; }).join('');
    $('ctype').value = ty;
    $('cat').innerHTML = CATS.map(function (k) { return '<option value="' + k + '">' + H.t('cat.' + k) + '</option>'; }).join('');
    $('cat').value = c;
    $('tabC').classList.toggle('on', tab === 'co'); $('tabM').classList.toggle('on', tab === 'me');
    $('panC').classList.toggle('hide', tab !== 'co'); $('panM').classList.toggle('hide', tab !== 'me');
    $('bankWrap').classList.toggle('hide', !T.CORP[$('ctype').value].hasOwnProperty('bank'));
  }
  function calcC() {
    $('bankWrap').classList.toggle('hide', !T.CORP[$('ctype').value].hasOwnProperty('bank'));
    var p = H.num($('profit').value), out = $('resC');
    if (!(p > 0)) { out.innerHTML = '<small>' + H.t('bt.tax') + '</small><div class="ph">' + H.t('empty.res') + '</div>'; lastText = null; return; }
    var r = T.corp(p, $('ctype').value, $('bank').checked, H.num($('receipts').value) || 0, H.num($('minrate').value) || 0);
    var h = '<small>' + H.t('bt.tax') + '</small><div class="big">' + H.money(r.tax, 0) + '</div>' +
      '<div class="stat"><span>' + H.t('bt.rate') + '</span><b>' + H.fmt(r.rate, 2) + '%</b></div>' + row(H.t('bt.regular'), r.regular);
    if (r.minimum > 0) h += row(H.t('bt.minimum'), r.minimum);
    h += row(H.t('bt.net'), r.net);
    if (r.minApplied) h += '<div class="st">' + H.t('bt.minapplied') + '</div>';
    h += '<div class="st">' + H.t('bt.note') + '</div>';
    out.innerHTML = h;
    lastText = 'Hishab – ' + H.t('bt.h1') + '\n' + H.t('bt.profit') + ': ' + H.money(p, 0) + '\n' + H.t('bt.rate') + ': ' + H.fmt(r.rate, 2) + '%\n' +
      H.t('bt.tax') + ': ' + H.money(r.tax, 0) + '\n' + H.t('bt.net') + ': ' + H.money(r.net, 0) + '\n' + location.href.split('?')[0];
  }
  function calcM() {
    var p = H.num($('mprofit').value), out = $('resM');
    if (!(p > 0)) { out.innerHTML = '<small>' + H.t('bt.tax') + '</small><div class="ph">' + H.t('empty.res') + '</div>'; $('bands').innerHTML = ''; lastText = null; return; }
    var r = T.personal(p, T.THRESHOLDS[$('cat').value], { invest: H.num($('minvest').value) || 0, newTaxpayer: $('newtp').checked });
    var h = '<small>' + H.t('bt.tax') + '</small><div class="big">' + H.money(r.final, 0) + '</div>' + row(H.t('sl.slabtax'), r.slabTax);
    if (r.rebate > 0) h += '<div class="stat"><span>' + H.t('sl.rebate') + '</span><b>− ' + H.money(r.rebate, 0) + '</b></div>';
    if (r.minApplied) h += row(H.t('sl.min'), r.minTax);
    h += row(H.t('bt.net'), p - r.final) + '<div class="st">' + (r.final === 0 ? H.t('sl.free') : H.t('bt.note')) + '</div>';
    out.innerHTML = h;
    var t = '<div class="tw"><table class="tbl"><thead><tr><th>' + H.t('tx.th.slab') + '</th><th>' + H.t('tx.th.amt') + '</th><th>' + H.t('tx.th.rate') + '</th><th>' + H.t('tx.th.tax') + '</th></tr></thead><tbody>';
    r.bands.forEach(function (b, i) {
      t += '<tr><td>' + (i === 0 ? H.t('tx.free') : H.fmt(b.from, 0) + ' – ' + H.fmt(b.to, 0)) + '</td><td>' + H.fmt(b.amount, 0) + '</td><td>' + H.fmt(b.rate, 0) + '%</td><td>' + H.fmt(b.tax, 0) + '</td></tr>';
    });
    $('bands').innerHTML = t + '</tbody></table></div>';
    lastText = 'Hishab – ' + H.t('bt.h1') + '\n' + H.t('bt.me.profit') + ': ' + H.money(p, 0) + '\n' + H.t('bt.tax') + ': ' + H.money(r.final, 0) + '\n' + location.href.split('?')[0];
  }
  ['profit', 'receipts', 'minrate'].forEach(function (id) { H.bindNum($(id), calcC); });
  ['ctype', 'bank'].forEach(function (id) { $(id).addEventListener('change', calcC); });
  ['mprofit', 'minvest'].forEach(function (id) { H.bindNum($(id), calcM); });
  ['cat', 'newtp'].forEach(function (id) { $(id).addEventListener('change', calcM); });
  $('tabC').addEventListener('click', function () { tab = 'co'; build(); calcC(); });
  $('tabM').addEventListener('click', function () { tab = 'me'; build(); calcM(); });
  $('copyB').addEventListener('click', function (e) { if (lastText) H.copyText(lastText, e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (lastText) H.whatsapp(lastText); });
  build(); calcC(); calcM();
  document.addEventListener('langchange', function () { build(); calcC(); calcM(); });
})();
