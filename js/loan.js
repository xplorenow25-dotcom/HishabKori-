(function () {
  var H = window.Hishab, L = window.LoanCore;
  var $ = function (id) { return document.getElementById(id); };
  var showAll = false, last = null;

  function months() {
    var t = H.num($('ten').value);
    if (!(t > 0)) return null;
    return $('unit').value === 'y' ? t * 12 : t;
  }
  function build() {
    var u = $('unit').value || 'y', m = $('method').value || 'reducing';
    $('unit').innerHTML = '<option value="y">' + H.t('years') + '</option><option value="m">' + H.t('months') + '</option>';
    $('unit').value = u;
    $('method').innerHTML = '<option value="reducing">' + H.t('lo.m.reducing') + '</option><option value="flat">' + H.t('lo.m.flat') + '</option>';
    $('method').value = m;
  }
  function calc() {
    var P = H.num($('amt').value), rate = H.num($('rate').value), n = months();
    var out = $('res');
    var r = (P > 0 && n > 0 && rate !== null) ? L.loan(P, rate, n, $('method').value) : null;
    last = r;
    if (!r) {
      out.innerHTML = '<small>' + H.t('lo.emi') + '</small><div class="ph">' + H.t('empty.res') + '</div>';
      $('sched').classList.add('hide'); return;
    }
    out.innerHTML = '<small>' + H.t('lo.emi') + '</small><div class="big">' + H.money(r.emi, 2) + '</div>' +
      '<div class="stat"><span>' + H.t('lo.int') + '</span><b>' + H.money(r.interest, 2) + '</b></div>' +
      '<div class="stat"><span>' + H.t('lo.tot') + '</span><b>' + H.money(r.total, 2) + '</b></div>' +
      ($('method').value === 'flat' ? '<div class="st">' + H.t('lo.flatnote') + '</div>' : '');
    $('sched').classList.remove('hide');
    renderTable();
  }
  function renderTable() {
    var box = $('tbl');
    $('toggle').textContent = showAll ? H.t('lo.hide') : H.t('lo.show');
    if (!showAll || !last) { box.innerHTML = ''; return; }
    var h = '<div class="tw"><table class="tbl"><thead><tr><th>' + H.t('lo.th.m') + '</th><th>' + H.t('lo.th.open') + '</th><th>' + H.t('lo.th.int') + '</th><th>' + H.t('lo.th.prin') + '</th><th>' + H.t('lo.th.close') + '</th></tr></thead><tbody>';
    last.rows.forEach(function (r) {
      h += '<tr><td>' + H.fmt(r.m, 0) + '</td><td>' + H.fmt(r.open, 2) + '</td><td>' + H.fmt(r.interest, 2) + '</td><td>' + H.fmt(r.principal, 2) + '</td><td>' + H.fmt(r.close, 2) + '</td></tr>';
    });
    box.innerHTML = h + '</tbody></table></div>';
  }
  function summary() {
    return 'Hishab – ' + H.t('lo.h1') + '\n' + H.t('lo.amt') + ': ' + $('amt').value + '\n' + H.t('lo.rate') + ': ' + $('rate').value +
      '\n' + H.t('lo.emi') + ': ' + H.money(last.emi, 2) + '\n' + H.t('lo.int') + ': ' + H.money(last.interest, 2) +
      '\n' + H.t('lo.tot') + ': ' + H.money(last.total, 2) + '\n' + location.href.split('?')[0];
  }
  ['amt', 'rate', 'ten'].forEach(function (id) { H.bindNum($(id), calc); });
  ['unit', 'method'].forEach(function (id) { $(id).addEventListener('change', calc); });
  $('toggle').addEventListener('click', function () { showAll = !showAll; renderTable(); });
  $('copyB').addEventListener('click', function (e) { if (last) H.copyText(summary(), e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (last) H.whatsapp(summary()); });
  build(); calc();
  document.addEventListener('langchange', function () { build(); calc(); });
})();
