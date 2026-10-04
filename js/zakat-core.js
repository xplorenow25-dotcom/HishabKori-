(function (root) {
  var BHORI_G = 11.664, GOLD_NISAB_BHORI = 7.5, SILVER_NISAB_BHORI = 52.5, RATE = 0.025;
  function r2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }

  // a: {cash, goldBhori, silverBhori, business, receivable, other, debts, goldPrice, silverPrice, basis:'silver'|'gold'}
  function zakat(a) {
    function n(x) { return x > 0 ? x : 0; }
    var gold = n(a.goldBhori) * n(a.goldPrice), silver = n(a.silverBhori) * n(a.silverPrice);
    var assets = n(a.cash) + gold + silver + n(a.business) + n(a.receivable) + n(a.other);
    var net = Math.max(0, assets - n(a.debts));
    var nisabBhori = a.basis === 'gold' ? GOLD_NISAB_BHORI : SILVER_NISAB_BHORI;
    var price = a.basis === 'gold' ? n(a.goldPrice) : n(a.silverPrice);
    var nisab = nisabBhori * price;
    var needPrice = !(price > 0);
    var due = !needPrice && net >= nisab && net > 0;
    return { assets: r2(assets), net: r2(net), nisab: r2(nisab), nisabBhori: nisabBhori, needPrice: needPrice,
      due: due, zakat: due ? r2(net * RATE) : 0, gold: r2(gold), silver: r2(silver) };
  }

  var api = { zakat: zakat, BHORI_G: BHORI_G, GOLD_NISAB_BHORI: GOLD_NISAB_BHORI, SILVER_NISAB_BHORI: SILVER_NISAB_BHORI };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ZakatCore = api;
})(typeof window !== 'undefined' ? window : this);
