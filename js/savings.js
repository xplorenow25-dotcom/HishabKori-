(function () {
  var H = window.Hishab, S = window.SavingsCore;
  var $ = function (id) { return document.getElementById(id); };
  var tab = 'dps', lastText = null;

  function yearsOf(valId, unitId) {
    var t = H.num($(valId).value);
    if (!(t > 0)) return null;
    return $(unitId).value === 'y' ? t : t / 12;
  }
  function build() {
    ['dUnit', 'fUnit'].forEach(function (id) {
      var v = $(id).value || 'y';
      $(id).innerHTML = '<option value="y">' + H.t('years') + '</option><option value="m">' + H.t('months') + '</option>';
      $(id).value = v;
    });
    var c = $('comp').value || '3';
    $('comp').innerHTML = '<option value="3">' + H.t('sv.c.q') + '</option><option value="1">' + H.t('sv.c.m') + '</option>';
    $('comp').value = c;
    var m = $('mode').value || 'simple';
    $('mode').innerHTML = '<option value="simple">' + H.t('sv.mode.s') + '</option><option value="compound">' + H.t('sv.mode.c') + '</option>';
    $('mode').value = m;
    var f = $('freq').value || '4';
    $('freq').innerHTML = '<option value="1">' + H.t('sv.f.y') + '</option><option value="4">' + H.t('sv.f.q') + '</option><option value="12">' + H.t('sv.f.m') + '</option>';
    $('freq').value = f;
    var t = $('tds').value || '10';
    $('tds').innerHTML = '<option value="10">' + H.t('sv.tds10') + '</option><option value="15">' + H.t('sv.tds15') + '</option>';
    $('tds').value = t;
    $('tabD').classList.toggle('on', tab === 'dps');
    $('tabF').classList.toggle('on', tab === 'fdr');
    $('panD').classList.toggle('hide', tab !== 'dps');
    $('panF').classList.toggle('hide', tab !== 'fdr');
    $('freqWrap').classList.toggle('hide', $('mode').value !== 'compound');
  }
  function empty(el, label) { el.innerHTML = '<small>' + label + '</small><div class="ph">' + H.t('empty.res') + '</div>'; }

  function calcD() {
    var out = $('resD'), dep = H.num($('dep').value), rate = H.num($('drate').value), y = yearsOf('dten', 'dUnit');
    var r = (dep > 0 && y > 0 && rate !== null) ? S.dps(dep, rate, Math.round(y * 12), parseInt($('comp').value, 10)) : null;
    if (!r) { empty(out, H.t('sv.maturity')); $('yearly').innerHTML = ''; lastText = null; return; }
    out.innerHTML = '<small>' + H.t('sv.maturity') + '</small><div class="big">' + H.money(r.maturity, 2) + '</div>' +
      '<div class="stat"><span>' + H.t('sv.deposited') + '</span><b>' + H.money(r.deposited, 2) + '</b></div>' +
      '<div class="stat"><span>' + H.t('sv.interest') + '</span><b>' + H.money(r.interest, 2) + '</b></div>' +
      '<div class="st">' + H.t('sv.dpsnote') + '</div>';
    var h = '<div class="tw"><table class="tbl"><thead><tr><th>' + H.t('sv.th.year') + '</th><th>' + H.t('sv.th.dep') + '</th><th>' + H.t('sv.th.bal') + '</th></tr></thead><tbody>';
    r.yearly.forEach(function (y) { h += '<tr><td>' + H.fmt(y.year, 0) + '</td><td>' + H.fmt(y.deposited, 2) + '</td><td>' + H.fmt(y.balance, 2) + '</td></tr>'; });
    $('yearly').innerHTML = h + '</tbody></table></div>';
    lastText = 'Hishab – DPS\n' + H.t('sv.dep') + ': ' + $('dep').value + '\n' + H.t('sv.deposited') + ': ' + H.money(r.deposited, 2) +
      '\n' + H.t('sv.interest') + ': ' + H.money(r.interest, 2) + '\n' + H.t('sv.maturity') + ': ' + H.money(r.maturity, 2) + '\n' + location.href.split('?')[0];
  }

  function calcF() {
    $('freqWrap').classList.toggle('hide', $('mode').value !== 'compound');
    var out = $('resF'), P = H.num($('famt').value), rate = H.num($('frate').value), y = yearsOf('ften', 'fUnit'), ex = H.num($('excise').value) || 0;
    var r = (P > 0 && y > 0 && rate !== null) ? S.fdr(P, rate, y, $('mode').value, parseInt($('freq').value, 10), parseInt($('tds').value, 10), ex) : null;
    if (!r) { empty(out, H.t('sv.final')); lastText = null; return; }
    out.innerHTML = '<small>' + H.t('sv.final') + '</small><div class="big">' + H.money(r.final, 2) + '</div>' +
      '<div class="stat"><span>' + H.t('sv.gross') + '</span><b>' + H.money(r.gross, 2) + '</b></div>' +
      '<div class="stat"><span>' + H.t('sv.taxv') + ' (' + H.fmt(parseInt($('tds').value, 10), 0) + '%)</span><b>− ' + H.money(r.tds, 2) + '</b></div>' +
      (r.excise > 0 ? '<div class="stat"><span>' + H.t('sv.exv') + '</span><b>− ' + H.money(r.excise, 2) + '</b></div>' : '') +
      '<div class="stat"><span>' + H.t('sv.net') + '</span><b>' + H.money(r.net, 2) + '</b></div>';
    lastText = 'Hishab – FDR\n' + H.t('sv.fdr.amt') + ': ' + $('famt').value + '\n' + H.t('sv.gross') + ': ' + H.money(r.gross, 2) +
      '\n' + H.t('sv.taxv') + ': ' + H.money(r.tds, 2) + '\n' + H.t('sv.final') + ': ' + H.money(r.final, 2) + '\n' + location.href.split('?')[0];
  }

  function all() { calcD(); calcF(); }
  ['dep', 'drate', 'dten'].forEach(function (id) { H.bindNum($(id), calcD); });
  ['famt', 'frate', 'ften', 'excise'].forEach(function (id) { H.bindNum($(id), calcF); });
  ['dUnit', 'comp'].forEach(function (id) { $(id).addEventListener('change', calcD); });
  ['fUnit', 'mode', 'freq', 'tds'].forEach(function (id) { $(id).addEventListener('change', calcF); });
  $('tabD').addEventListener('click', function () { tab = 'dps'; build(); calcD(); });
  $('tabF').addEventListener('click', function () { tab = 'fdr'; build(); calcF(); });
  $('copyB').addEventListener('click', function (e) { if (lastText) H.copyText(lastText, e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (lastText) H.whatsapp(lastText); });
  build(); all();
  document.addEventListener('langchange', function () { build(); all(); });
})();
