/*
  Hishab PDF report. Loaded automatically on calculator pages by common.js.
  Reads the inputs and results currently on screen, builds an A4 report, and opens the
  browser's print window so the visitor can choose "Save as PDF". Text stays sharp and Bangla
  letters are drawn by the browser, so they always look right. Nothing leaves the device.
*/
(function () {
  var H = window.Hishab;
  if (!H || window.__hrpt) return;
  window.__hrpt = true;

  var LOGO = '<svg viewBox="0 0 64 64" width="34" height="34"><rect width="64" height="64" rx="16" fill="#fff"/><rect x="12" y="12" width="17" height="17" rx="5" fill="#0B6B4F"/><rect x="35" y="12" width="17" height="17" rx="5" fill="#0B6B4F" fill-opacity=".55"/><rect x="12" y="35" width="17" height="17" rx="5" fill="#0B6B4F" fill-opacity=".55"/><rect x="35" y="35" width="17" height="17" rx="5" fill="#F2A81D"/><rect x="39" y="40" width="9" height="2.6" rx="1.3" fill="#14201B"/><rect x="39" y="45" width="9" height="2.6" rx="1.3" fill="#14201B"/></svg>';

  var CSS = '' +
    '.bt.pdf{background:#0B6B4F;color:#fff;border-color:#0B6B4F}.bt.pdf:hover{background:#084D39}' +
    '.hrp-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#14201B;color:#fff;border-radius:12px;padding:12px 18px;font-size:15.5px;line-height:1.5;z-index:80;max-width:min(420px,90vw);text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.25)}' +
    '#hrpt{display:none}' +
    '@media print{' +
    '@page{size:A4;margin:12mm}' +
    'html,body{background:#fff!important}' +
    'body>*:not(#hrpt){display:none!important}' +
    '#hrpt{display:block;font-family:"Noto Sans Bengali","Hind Siliguri","Inter",sans-serif;color:#14201B;font-size:12pt;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '#hrpt *{box-sizing:border-box}' +
    '.rp-head{display:flex;justify-content:space-between;align-items:center;background:#0B6B4F;color:#fff;border-radius:10px;border-bottom:4px solid #F2A81D;padding:12px 16px}' +
    '.rp-brand{display:flex;align-items:center;gap:10px}' +
    '.rp-brand b{font-size:20pt;font-weight:600;line-height:1.2}' +
    '.rp-brand small{display:block;font-size:9.5pt;color:#BFE3D4;line-height:1.3}' +
    '.rp-date{font-size:10pt;color:#DCEFE6;text-align:right}' +
    '.rp-title{font-size:21pt;font-weight:600;color:#0B6B4F;margin:18px 0 2px;line-height:1.3}' +
    '.rp-sec{font-size:11pt;font-weight:600;color:#0B6B4F;margin:18px 0 6px;padding-bottom:4px;border-bottom:1px solid #D5E5DB}' +
    '.rp-in{width:100%;border-collapse:collapse}' +
    '.rp-in td{padding:6px 10px;font-size:11.5pt;vertical-align:top}' +
    '.rp-in tr:nth-child(odd) td{background:#F4F8F5}' +
    '.rp-in td:first-child{color:#5B6E64;width:46%}' +
    '.rp-in td:last-child{font-weight:500;text-align:right}' +
    '.rp-hero{background:#0B6B4F;color:#fff;border-radius:12px;padding:16px 18px;margin-top:14px;break-inside:avoid}' +
    '.rp-lab{color:#F2A81D;font-size:10.5pt;margin-top:6px}.rp-lab:first-child{margin-top:0}' +
    '.rp-big{font-size:27pt;font-weight:600;line-height:1.3;word-break:break-word}' +
    '.rp-amt{font-size:11pt;color:#BFE3D4}' +
    '.rp-w{font-size:17pt;font-weight:500;line-height:1.45;word-break:break-word}' +
    '.rp-w2{font-size:12pt;color:#BFE3D4;border-top:1px solid rgba(255,255,255,.3);margin-top:8px;padding-top:8px}' +
    '.rp-stat{display:flex;justify-content:space-between;gap:14px;border-top:1px solid rgba(255,255,255,.25);padding:7px 0;font-size:11.5pt}' +
    '.rp-stat span{color:#CFEBDD}.rp-stat b{font-weight:500;text-align:right}' +
    '.rp-st{background:rgba(255,255,255,.12);border-radius:8px;padding:8px 12px;margin-top:8px;font-size:10pt;line-height:1.5}' +
    '.rp-tbl{width:100%;border-collapse:collapse;font-size:10.5pt;margin-top:4px}' +
    '.rp-tbl th,.rp-tbl td{padding:6px 8px;text-align:right;border-bottom:1px solid #E3EBE5}' +
    '.rp-tbl th:first-child,.rp-tbl td:first-child{text-align:left}' +
    '.rp-tbl th{background:#EAF3EE;color:#35463D;font-weight:500}' +
    '.rp-tbl thead{display:table-header-group}.rp-tbl tr{break-inside:avoid}' +
    '.rp-note{margin-top:18px;background:#FDF1D6;border-left:4px solid #F2A81D;border-radius:6px;padding:9px 12px;font-size:9.5pt;color:#5A4A1A;line-height:1.55;break-inside:avoid}' +
    '.rp-foot{display:flex;justify-content:space-between;gap:10px;border-top:1px solid #D5E5DB;margin-top:16px;padding-top:6px;font-size:8.5pt;color:#5B6E64;break-inside:avoid}' +
    '}';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function txt(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function vis(el) { return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)); }
  function optText(s) { return (s.options[s.selectedIndex] || {}).text || ''; }

  function inputs() {
    var out = [];
    $$('main .narrow .card').forEach(function (card) {
      if (!vis(card) || card.closest('#related')) return;
      $$('label.lbl', card).forEach(function (l) {
        var id = l.getAttribute('for'), c = id && document.getElementById(id);
        if (!c || !vis(c)) return;
        var v = c.tagName === 'SELECT' ? optText(c) : c.value;
        v = String(v || '').trim();
        if (!v) return;
        var p = c.parentElement;
        if (c.tagName === 'INPUT' && p && p.classList.contains('two')) { var s = $('select', p); if (s && s !== c) v += ' ' + optText(s); }
        if (c.id === 'plen' || c.id === 'pwid') { var u = document.getElementById('pdim'); if (u) v += ' ' + optText(u); }
        if (c.id === 'punit') return;
        if (c.id === 'pprice') { var pu = document.getElementById('punit'); if (pu) v += ' / ' + optText(pu); }
        out.push({ k: txt(l), v: v });
      });
      $$('label.sw', card).forEach(function (l) {
        var c = $('input[type=checkbox]', l);
        if (c && c.id !== 'digits' && c.checked && vis(l)) out.push({ k: txt(l), v: H.t('pdf.yes') });
      });
    });
    return out;
  }

  function results() {
    var blocks = [];
    $$('main .res').forEach(function (res) {
      if (!vis(res)) return;
      var items = [];
      Array.prototype.forEach.call(res.children, function (ch) {
        var c = ch.className || '';
        if (ch.tagName === 'SMALL') items.push({ t: 'lab', v: txt(ch) });
        else if (/\bbig\b/.test(c)) items.push({ t: 'big', v: txt(ch) });
        else if (/\bamt\b/.test(c)) items.push({ t: 'amt', v: txt(ch) });
        else if (/\bw2\b/.test(c)) items.push({ t: 'w2', v: txt(ch) });
        else if (/\bw\b/.test(c)) items.push({ t: 'w', v: txt(ch) });
        else if (/\bstat\b/.test(c)) { var sp = $('span', ch), b = $('b', ch); items.push({ t: 'stat', k: sp ? txt(sp) : '', v: b ? txt(b) : '' }); }
        else if (/\bst\b/.test(c)) items.push({ t: 'st', v: txt(ch) });
      });
      if (items.some(function (i) { return i.t === 'big' || i.t === 'w' || i.t === 'stat'; })) blocks.push(items);
    });
    return blocks;
  }

  function conversions() {
    var rows = $('#rows');
    if (!rows || !vis(rows)) return [];
    var out = [];
    $$('.urow', rows).forEach(function (r) {
      var l = $('label', r), i = $('input', r);
      if (l && i && i.value.trim()) out.push({ k: txt(l), v: i.value.trim() });
    });
    return out;
  }

  function tables() {
    return $$('main .tbl').filter(vis).map(function (t) {
      var g = t.closest('.grp'), h = g && $('h3', g);
      return { cap: h ? txt(h) : '', html: t.innerHTML };
    });
  }

  function build(d) {
    var date = new Date().toLocaleDateString(H.lang() === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    var h = '<div class="rp-head"><div class="rp-brand">' + LOGO + '<div><b>হিসাব</b><small>' + esc(H.t('pdf.tag')) + '</small></div></div>' +
      '<div class="rp-date">' + esc(H.t('pdf.generated')) + '<br>' + esc(date) + '</div></div>' +
      '<h1 class="rp-title">' + esc(d.title) + '</h1>';
    if (d.inputs.length) {
      h += '<div class="rp-sec">' + esc(H.t('pdf.inputs')) + '</div><table class="rp-in">' +
        d.inputs.map(function (r) { return '<tr><td>' + esc(r.k) + '</td><td>' + esc(r.v) + '</td></tr>'; }).join('') + '</table>';
    }
    d.blocks.forEach(function (items) {
      h += '<div class="rp-hero">';
      items.forEach(function (i) {
        if (i.t === 'lab') h += '<div class="rp-lab">' + esc(i.v) + '</div>';
        else if (i.t === 'big') h += '<div class="rp-big">' + esc(i.v) + '</div>';
        else if (i.t === 'amt') h += '<div class="rp-amt">' + esc(i.v) + '</div>';
        else if (i.t === 'w') h += '<div class="rp-w">' + esc(i.v) + '</div>';
        else if (i.t === 'w2') h += '<div class="rp-w2">' + esc(i.v) + '</div>';
        else if (i.t === 'stat') h += '<div class="rp-stat"><span>' + esc(i.k) + '</span><b>' + esc(i.v) + '</b></div>';
        else if (i.t === 'st') h += '<div class="rp-st">' + esc(i.v) + '</div>';
      });
      h += '</div>';
    });
    if (d.conv.length) {
      h += '<div class="rp-sec">' + esc(H.t('ln.conv.t')) + '</div><table class="rp-in">' +
        d.conv.map(function (r) { return '<tr><td>' + esc(r.k) + '</td><td>' + esc(r.v) + '</td></tr>'; }).join('') + '</table>';
    }
    d.tables.forEach(function (t) {
      if (t.cap) h += '<div class="rp-sec">' + esc(t.cap) + '</div>';
      h += '<table class="rp-tbl">' + t.html + '</table>';
    });
    h += '<div class="rp-note">' + esc(H.t('f.disc')) + '</div>';
    h += '<div class="rp-foot"><span>' + esc(H.t('pdf.by')) + ' · ' + esc(location.origin + location.pathname) + '</span><span>' + esc(date) + '</span></div>';
    var el = document.createElement('div');
    el.id = 'hrpt';
    el.innerHTML = h;
    return el;
  }

  function toast(msg) {
    var old = $('.hrp-toast'); if (old) old.parentNode.removeChild(old);
    var t = document.createElement('div');
    t.className = 'hrp-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3600);
  }

  function run() {
    var d = { title: txt($('h1.tool-h1') || document.createElement('i')), inputs: inputs(), blocks: results(), conv: conversions(), tables: tables() };
    if (!d.blocks.length && !d.conv.length) { toast(H.t('pdf.empty')); return; }
    var old = $('#hrpt'); if (old) old.parentNode.removeChild(old);
    document.body.appendChild(build(d));
    var oldTitle = document.title;
    var slug = (location.pathname.split('/').filter(Boolean).pop() || 'result').replace(/\.html$/, '');
    document.title = 'Hishab-' + slug + '-' + new Date().toISOString().slice(0, 10);
    toast(H.t('pdf.hint'));
    var done = function () {
      document.title = oldTitle;
      var e = $('#hrpt'); if (e && e.parentNode) e.parentNode.removeChild(e);
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(done, 120000);
    setTimeout(function () { try { window.print(); } catch (e) { done(); } }, 450);
  }

  function init() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var row = $('main .btnrow');
    if (!row) return;
    var wrap = document.createElement('div');
    wrap.className = 'btnrow';
    wrap.innerHTML = '<button type="button" class="bt pdf"><i class="ti ti-file-download"></i> <span></span></button>';
    row.parentNode.insertBefore(wrap, row.nextSibling);
    var span = $('span', wrap);
    function label() { span.textContent = H.t('pdf.btn'); }
    label();
    document.addEventListener('langchange', label);
    $('button', wrap).addEventListener('click', run);
  }
  init();
})();
