(function () {
  var H = window.Hishab, Z = window.ZakatCore;
  var $ = function (id) { return document.getElementById(id); };
  var IDS = ['gp', 'sp', 'cash', 'gold', 'silver', 'biz', 'recv', 'other', 'debts'];
  var lastText = null;

  function build() {
    var b = $('basis').value || 'silver';
    $('basis').innerHTML = '<option value="silver">' + H.t('zk.b.silver') + '</option><option value="gold">' + H.t('zk.b.gold') + '</option>';
    $('basis').value = b;
  }
  function calc() {
    var v = {};
    IDS.forEach(function (id) { v[id] = H.num($(id).value) || 0; });
    var any = ['cash', 'gold', 'silver', 'biz', 'recv', 'other'].some(function (k) { return v[k] > 0; });
    var out = $('res');
    if (!any) { out.innerHTML = '<small>' + H.t('zk.res') + '</small><div class="ph">' + H.t('empty.res') + '</div>'; lastText = null; return; }
    var r = Z.zakat({ cash: v.cash, goldBhori: v.gold, silverBhori: v.silver, business: v.biz, receivable: v.recv, other: v.other,
      debts: v.debts, goldPrice: v.gp, silverPrice: v.sp, basis: $('basis').value });
    var msg = r.needPrice ? H.t('zk.needprice') : (r.due ? H.t('zk.due') : H.t('zk.notdue'));
    out.innerHTML = '<small>' + H.t('zk.zakat') + '</small><div class="big">' + (r.needPrice ? '—' : H.money(r.zakat, 2)) + '</div>' +
      '<div class="stat"><span>' + H.t('zk.total') + '</span><b>' + H.money(r.assets, 2) + '</b></div>' +
      '<div class="stat"><span>' + H.t('zk.net') + '</span><b>' + H.money(r.net, 2) + '</b></div>' +
      '<div class="stat"><span>' + H.t('zk.nisab') + ' (' + H.fmt(r.nisabBhori, 1) + ' ' + H.t('zk.unit') + ')</span><b>' + (r.needPrice ? '—' : H.money(r.nisab, 2)) + '</b></div>' +
      '<div class="st">' + msg + '</div>';
    lastText = r.needPrice ? null : 'Hishab – ' + H.t('zk.h1') + '\n' + H.t('zk.net') + ': ' + H.money(r.net, 2) + '\n' +
      H.t('zk.nisab') + ': ' + H.money(r.nisab, 2) + '\n' + H.t('zk.zakat') + ': ' + H.money(r.zakat, 2) + '\n' + location.href.split('?')[0];
  }
  IDS.forEach(function (id) { H.bindNum($(id), calc); });
  $('basis').addEventListener('change', calc);
  $('copyB').addEventListener('click', function (e) { if (lastText) H.copyText(lastText, e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (lastText) H.whatsapp(lastText); });
  build(); calc();
  document.addEventListener('langchange', function () { build(); calc(); });
})();
