#!/usr/bin/env node
/*
  Hishab blog builder. No dependencies. Run with: node build-blog.js
  Reads  content/blog/*.md
  Writes dist/  (the whole site + blog pages + sitemap.xml + robots.txt)
  Cloudflare deploys the dist/ folder (see wrangler.jsonc).
*/
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
// Change this one line (or set SITE_URL in Cloudflare) when you get your custom domain.
const SITE_URL = (process.env.SITE_URL || 'https://hishabkori.finalboss25.workers.dev').replace(/\/$/, '');
const SITE_NAME = 'হিসাব (Hishab)';

/* ---------- small helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = s => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#\d+;/g, ' ');
const BD = '০১২৩৪৫৬৭৮৯';
const toBn = s => String(s).replace(/[0-9]/g, d => BD[d]);
const MONTHS = {
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
function fmtDate(d, lang) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
  if (!m) return '';
  const day = parseInt(m[3], 10), mon = MONTHS[lang][parseInt(m[2], 10) - 1], y = m[1];
  return lang === 'bn' ? toBn(day) + ' ' + mon + ' ' + toBn(y) : mon + ' ' + day + ', ' + y;
}

const UI = {
  bn: {
    home: 'হোম', blog: 'ব্লগ', back: 'ব্লগে ফিরুন', updated: 'হালনাগাদ', min: 'মিনিট পড়া', toc: 'এই লেখায় যা আছে',
    try: 'ক্যালকুলেটরে হিসাব করুন', related: 'আরও পড়ুন', author: 'হিসাব সম্পাদকীয় দল', all: 'সব',
    disc: 'এই লেখা শুধু সাধারণ তথ্যের জন্য। এটি আর্থিক, আইনি বা কর পরামর্শ নয়। নিয়ম বদলাতে পারে, তাই সিদ্ধান্তের আগে NBR, ব্যাংক বা সংশ্লিষ্ট অফিসে যাচাই করুন।',
    idxTitle: 'ব্লগ – আয়কর, ব্যাংক, জমি ও যাকাতের সহজ গাইড', idxH1: 'ব্লগ',
    idxDesc: 'আয়কর, ব্যাংক, DPS-FDR, জমির মাপ ও যাকাত নিয়ে সহজ বাংলায় গাইড। প্রতিটি লেখায় উদাহরণ ও হিসাব আছে।',
    idxLead: 'আয়কর, ব্যাংক, জমি ও যাকাত নিয়ে সহজ বাংলায় গাইড, উদাহরণ ও হিসাবসহ।', none: 'এখনো কোনো লেখা প্রকাশ হয়নি।'
  },
  en: {
    home: 'Home', blog: 'Blog', back: 'Back to blog', updated: 'Updated', min: 'min read', toc: 'In this article',
    try: 'Calculate it now', related: 'Keep reading', author: 'Hishab editorial team', all: 'All',
    disc: 'This article is for general information only. It is not financial, legal or tax advice. Rules can change, so check with NBR, your bank or the relevant office before deciding.',
    idxTitle: 'Blog – simple guides on tax, banking, land and zakat', idxH1: 'Blog',
    idxDesc: 'Simple guides on income tax, banking, DPS and FDR, land measures and zakat, with examples and worked numbers.',
    idxLead: 'Simple guides on tax, banking, land and zakat, with examples and worked numbers.', none: 'No articles have been published yet.'
  }
};
const CATS = {
  tax: { bn: 'আয়কর', en: 'Tax', icon: 'ti-receipt-tax' },
  banking: { bn: 'ব্যাংক ও সঞ্চয়', en: 'Banking and savings', icon: 'ti-pig-money' },
  land: { bn: 'জমি', en: 'Land', icon: 'ti-map-2' },
  zakat: { bn: 'যাকাত', en: 'Zakat', icon: 'ti-moon-stars' },
  general: { bn: 'সাধারণ', en: 'General', icon: 'ti-article' }
};
const CALCS = {
  'salary-tax': { bn: 'বেতনের আয়কর', en: 'Salary tax', icon: 'ti-wallet' },
  'business-tax': { bn: 'ব্যবসার আয়কর', en: 'Business tax', icon: 'ti-building-store' },
  'income-tax': { bn: 'আয়কর ক্যালকুলেটর', en: 'Income tax', icon: 'ti-receipt-tax' },
  'loan-emi': { bn: 'লোন EMI', en: 'Loan EMI', icon: 'ti-calculator' },
  'dps-fdr': { bn: 'DPS ও FDR', en: 'DPS and FDR', icon: 'ti-pig-money' },
  'zakat': { bn: 'যাকাত', en: 'Zakat', icon: 'ti-moon-stars' },
  'land-converter': { bn: 'জমির হিসাব', en: 'Land converter', icon: 'ti-map-2' },
  'taka-in-words': { bn: 'টাকা কথায়', en: 'Taka in words', icon: 'ti-coin' }
};
const catOf = p => CATS[p.category] ? p.category : 'general';

/* ---------- front matter ---------- */
function unq(v) {
  v = v.trim();
  if (/^".*"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}
function parseFM(src) {
  src = src.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!m) return { data: {}, body: src };
  const data = {}, lines = m[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const mm = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(lines[i]);
    if (!mm) continue;
    const key = mm[1];
    let val = mm[2].trim();
    if (/^[>|][+-]?$/.test(val)) {
      const buf = [];
      while (i + 1 < lines.length && (/^\s+\S/.test(lines[i + 1]) || lines[i + 1] === '')) buf.push(lines[++i].trim());
      val = val[0] === '>' ? buf.join(' ').replace(/\s+/g, ' ').trim() : buf.join('\n').trim();
    } else if (val === '') {
      const items = [];
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) items.push(unq(lines[++i].replace(/^\s*-\s+/, '')));
      val = items.length ? items : '';
    } else {
      // Pages CMS wraps long values onto indented continuation lines; join them back together
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1]) && !/^\s*-\s+/.test(lines[i + 1])) val += ' ' + lines[++i].trim();
      val = unq(val);
    }
    if (val === 'true') val = true;
    if (val === 'false') val = false;
    data[key] = val;
  }
  return { data, body: m[2] };
}

