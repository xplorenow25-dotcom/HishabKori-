(function () {
  var H = window.Hishab, C = window.ConstructionCore, R = C.UNIT_RATES;
  var $ = function (id) { return document.getElementById(id); };
  var lastText = null;

  function stories(n) { return (H.lang() === 'bn' ? H.toBn(n) : n) + ' ' + H.t('cc.story'); }
  function fstories(n) { return (H.lang() === 'bn' ? H.toBn(n) : n) + ' ' + H.t('cc.fstory'); }

  function build() {
    var p = $('plan').value || '1', f = $('found').value || '2', h = '';
    [1, 2, 3, 4].forEach(function (n) { h += '<option value="' + n + '">' + stories(n) + '</option>'; });
    $('plan').innerHTML = h; $('plan').value = p;
    h = '';
    [1, 2, 3, 4, 5].forEach(function (n) { h += '<option value="' + n + '">' + fstories(n) + '</option>'; });
    $('found').innerHTML = h; $('found').value = f;
  }

  function range(a, b) { return H.money(a, 0) + ' – ' + H.money(b, 0); }
  function qty(n, d) { return H.fmt(n, d); }
  function row(name, q, price, cost) {
    return '<tr><td>' + name + '</td><td>' + q + '</td><td>' + price + '</td><td>' + H.fmt(cost, 0) + '</td></tr>';
  }

  function calc() {
    var area = H.num($('area').value), lmin = H.num($('lmin').value), lmax = H.num($('lmax').value);
    var out = $('res'), msg = $('msg');
    msg.innerHTML = '';
    if (!(area > 0) || lmin === null || lmax === null) {
      out.innerHTML = '<small>' + H.t('cc.grand') + '</small><div class="ph">' + H.t('empty.res') + '</div>';
      $('mat').innerHTML = ''; $('lab').innerHTML = ''; lastText = null; return;
    }
    var swapped = false;
    if (lmin > lmax) { var tmp = lmin; lmin = lmax; lmax = tmp; swapped = true; }
    var planned = parseInt($('plan').value, 10), found = parseInt($('found').value, 10);
    var r = C.calculate({ floorArea: area, plannedStories: planned, foundationStories: found, minLaborRate: lmin, maxLaborRate: lmax });

    var warn = '';
    if (swapped) warn += '<div class="msg">' + H.t('cc.err.minmax') + '</div>';
    if (found < planned) warn += '<div class="msg">' + H.t('cc.warn.found') + '</div>';
    msg.innerHTML = warn;

    out.innerHTML = '<small>' + H.t('cc.grand') + '</small>' +
      '<div class="big" style="font-size:28px">' + range(r.grandTotalMin, r.grandTotalMax) + '</div>' +
      '<div class="stat"><span>' + H.t('cc.mat.total') + '</span><b>' + H.money(r.totalMaterialCost, 0) + '</b></div>' +
      '<div class="stat"><span>' + H.t('cc.lab.range') + '</span><b>' + range(r.minLaborCost, r.maxLaborCost) + '</b></div>' +
      '<div class="st">' + H.t('cc.res.note') + '</div>';

    var t = '<div class="grp"><h3>' + H.t('cc.tbl.t') + '</h3><div class="tw"><table class="tbl"><thead><tr><th>' + H.t('cc.th.mat') + '</th><th>' +
      H.t('cc.th.qty') + '</th><th>' + H.t('cc.th.price') + '</th><th>' + H.t('cc.th.cost') + '</th></tr></thead><tbody>' +
      row(H.t('cc.m.rod'), qty(r.rodKg, 1) + ' ' + H.t('cc.u.kg') + '<br>(' + qty(r.rodTons, 2) + ' ' + H.t('cc.u.ton') + ')', '৳ ' + H.fmt(R.rodPerKg, 2) + ' / ' + H.t('cc.u.kg'), r.rodCost) +
      row(H.t('cc.m.cement'), qty(r.cementBags, 1) + ' ' + H.t('cc.u.bag'), '৳ ' + H.fmt(R.cementPerBag, 2) + ' / ' + H.t('cc.p.bag'), r.cementCost) +
      row(H.t('cc.m.brick'), qty(r.bricksPcs, 0) + ' ' + H.t('cc.u.pc'), '৳ ' + H.fmt(R.brickPerPc, 2) + ' / ' + H.t('cc.p.pc'), r.brickCost) +
      row(H.t('cc.m.sand'), qty(r.sandCft, 1) + ' ' + H.t('cc.u.cft'), '৳ ' + H.fmt(R.sandPerCft, 2) + ' / ' + H.t('cc.u.cft'), r.sandCost) +
      row(H.t('cc.m.khoa'), qty(r.khoaCft, 1) + ' ' + H.t('cc.u.cft'), '৳ ' + H.fmt(R.khoaPerCft, 2) + ' / ' + H.t('cc.u.cft'), r.khoaCost) +
      '</tbody><tfoot><tr><td colspan="3">' + H.t('cc.total.row') + '</td><td>' + H.fmt(r.totalMaterialCost, 0) + '</td></tr></tfoot></table></div></div>';
    $('mat').innerHTML = t;

    var p = H.t('cc.lab.p').replace('{min}', H.money(lmin, 0)).replace('{max}', H.money(lmax, 0)).replace('{area}', H.fmt(area, 2))
      .replace('{a}', H.money(r.minLaborCost, 0)).replace('{b}', H.money(r.maxLaborCost, 0));
    $('lab').innerHTML = '<div class="banner"><i class="ti ti-users"></i><div><b>' + H.t('cc.lab.t') + '</b><p>' + p + '</p></div></div>';

    lastText = 'Hishab – ' + H.t('cc.h1') + '\n' + H.t('cc.area') + ': ' + H.fmt(area, 2) + '\n' + H.t('cc.mat.total') + ': ' + H.money(r.totalMaterialCost, 0) +
      '\n' + H.t('cc.lab.range') + ': ' + range(r.minLaborCost, r.maxLaborCost) + '\n' + H.t('cc.grand') + ': ' + range(r.grandTotalMin, r.grandTotalMax) +
      '\n' + location.href.split('?')[0];
  }

  $('area').value = H.fmt(1200, 0); $('lmin').value = H.fmt(300, 0); $('lmax').value = H.fmt(600, 0);
  ['area', 'lmin', 'lmax'].forEach(function (id) { H.bindNum($(id), calc); });
  ['plan', 'found'].forEach(function (id) { $(id).addEventListener('change', calc); });
  $('copyB').addEventListener('click', function (e) { if (lastText) H.copyText(lastText, e.currentTarget); });
  $('shareB').addEventListener('click', function () { if (lastText) H.whatsapp(lastText); });
  build(); calc();
  document.addEventListener('langchange', function () { build(); calc(); });
})();
