(function (root) {
  function r2(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }

  // method: 'reducing' | 'flat'
  function loan(P, annualRate, months, method) {
    if (!(P > 0) || !(months > 0) || !(annualRate >= 0)) return null;
    var n = Math.round(months), rows = [], emi, total, interest;
    if (method === 'flat') {
      interest = r2(P * (annualRate / 100) * (n / 12));
      total = r2(P + interest);
      emi = r2(total / n);
      var bal = P, prinPer = P / n, intPer = interest / n;
      for (var i = 1; i <= n; i++) {
        var open = bal, p = r2(prinPer), it = r2(intPer);
        if (i === n) { p = r2(open); it = r2(interest - r2(intPer) * (n - 1)); }
        bal = r2(open - p);
        rows.push({ m: i, open: open, interest: it, principal: p, pay: r2(p + it), close: i === n ? 0 : bal });
      }
      return { emi: emi, total: total, interest: interest, rows: rows, method: method };
    }
    var r = annualRate / 12 / 100;
    emi = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    emi = r2(emi);
    var b = P, tot = 0, tint = 0;
    for (var k = 1; k <= n; k++) {
      var op = b, ii = r2(op * r), pp = r2(emi - ii), pay = emi;
      if (k === n) { pp = r2(op); pay = r2(pp + ii); }
      b = r2(op - pp);
      tot += pay; tint += ii;
      rows.push({ m: k, open: op, interest: ii, principal: pp, pay: pay, close: k === n ? 0 : b });
    }
    return { emi: emi, total: r2(tot), interest: r2(tint), rows: rows, method: method };
  }

  var api = { loan: loan };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LoanCore = api;
})(typeof window !== 'undefined' ? window : this);
