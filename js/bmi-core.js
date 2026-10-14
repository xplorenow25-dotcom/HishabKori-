(function (root) {
  var IN_M = 0.0254, LB_KG = 0.45359237;
  // cut-offs: t1 = where "overweight" starts, t2 = where "obese" starts
  var CUT = { asia: { t1: 23, t2: 25 }, who: { t1: 25, t2: 30 } };

  function heightM(o) {
    if (o.unit === 'cm') return o.cm / 100;
    return ((o.ft || 0) * 12 + (o.inch || 0)) * IN_M;
  }
  function weightKg(v, unit) { return unit === 'lb' ? v * LB_KG : v; }
  function bmi(kg, m) { return kg / (m * m); }

  function category(value, sys) {
    var v = Math.round(value * 10) / 10, c = CUT[sys] || CUT.asia;
    if (v < 18.5) return 'under';
    if (v < c.t1) return 'normal';
    if (v < c.t2) return 'over';
    return 'obese';
  }

  function analyse(kg, m, sys) {
    var c = CUT[sys] || CUT.asia, b = bmi(kg, m);
    var minKg = 18.5 * m * m, maxKg = (c.t1 - 0.1) * m * m;
    var gap = kg < minKg ? kg - minKg : (kg > maxKg ? kg - maxKg : 0);
    return { bmi: b, cat: category(b, sys), minKg: minKg, maxKg: maxKg, gapKg: gap, cut: c };
  }

  var api = { CUT: CUT, heightM: heightM, weightKg: weightKg, bmi: bmi, category: category, analyse: analyse };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BmiCore = api;
})(typeof window !== 'undefined' ? window : this);
