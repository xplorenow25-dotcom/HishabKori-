(function (root) {
  // p% of n
  function of(p, n) { return n * p / 100; }
  // a is what percent of b (null when b is 0)
  function whatPercent(a, b) { return b === 0 ? null : a / b * 100; }
  // percentage change from -> to (null when from is 0)
  function change(from, to) {
    if (from === 0) return null;
    var d = to - from;
    return { pct: d / Math.abs(from) * 100, diff: d };
  }
  var api = { of: of, whatPercent: whatPercent, change: change };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PercentageCore = api;
})(typeof window !== 'undefined' ? window : this);
