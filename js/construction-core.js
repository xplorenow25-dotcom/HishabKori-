// ============================================================================
//  EDIT YOUR MARKET PRICES HERE. Change a number, save, and upload this file.
// ============================================================================
const UNIT_RATES = {
  rodPerKg: 108,         // BDT per kg (500W Grade)
  cementPerBag: 520,     // BDT per 50kg bag (PCC/OPC)
  brickPerPc: 12.5,      // BDT per piece (1st Class)
  sandPerCft: 38,        // BDT per cft (Sylhet + Local avg)
  khoaPerCft: 120        // BDT per cft (Brick Chips)
};
// ============================================================================

(function (root) {
  // o: { floorArea, plannedStories, foundationStories, minLaborRate, maxLaborRate }
  function calculate(o, rates) {
    rates = rates || UNIT_RATES;
    var floorArea = o.floorArea, plannedStories = o.plannedStories, foundationStories = o.foundationStories;

    var rodKg = floorArea * (3.0 + 0.8 * Math.max(0, foundationStories - plannedStories));
    var rodTons = rodKg / 1000;
    var cementBags = floorArea * 0.408;
    var bricksPcs = floorArea * 15.4;
    var sandCft = floorArea * 1.875;
    var khoaCft = floorArea * 1.33;

    var rodCost = rodKg * rates.rodPerKg;
    var cementCost = cementBags * rates.cementPerBag;
    var brickCost = bricksPcs * rates.brickPerPc;
    var sandCost = sandCft * rates.sandPerCft;
    var khoaCost = khoaCft * rates.khoaPerCft;
    var totalMaterialCost = rodCost + cementCost + brickCost + sandCost + khoaCost;

    var minLaborCost = floorArea * o.minLaborRate;
    var maxLaborCost = floorArea * o.maxLaborRate;
    var grandTotalMin = totalMaterialCost + minLaborCost;
    var grandTotalMax = totalMaterialCost + maxLaborCost;

    return {
      rodKg: rodKg, rodTons: rodTons, cementBags: cementBags, bricksPcs: bricksPcs, sandCft: sandCft, khoaCft: khoaCft,
      rodCost: rodCost, cementCost: cementCost, brickCost: brickCost, sandCost: sandCost, khoaCost: khoaCost,
      totalMaterialCost: totalMaterialCost,
      minLaborCost: minLaborCost, maxLaborCost: maxLaborCost, grandTotalMin: grandTotalMin, grandTotalMax: grandTotalMax
    };
  }
  var api = { UNIT_RATES: UNIT_RATES, calculate: calculate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ConstructionCore = api;
})(typeof window !== 'undefined' ? window : this);
