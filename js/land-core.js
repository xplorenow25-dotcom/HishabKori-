(function (root) {
  var ORDER = ['sqft', 'sqm', 'sqyd', 'chatak', 'katha', 'decimal', 'bigha', 'acre', 'hectare'];
  var DEC = 435.6;   // sq ft per decimal (shatangsho)
  var SQM = 10.7639104; // sq ft per sq meter

  // o: { kathaSqft, bighaMode: 'std'|'d33'|'d52'|'custom', bighaDecimals }
  function units(o) {
    o = o || {};
    var k = o.kathaSqft > 0 ? o.kathaSqft : 720, b;
    if (o.bighaMode === 'd33') b = 33 * DEC;
    else if (o.bighaMode === 'd52') b = 52 * DEC;
    else if (o.bighaMode === 'custom') b = (o.bighaDecimals > 0 ? o.bighaDecimals : 33) * DEC;
    else b = 20 * k;
    return { sqft: 1, sqm: SQM, sqyd: 9, chatak: k / 16, katha: k, decimal: DEC, bigha: b, acre: 43560, hectare: 107639.104 };
  }

  // value in `unit` -> square feet
  function toSqft(v, unit, u) { return v * u[unit]; }
  // square feet -> value in `unit`
  function fromSqft(sqft, unit, u) { return sqft / u[unit]; }

  function mixed(sqft, u) {
    sqft = Math.round(sqft * 1e6) / 1e6;
    var kt = Math.floor(sqft / u.katha + 1e-9);
    var rem = sqft - kt * u.katha;
    var ch = Math.floor(rem / u.chatak + 1e-9);
    var sf = Math.round((rem - ch * u.chatak) * 1e4) / 1e4;
    if (sf < 0) sf = 0;
    return { katha: kt, chatak: ch, sqft: sf };
  }

  // dim: 'ft' or 'm'; priceUnit: any unit key
  function plot(len, wid, dim, price, priceUnit, u) {
    var area = len * wid * (dim === 'm' ? SQM : 1);
    var total = null;
    if (price > 0) total = Math.round(area / u[priceUnit] * price);
    return { sqft: area, total: total };
  }

  var api = { ORDER: ORDER, units: units, toSqft: toSqft, fromSqft: fromSqft, mixed: mixed, plot: plot };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LandCore = api;
})(typeof window !== 'undefined' ? window : this);
