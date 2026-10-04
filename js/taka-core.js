(function (root) {
  var BN = ['শূন্য','এক','দুই','তিন','চার','পাঁচ','ছয়','সাত','আট','নয়','দশ',
    'এগারো','বারো','তেরো','চৌদ্দ','পনেরো','ষোল','সতেরো','আঠারো','ঊনিশ','বিশ',
    'একুশ','বাইশ','তেইশ','চব্বিশ','পঁচিশ','ছাব্বিশ','সাতাশ','আটাশ','ঊনত্রিশ','ত্রিশ',
    'একত্রিশ','বত্রিশ','তেত্রিশ','চৌত্রিশ','পঁয়ত্রিশ','ছত্রিশ','সাঁইত্রিশ','আটত্রিশ','ঊনচল্লিশ','চল্লিশ',
    'একচল্লিশ','বিয়াল্লিশ','তেতাল্লিশ','চুয়াল্লিশ','পঁয়তাল্লিশ','ছেচল্লিশ','সাতচল্লিশ','আটচল্লিশ','ঊনপঞ্চাশ','পঞ্চাশ',
    'একান্ন','বায়ান্ন','তিপ্পান্ন','চুয়ান্ন','পঞ্চান্ন','ছাপ্পান্ন','সাতান্ন','আটান্ন','ঊনষাট','ষাট',
    'একষট্টি','বাষট্টি','তেষট্টি','চৌষট্টি','পঁয়ষট্টি','ছেষট্টি','সাতষট্টি','আটষট্টি','ঊনসত্তর','সত্তর',
    'একাত্তর','বাহাত্তর','তিয়াত্তর','চুয়াত্তর','পঁচাত্তর','ছিয়াত্তর','সাতাত্তর','আটাত্তর','ঊনআশি','আশি',
    'একাশি','বিরাশি','তিরাশি','চুরাশি','পঁচাশি','ছিয়াশি','সাতাশি','আটাশি','ঊননব্বই','নব্বই',
    'একানব্বই','বিরানব্বই','তিরানব্বই','চুরানব্বই','পঁচানব্বই','ছিয়ানব্বই','সাতানব্বই','আটানব্বই','নিরানব্বই'];

  var ONES = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve',
    'Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  var TENS = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function en99(n) {
    if (n < 20) return ONES[n];
    var o = n % 10;
    return TENS[Math.floor(n / 10)] + (o ? '-' + ONES[o] : '');
  }

  function parts(n) {
    var crore = n / 10000000n, r = n % 10000000n;
    var lakh = r / 100000n; r = r % 100000n;
    var th = r / 1000n; r = r % 1000n;
    var h = r / 100n, last = r % 100n;
    return { crore: crore, lakh: Number(lakh), th: Number(th), h: Number(h), last: Number(last) };
  }

  function bnInt(n) {
    if (n === 0n) return BN[0];
    var p = parts(n), out = [];
    if (p.crore > 0n) out.push(bnInt(p.crore) + ' কোটি');
    if (p.lakh) out.push(BN[p.lakh] + ' লক্ষ');
    if (p.th) out.push(BN[p.th] + ' হাজার');
    if (p.h) out.push(BN[p.h] + ' শত');
    if (p.last) out.push(BN[p.last]);
    return out.join(' ');
  }

  function enInt(n) {
    if (n === 0n) return ONES[0];
    var p = parts(n), out = [];
    if (p.crore > 0n) out.push(enInt(p.crore) + ' Crore');
    if (p.lakh) out.push(en99(p.lakh) + ' Lakh');
    if (p.th) out.push(en99(p.th) + ' Thousand');
    if (p.h) out.push(ONES[p.h] + ' Hundred');
    if (p.last) out.push(en99(p.last));
    return out.join(' ');
  }

  // input: string with English digits and at most one dot
  function convert(str) {
    var m = /^(\d+)?(?:\.(\d*))?$/.exec(str);
    if (!m || (!m[1] && !m[2])) return { ok: false, error: 'invalid' };
    var intStr = (m[1] || '0').replace(/^0+(?=\d)/, '');
    if (intStr.length > 13) return { ok: false, error: 'toolong' };
    var frac = m[2] || '';
    var taka = BigInt(intStr), paisa = 0;
    if (frac.length) {
      var f = (frac + '00').slice(0, 2);
      paisa = parseInt(f, 10);
      if (frac.length > 2 && frac.charAt(2) >= '5') paisa += 1;
      if (paisa === 100) { paisa = 0; taka += 1n; }
    }
    var bn, en;
    if (taka === 0n && paisa === 0) {
      bn = 'শূন্য টাকা মাত্র'; en = 'Zero Taka Only';
    } else if (taka === 0n) {
      bn = BN[paisa] + ' পয়সা মাত্র'; en = en99(paisa) + ' Paisa Only';
    } else if (paisa === 0) {
      bn = bnInt(taka) + ' টাকা মাত্র'; en = enInt(taka) + ' Taka Only';
    } else {
      bn = bnInt(taka) + ' টাকা ' + BN[paisa] + ' পয়সা মাত্র';
      en = enInt(taka) + ' Taka and ' + en99(paisa) + ' Paisa Only';
    }
    return { ok: true, bn: bn, en: en, taka: taka, paisa: paisa, intStr: taka.toString() };
  }

  var api = { convert: convert, BN: BN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TakaCore = api;
})(typeof window !== 'undefined' ? window : this);