/* ---------- markdown ---------- */
function safeUrl(u) {
  u = u.replace(/&amp;/g, '&');
  if (/^(https?:\/\/|mailto:|tel:|\/|#|\.{1,2}\/)/i.test(u)) return u.replace(/"/g, '%22');
  return '#';
}
function inline(s) {
  s = esc(s);
  s = s.replace(/\\([\\`*_{}\[\]()#+\-.!|~])/g, (m, c) => '&#' + c.charCodeAt(0) + ';');
  s = s.replace(/&lt;br\s*\/?&gt;/g, '<br>');
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, a, u) => '<img src="' + safeUrl(u) + '" alt="' + a + '" loading="lazy">');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
    u = safeUrl(u);
    const ext = /^https?:/i.test(u);
    return '<a href="' + u + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>';
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code>' + codes[i] + '</code>');
  return s;
}
function markdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [], heads = [], used = {};
  let i = 0;
  const slugify = t => {
    const b = t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
    let s = b, n = 2;
    while (used[s]) s = b + '-' + (n++);
    used[s] = 1;
    return s;
  };
  const isSep = l => l && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l) && l.includes('-');
  const cells = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  const listMark = /^\s*([-*+]|\d+[.)])\s+/;
  const startsBlock = l => /^```/.test(l) || /^#{1,6}\s/.test(l) || /^\s*>/.test(l) || listMark.test(l) || /^\s*(-{3,}|\*{3,})\s*$/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*$/.test(l)) { i++; continue; }
    let m;
    if (/^```/.test(l)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
      continue;
    }
    if ((m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l))) {
      const lvl = Math.min(4, Math.max(2, m[1].length)), id = slugify(m[2]);
      heads.push({ lvl: lvl, text: stripTags(inline(m[2])), id: id });
      out.push('<h' + lvl + ' id="' + id + '">' + inline(m[2]) + '</h' + lvl + '>');
      i++; continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^\s*>/.test(l)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      const paras = buf.join('\n').split(/\n\s*\n/).map(p => '<p>' + inline(p.replace(/\n/g, ' ')) + '</p>').join('');
      out.push('<blockquote>' + paras + '</blockquote>');
      continue;
    }
    if (l.includes('|') && isSep(lines[i + 1])) {
      const head = cells(l); i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      let t = '<div class="tw"><table class="tbl"><thead><tr>' + head.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>';
      rows.forEach(r => { t += '<tr>' + head.map((_, k) => '<td>' + inline(r[k] || '') + '</td>').join('') + '</tr>'; });
      out.push(t + '</tbody></table></div>');
      continue;
    }
    if (listMark.test(l)) {
      const ordered = /^\s*\d/.test(l), items = [];
      while (i < lines.length) {
        if (listMark.test(lines[i])) { items.push(lines[i].replace(listMark, '')); i++; }
        else if (/^\s*$/.test(lines[i])) {
          let j = i; while (j < lines.length && /^\s*$/.test(lines[j])) j++;
          if (j < lines.length && listMark.test(lines[j])) i = j; else break;
        } else if (/^\s+\S/.test(lines[i]) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; }
        else break;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push('<' + tag + '>' + items.map(t => '<li>' + inline(t) + '</li>').join('') + '</' + tag + '>');
      continue;
    }
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !(buf.length && startsBlock(lines[i]))) buf.push(lines[i++]);
    const text = buf.join(' ').trim();
    if (/^!\[[^\]]*\]\([^)\s]+\)$/.test(text)) out.push('<figure>' + inline(text) + '</figure>');
    else out.push('<p>' + inline(text) + '</p>');
  }
  return { html: out.join('\n'), heads: heads };
}

function extractFaq(body) {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const re = /^##\s+(প্রশ্নোত্তর|সাধারণ প্রশ্ন|সচরাচর জিজ্ঞাসিত প্রশ্ন|FAQ|Frequently asked questions|Common questions)\s*$/i;
  const start = lines.findIndex(l => re.test(l));
  if (start < 0) return [];
  let end = lines.length;
  for (let k = start + 1; k < lines.length; k++) if (/^##\s/.test(lines[k])) { end = k; break; }
  const seg = lines.slice(start + 1, end).join('\n').split(/^###\s+/m).slice(1);
  return seg.map(s => {
    const nl = s.indexOf('\n');
    const q = (nl < 0 ? s : s.slice(0, nl)).trim();
    const a = stripTags(inline((nl < 0 ? '' : s.slice(nl + 1)).trim().replace(/\n+/g, ' ')));
    return { q: stripTags(inline(q)), a: a };
  }).filter(x => x.q && x.a);
}

/* ---------- load posts ---------- */
function loadPosts() {
  const dir = path.join(ROOT, 'content', 'blog');
  if (!fs.existsSync(dir)) return [];
  const posts = [];
  fs.readdirSync(dir).filter(f => f.endsWith('.md')).forEach(f => {
    const { data, body } = parseFM(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (data.draft === true) return;
    const slug = String(data.slug || f.replace(/\.md$/, '')).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug || !data.title) { console.warn('skip (missing slug/title):', f); return; }
    const lang = data.lang === 'en' ? 'en' : 'bn';
    const r = markdown(body);
    const words = stripTags(r.html).split(/\s+/).filter(Boolean).length;
    posts.push({
      slug: slug, title: String(data.title), desc: String(data.description || ''), lang: lang,
      date: String(data.date || '').slice(0, 10), updated: String(data.updated || '').slice(0, 10),
      category: String(data.category || 'general'), calculator: String(data.calculator || ''),
      image: String(data.image || ''), author: String(data.author || ''),
      html: r.html, heads: r.heads, faq: extractFaq(body), minutes: Math.max(1, Math.round(words / (lang === 'bn' ? 170 : 200)))
    });
  });
  posts.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  return posts;
}

/* ---------- html pieces ---------- */
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">' +
  '<link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css" rel="stylesheet">' +
  '<link href="/css/site.css" rel="stylesheet">';
const SCRIPTS = '<script src="/js/i18n.js"></script><script src="/js/common.js"></script>';

function card(p) {
  const L = p.lang, c = CATS[catOf(p)];
  const media = p.image
    ? '<div class="pc-img"><img src="' + esc(p.image) + '" alt="" loading="lazy"></div>'
    : '<div class="pc-img ph"><i class="ti ' + c.icon + '"></i></div>';
  const mins = (L === 'bn' ? toBn(p.minutes) : p.minutes) + ' ' + UI[L].min;
  return '<a class="pcard" href="/blog/' + p.slug + '" data-cat="' + catOf(p) + '">' + media +
    '<div class="pc-b"><span class="chip-cat">' + c[L] + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' +
    '<span class="pc-m">' + fmtDate(p.date, L) + ' · ' + mins + '</span></div></a>';
}

function pageHead(o) {
  return '<!DOCTYPE html>\n<html lang="' + o.lang + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + esc(o.title) + '</title>\n<meta name="description" content="' + esc(o.desc) + '">\n' +
    '<link rel="canonical" href="' + o.url + '">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n' +
    '<meta property="og:site_name" content="' + esc(SITE_NAME) + '"><meta property="og:type" content="' + o.ogType + '">' +
    '<meta property="og:title" content="' + esc(o.title) + '"><meta property="og:description" content="' + esc(o.desc) + '">' +
    '<meta property="og:url" content="' + o.url + '"><meta property="og:locale" content="' + (o.lang === 'bn' ? 'bn_BD' : 'en_US') + '">' +
    (o.image ? '<meta property="og:image" content="' + o.image + '"><meta name="twitter:card" content="summary_large_image">' : '<meta name="twitter:card" content="summary">') + '\n' +
    FONTS + '\n' + (o.ld || []).map(j => '<script type="application/ld+json">' + JSON.stringify(j).replace(/</g, '\\u003c') + '</script>').join('\n') + '\n</head>\n';
}

function postPage(p, all) {
  const L = p.lang, T = UI[L], cat = CATS[catOf(p)];
  const url = SITE_URL + '/blog/' + p.slug;
  const img = p.image ? (/^https?:/.test(p.image) ? p.image : SITE_URL + p.image) : '';
  const toc = p.heads.filter(h => h.lvl === 2);
  let body = p.html;
  const h2s = [...body.matchAll(/<h2 /g)];
  if (h2s.length >= 3) { const at = h2s[2].index; body = body.slice(0, at) + '<div class="ad rect"></div>\n' + body.slice(at); }
  const calc = CALCS[p.calculator];
  const related = all.filter(x => x.slug !== p.slug && x.lang === p.lang)
    .sort((a, b) => (catOf(b) === catOf(p)) - (catOf(a) === catOf(p))).slice(0, 3);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.desc, inLanguage: L, mainEntityOfPage: url,
      datePublished: p.date || undefined, dateModified: p.updated || p.date || undefined,
      author: { '@type': 'Organization', name: p.author || T.author }, publisher: { '@type': 'Organization', name: SITE_NAME },
      image: img ? [img] : undefined },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: T.home, item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: T.blog, item: SITE_URL + '/blog/' },
      { '@type': 'ListItem', position: 3, name: p.title, item: url }] }
  ];
  if (p.faq.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: p.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  const mins = (L === 'bn' ? toBn(p.minutes) : p.minutes) + ' ' + T.min;
  let h = pageHead({ lang: L, title: p.title + ' | ' + SITE_NAME, desc: p.desc, url: url, ogType: 'article', image: img, ld: ld });
  h += '<body data-page="blog" data-root="/" data-lang="' + L + '">\n<header id="site-header"></header>\n<main>\n<article class="narrow post">\n' +
    '<div class="bc"><a class="back" href="/blog/"><i class="ti ti-arrow-left"></i><span>' + T.back + '</span></a>' +
    '<span class="crumb"><a href="/index.html">' + T.home + '</a> / <a href="/blog/">' + T.blog + '</a> / ' + cat[L] + '</span></div>\n' +
    '<span class="chip-cat">' + cat[L] + '</span>\n<h1 class="tool-h1 post-h1">' + esc(p.title) + '</h1>\n' +
    '<div class="meta"><span>' + fmtDate(p.date, L) + '</span>' + (p.updated ? '<span>' + T.updated + ': ' + fmtDate(p.updated, L) + '</span>' : '') +
    '<span>' + mins + '</span><span>' + esc(p.author || T.author) + '</span></div>\n' +
    (p.image ? '<figure class="cover"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '"></figure>\n' : '') +
    '<p class="lead">' + esc(p.desc) + '</p>\n';
  if (toc.length >= 3) h += '<nav class="toc" aria-label="' + T.toc + '"><b>' + T.toc + '</b><ol>' + toc.map(t => '<li><a href="#' + t.id + '">' + esc(t.text) + '</a></li>').join('') + '</ol></nav>\n';
  h += '<div class="post-body">\n' + body + '\n</div>\n';
  if (calc) h += '<a class="cta" href="/' + p.calculator + '.html"><span class="ctai"><i class="ti ' + calc.icon + '"></i></span><span class="ctat"><b>' + T.try + '</b><span>' + calc[L] + '</span></span><i class="ti ti-arrow-right"></i></a>\n';
  h += '<div class="ad rect"></div>\n<aside class="abox"><b>' + esc(p.author || T.author) + '</b><p>' + T.disc + '</p></aside>\n</article>\n';
  if (related.length) h += '<div class="wrap"><section class="sec"><h2>' + T.related + '</h2><div class="pcards">' + related.map(card).join('') + '</div></section></div>\n';
  h += '</main>\n<footer id="site-footer"></footer>\n' + SCRIPTS + '\n</body>\n</html>\n';
  return h;
}

function indexPage(posts) {
  const L = 'bn', T = UI[L], url = SITE_URL + '/blog/';
  const present = Object.keys(CATS).filter(k => posts.some(p => catOf(p) === k));
  const ld = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: T.idxH1, url: url, inLanguage: L,
    hasPart: posts.slice(0, 30).map(p => ({ '@type': 'Article', headline: p.title, url: SITE_URL + '/blog/' + p.slug })) }];
  let h = pageHead({ lang: L, title: T.idxTitle + ' | ' + SITE_NAME, desc: T.idxDesc, url: url, ogType: 'website', image: '', ld: ld });
  h += '<body data-page="blog" data-root="/" data-lang="' + L + '">\n<header id="site-header"></header>\n<main>\n<div class="wrap">\n' +
    '<div class="bc"><a class="back" href="/index.html"><i class="ti ti-arrow-left"></i><span>' + T.home + '</span></a></div>\n' +
    '<h1 class="tool-h1">' + T.idxH1 + '</h1>\n<p class="lead">' + T.idxLead + '</p>\n';
  if (present.length > 1) h += '<div class="cfilter" id="cf"><button type="button" class="chipb on" data-c="all">' + T.all + '</button>' +
    present.map(k => '<button type="button" class="chipb" data-c="' + k + '">' + CATS[k][L] + '</button>').join('') + '</div>\n';
  h += posts.length ? '<div class="pcards" id="pl">' + posts.map(card).join('') + '</div>\n' : '<p class="note">' + T.none + '</p>\n';
  h += '<div class="ad"></div>\n</div>\n</main>\n<footer id="site-footer"></footer>\n' + SCRIPTS + '\n' +
    '<script>(function(){var cf=document.getElementById("cf");if(!cf)return;cf.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;' +
    'cf.querySelectorAll("button").forEach(function(x){x.classList.toggle("on",x===b)});var c=b.dataset.c;' +
    'document.querySelectorAll("#pl .pcard").forEach(function(a){a.style.display=(c==="all"||a.dataset.c===c||a.dataset.cat===c)?"":"none"});});})();</script>\n</body>\n</html>\n';
  return h;
}

/* ---------- injection into existing pages ---------- */
function latestSection(posts) {
  const items = posts.filter(p => p.lang === 'bn').slice(0, 3);
  if (!items.length) return '';
  return '<section class="sec" id="blog-latest"><div class="wrap"><div class="gh"><h2 data-i18n="blog.latest">সাম্প্রতিক লেখা</h2></div>' +
    '<div class="pcards">' + items.map(card).join('') + '</div>' +
    '<p style="margin-top:16px"><a class="more" href="/blog/"><span data-i18n="blog.all">সব লেখা দেখুন</span> <i class="ti ti-arrow-right"></i></a></p></div></section>';
}
function guidesSection(posts, calcId) {
  const items = posts.filter(p => p.calculator === calcId).slice(0, 3);
  if (!items.length) return '';
  return '<div class="wrap"><section><h2 data-i18n="guides.t" style="margin-bottom:14px">সম্পর্কিত গাইড</h2><div class="pcards">' + items.map(card).join('') + '</div></section></div>';
}

/* ---------- main ---------- */
function copyDir(src, dst) { if (fs.existsSync(src)) fs.cpSync(src, dst, { recursive: true }); }
function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'blog'), { recursive: true });
  const posts = loadPosts();

  const staticPages = [];
  fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).forEach(f => {
    let h = fs.readFileSync(path.join(ROOT, f), 'utf8');
    h = h.replace('<!--latest-posts-->', latestSection(posts));
    h = h.replace(/<!--guides:([a-z-]+)-->/g, (m, id) => guidesSection(posts, id));
    fs.writeFileSync(path.join(OUT, f), h);
    if (f !== '404.html') staticPages.push(f);
  });
  ['favicon.svg'].forEach(f => { if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f)); });
  ['css', 'js', 'images'].forEach(d => copyDir(path.join(ROOT, d), path.join(OUT, d)));

  posts.forEach(p => fs.writeFileSync(path.join(OUT, 'blog', p.slug + '.html'), postPage(p, posts)));
  fs.writeFileSync(path.join(OUT, 'blog', 'index.html'), indexPage(posts));

  const today = new Date().toISOString().slice(0, 10);
  const urls = [];
  staticPages.forEach(f => urls.push({ loc: f === 'index.html' ? SITE_URL + '/' : SITE_URL + '/' + f.replace(/\.html$/, ''), mod: today }));
  urls.push({ loc: SITE_URL + '/blog/', mod: posts.length ? (posts[0].updated || posts[0].date || today) : today });
  posts.forEach(p => urls.push({ loc: SITE_URL + '/blog/' + p.slug, mod: p.updated || p.date || today }));
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '<url><loc>' + u.loc + '</loc><lastmod>' + u.mod + '</lastmod></url>').join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + SITE_URL + '/sitemap.xml\n');

  console.log('Blog build done: ' + posts.length + ' post(s), ' + staticPages.length + ' static page(s), ' + urls.length + ' sitemap URL(s).');
}
main();
