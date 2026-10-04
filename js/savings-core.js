(function (root) {
  function r2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }

  // DPS: deposit at start of each month; interest accrues monthly, credited every k months
  function dps(deposit, rate, months, k) {
    if (!(deposit > 0) || !(months > 0) || !(rate >= 0)) return null;
    var n = Math.round(months), bal = 0, acc = 0, yearly = [];
    for (var m = 1; m <= n; m++) {
      bal += deposit;
      acc += bal * rate / 12 / 100;
      if (m % k === 0) { bal += acc; acc = 0; }
      if (m % 12 === 0 || m === n) {
        yearly.push({ year: Math.ceil(m / 12), deposited: deposit * m, balance: bal + acc });
      }
    }
    bal += acc;
    var dep = deposit * n;
    return { deposited: dep, maturity: r2(bal), interest: r2(bal - dep), yearly: yearly.map(function (y) {
      return { year: y.year, deposited: y.deposited, balance: r2(y.balance) };
    }) };
  }

  // FDR: mode 'simple' | 'compound'; freq = periods per year (1, 4, 12); tds = percent
  function fdr(P, rate, years, mode, freq, tdsPct, excise) {
    if (!(P > 0) || !(years > 0) || !(rate >= 0)) return null;
    var maturity = mode === 'simple' ? P + P * rate / 100 * years : P * Math.pow(1 + rate / 100 / freq, freq * years);
    var gross = maturity - P;
    var tds = gross * (tdsPct / 100);
    var ex = excise > 0 ? excise : 0;
    var net = gross - tds - ex;
    return { gross: r2(gross), tds: r2(tds), excise: r2(ex), net: r2(net), final: r2(P + net), maturity: r2(maturity) };
  }

  var api = { dps: dps, fdr: fdr };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SavingsCore = api;
})(typeof window !== 'undefined' ? window : this);
