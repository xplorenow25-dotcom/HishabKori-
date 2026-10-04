(function (root) {
  var LAKH = 100000;
  // slab widths (BDT) and rates after the tax-free threshold; the last band has no limit
  var SLABS = [
    { width: 3 * LAKH, rate: 10 }, { width: 4 * LAKH, rate: 15 }, { width: 5 * LAKH, rate: 20 },
    { width: 20 * LAKH, rate: 25 }, { width: Infinity, rate: 30 }
  ];
  var DEFAULT_THRESHOLD = 4 * LAKH;
  function r2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }

  function tax(income, threshold) {
    if (!(income >= 0)) return null;
    var th = threshold >= 0 ? threshold : DEFAULT_THRESHOLD;
    var left = Math.max(0, income - th), from = th, total = 0, bands = [];
    bands.push({ from: 0, to: Math.min(income, th), rate: 0, amount: Math.min(income, th), tax: 0 });
    for (var i = 0; i < SLABS.length && left > 0; i++) {
      var amt = Math.min(left, SLABS[i].width), t = amt * SLABS[i].rate / 100;
      bands.push({ from: from, to: from + amt, rate: SLABS[i].rate, amount: amt, tax: r2(t) });
      total += t; left -= amt; from += amt;
    }
    return { tax: r2(total), bands: bands, effective: income > 0 ? total / income * 100 : 0, monthly: r2(total / 12) };
  }

  var api = { tax: tax, SLABS: SLABS, DEFAULT_THRESHOLD: DEFAULT_THRESHOLD };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TaxCore = api;
})(typeof window !== 'undefined' ? window : this);
