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


  // Tax-free thresholds, AY 2026-27 (Finance Act 2026)
  var THRESHOLDS = { gen: 400000, women: 450000, disabled: 525000, ff: 550000 };

  // Individual: slab tax, investment rebate, minimum tax, filing-time adjustment
  // o: { invest, newTaxpayer, filing: 'none'|'early'|'q3'|'q4' }
  function personal(taxable, threshold, o) {
    o = o || {};
    var base = tax(taxable, threshold);
    if (!base) return null;
    var th = threshold >= 0 ? threshold : DEFAULT_THRESHOLD;
    var rebate = 0, minTax = 0, minApplied = false, after = 0;
    if (taxable > th) {
      var inv = o.invest > 0 ? o.invest : 0;
      rebate = Math.min(inv * 0.10, taxable * 0.03, 750000, base.tax);
      after = base.tax - rebate;
      minTax = o.newTaxpayer ? 1000 : 5000;
      if (after < minTax) { after = minTax; minApplied = true; }
    }
    var adj = 0;
    if (after > 0) {
      if (o.filing === 'early') adj = -Math.min(after * 0.05, 25000);
      else if (o.filing === 'q3') adj = Math.max(after * 0.02, 3000);
      else if (o.filing === 'q4') adj = Math.max(after * 0.05, 5000);
    }
    var fin = after + adj;
    return { bands: base.bands, taxable: taxable, threshold: th, slabTax: r2(base.tax), rebate: r2(rebate), minTax: minTax,
      minApplied: minApplied, afterRebate: r2(after), filingAdj: r2(adj), final: r2(fin), monthly: r2(fin / 12),
      effective: taxable > 0 ? fin / taxable * 100 : 0 };
  }

  // Salary: exempt part = lower of one third of salary or 5,00,000
  function salary(o) {
    var annual = (o.monthly > 0 ? o.monthly * 12 : 0) + (o.bonus > 0 ? o.bonus : 0);
    var exempt = Math.min(annual / 3, 500000);
    var p = personal(Math.max(0, annual - exempt), o.threshold, o);
    p.annual = r2(annual); p.exempt = r2(exempt);
    return p;
  }

  // Company income tax rates, AY 2026-27 to AY 2030-31 (Finance Act 2026); bank = rate if all transactions via banking channel
  var CORP = {
    other: { rate: 27.5, bank: 25 }, listed10: { rate: 22.5, bank: 20 }, listedLess: { rate: 25, bank: 22.5 },
    firm: { rate: 27.5 }, coop: { rate: 20 }, bankListed: { rate: 37.5 }, bankUnlisted: { rate: 40 }, university: { rate: 5 }
  };
  function corp(profit, type, banking, receipts, minRate) {
    var c = CORP[type];
    if (!c || !(profit >= 0)) return null;
    var rate = (banking && c.bank !== undefined) ? c.bank : c.rate;
    var regular = profit * rate / 100;
    var min = (receipts > 0 && minRate > 0) ? receipts * minRate / 100 : 0;
    var t = Math.max(regular, min);
    return { rate: rate, regular: r2(regular), minimum: r2(min), tax: r2(t), minApplied: min > regular, net: r2(profit - t), hasBank: c.bank !== undefined };
  }

  var api = { tax: tax, personal: personal, salary: salary, corp: corp, CORP: CORP, THRESHOLDS: THRESHOLDS, SLABS: SLABS, DEFAULT_THRESHOLD: DEFAULT_THRESHOLD };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TaxCore = api;
})(typeof window !== 'undefined' ? window : this);
