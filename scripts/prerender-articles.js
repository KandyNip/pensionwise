#!/usr/bin/env node
/**
 * 預渲染：articles/*.md → article/{slug}.html 靜態頁
 * 目的：不執行 JS 的爬蟲（AdSense 審核、部分 Googlebot）能直接讀到全文
 * 零依賴，純 Node
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'articles');
const TEMPLATE_FILE = path.join(ROOT, 'article.html');
const OUT_DIR = path.join(ROOT, 'article');
const SITE = 'https://pensionwisetool.com';

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const data = {};
  match[1].split(/\r?\n/).forEach(line => {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) return;
    const key = m[1];
    let value = m[2].trim();
    let wasQuoted = false;
    if (value.startsWith('"') && value.endsWith('"')) { value = value.slice(1, -1); wasQuoted = true; }
    else if (value.startsWith("'") && value.endsWith("'")) { value = value.slice(1, -1); wasQuoted = true; }
    if (!wasQuoted) {
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (/^\d+$/.test(value)) value = parseInt(value, 10);
    }
    data[key] = value;
  });
  return { data, body: match[2] || '' };
}

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// 與 article.html 內 mdToHtml 完全一致，保證預渲染與 JS 渲染結果相同
function mdToHtml(md) {
  if (!md) return '';
  md = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = md.split('\n');
  const result = [];
  let i = 0, inUl = false, inOl = false;
  let paraBuf = [];

  function flushPara() {
    if (paraBuf.length) {
      const text = paraBuf.join('<br/>').trim();
      if (text) result.push('<p>' + text + '</p>');
      paraBuf = [];
    }
  }
  function closeLists() {
    if (inUl) { result.push('</ul>'); inUl = false; }
    if (inOl) { result.push('</ol>'); inOl = false; }
  }
  function parseRow(line) {
    line = line.trim();
    if (line.charAt(0) === '|') line = line.slice(1);
    if (line.charAt(line.length - 1) === '|') line = line.slice(0, -1);
    return line.split('|').map(c => c.trim());
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') { flushPara(); closeLists(); i++; continue; }

    if (trimmed.charAt(0) === '|' && i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())) {
      flushPara(); closeLists();
      const headerCells = parseRow(trimmed);
      const bodyRows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().charAt(0) === '|' && lines[i].trim() !== '') {
        bodyRows.push(parseRow(lines[i].trim()));
        i++;
      }
      let t = '<table><thead><tr>';
      headerCells.forEach(c => { t += '<th>' + c + '</th>'; });
      t += '</tr></thead><tbody>';
      bodyRows.forEach(row => {
        t += '<tr>';
        row.forEach(c => { t += '<td>' + c + '</td>'; });
        t += '</tr>';
      });
      t += '</tbody></table>';
      result.push(t);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushPara(); closeLists(); result.push('<hr/>'); i++; continue;
    }

    const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      flushPara(); closeLists();
      const lv = hMatch[1].length;
      result.push('<h' + lv + '>' + hMatch[2] + '</h' + lv + '>');
      i++; continue;
    }

    if (/^>/.test(trimmed)) {
      flushPara(); closeLists();
      result.push('<blockquote>' + trimmed.replace(/^>\s?/, '') + '</blockquote>');
      i++; continue;
    }

    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      flushPara();
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (!inOl) { result.push('<ol>'); inOl = true; }
      result.push('<li>' + olMatch[2] + '</li>');
      i++; continue;
    }

    const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      flushPara();
      if (inOl) { result.push('</ol>'); inOl = false; }
      if (!inUl) { result.push('<ul>'); inUl = true; }
      result.push('<li>' + ulMatch[1] + '</li>');
      i++; continue;
    }

    paraBuf.push(trimmed);
    i++;
  }

  flushPara();
  closeLists();

  let html = result.join('\n');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" loading="lazy" style="width:100%;border-radius:16px;margin:16px 0;">');
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#047857;">$1</a>');
  html = html.replace(/(?<!=["'])https?:\/\/[^\s<"'）)]+/g, function (u) {
    return '<a href="' + u + '" target="_blank" rel="noopener" style="color:#047857;word-break:break-all;">' + u + '</a>';
  });
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  return html;
}

function stripFirstH1(body) {
  return body.replace(/^\s*#\s+[^\n]*\n/, '');
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  return dt.getFullYear() + ' 年 ' + (dt.getMonth() + 1) + ' 月 ' + dt.getDate() + ' 日';
}

function countReadMinutes(text) {
  const cn = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return Math.max(3, Math.round(cn / 400));
}

function buildContent(a, body) {
  const title = a.title || '';
  let h = '<div class="article-hero"><div class="container">';
  if (a.badge) h += '<span class="article-badge">' + escHtml(a.badge) + '</span>';
  h += '<h1>' + escHtml(title) + '</h1>';
  h += '<div class="article-meta">';
  h += '<div class="article-author"><div class="article-author-av">' + escHtml(a.authorSurname || '編') + '</div>';
  h += '<span>by <strong>' + escHtml(a.authorName || '編輯部') + '</strong>';
  if (a.authorTitle) h += ' · ' + escHtml(a.authorTitle);
  h += '</span></div>';
  const dateStr = fmtDate(a.date);
  if (dateStr) { h += '<span class="sep"></span><span>' + dateStr + '</span>'; }
  h += '<span class="sep"></span><span>' + countReadMinutes(body) + ' 分鐘閱讀</span>';
  h += '</div></div></div>';

  const cover = a.coverImage || a.cover;
  if (cover) {
    h += '<div class="article-cover"><img src="' + escHtml(cover) + '" alt="' + escHtml(a.coverAlt || title) + '" /></div>';
  }

  h += '<div class="article-body">' + mdToHtml(stripFirstH1(body)) + '</div>';
  return h;
}

function buildPage(a, body) {
  let tpl = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  const title = a.title || '';
  const desc = a.description || a.excerpt || '';
  const canonical = SITE + '/article/' + a.slug;
  const cover = a.coverImage || a.cover || '';
  const pageTitle = title + ' — Pensionwise 養老智';

  tpl = tpl.replace(/<title id="pageTitle">[^<]*<\/title>/, '<title id="pageTitle">' + escHtml(pageTitle) + '</title>');
  tpl = tpl.replace(/<meta name="description" content="[^"]*" \/>/, '<meta name="description" content="' + escHtml(desc) + '" />');
  tpl = tpl.replace(/<link rel="canonical" href="[^"]*" \/>/, '<link rel="canonical" href="' + canonical + '" />');
  tpl = tpl.replace(/<meta property="og:title" content="[^"]*" \/>/, '<meta property="og:title" content="' + escHtml(pageTitle) + '" />');
  tpl = tpl.replace(/<meta property="og:description" content="[^"]*" \/>/, '<meta property="og:description" content="' + escHtml(desc) + '" />');

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: desc,
    image: cover ? SITE + cover : SITE + '/favicon.png',
    datePublished: a.date || '',
    dateModified: a.date || '',
    author: { '@type': 'Person', name: a.authorName || 'Pensionwise 編輯部' },
    publisher: {
      '@type': 'Organization',
      name: 'Pensionwise 養老智',
      logo: { '@type': 'ImageObject', url: SITE + '/favicon.png' }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }
  };

  let extra = '';
  if (cover) extra += '<meta property="og:image" content="' + SITE + cover + '" />\n';
  extra += '<meta property="og:url" content="' + canonical + '" />\n';
  extra += '<script type="application/ld+json">' + JSON.stringify(jsonld) + '</script>';
  tpl = tpl.replace(/(<meta property="og:locale" content="zh_Hant" \/>)/, '$1\n' + extra);

  const contentHtml = buildContent(a, body);
  tpl = tpl.replace(
    /<div id="content">\s*<div class="article-loading">載入中⋯<\/div>\s*<\/div>/,
    '<div id="content">\n' + contentHtml + '\n</div>'
  );
  return tpl;
}

// ===== main =====
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
const parsed = [];
let warn = 0;
files.forEach(f => {
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const slug = data.slug || f.replace(/\.md$/, '');
  if (!data.title) { console.warn('[prerender] 跳過（無 title）:', f); warn++; return; }
  const a = Object.assign({}, data, { slug, _body: body });
  parsed.push(a);
  fs.writeFileSync(path.join(OUT_DIR, slug + '.html'), buildPage(a, body));
});
console.log('[prerender] 生成 ' + parsed.length + ' 個靜態文章頁' + (warn ? '（跳過 ' + warn + ' 個）' : ''));

// ===== 分類頁靜態列表 =====
function cardHtml(a) {
  const cover = a.cover || a.coverImage || '';
  const badge = a.badge || '';
  const cat = a.categoryName || '通用退休';
  const name = a.authorName || '編輯部';
  const surname = a.authorSurname || (a.authorName ? a.authorName[0] : '編');
  const title = a.title || '';
  const excerpt = a.excerpt || a.description || '';
  const cn = ((a._body || '').match(/[\u4e00-\u9fff]/g) || []).length;
  const mins = Math.max(3, Math.round(cn / 400));
  let dateStr = '';
  if (a.date) {
    const d = new Date(a.date);
    if (!isNaN(d.getTime())) dateStr = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0');
  }
  const rows = [
    '<a href="/article/' + escHtml(a.slug) + '" class="res-card">',
    '  <div class="res-cover">',
    badge ? '    <span class="res-cat">' + escHtml(badge) + '</span>' : '',
    '    <img src="' + escHtml(cover) + '" alt="' + escHtml(a.coverAlt || title) + '" width="600" height="375" loading="lazy" />',
    '  </div>',
    '  <div class="res-body">',
    '    <div class="res-meta"><span>' + escHtml(cat) + '</span><span class="sep"></span><span>' + mins + ' 分鐘閱讀</span>' + (dateStr ? '<span class="sep"></span><span>' + dateStr + '</span>' : '') + '</div>',
    '    <h3 class="res-title">' + escHtml(title) + '</h3>',
    '    <p class="res-excerpt">' + escHtml(excerpt) + '</p>',
    '    <div class="res-author"><div class="res-author-av">' + escHtml(surname) + '</div><span>由 <strong>' + escHtml(name) + '</strong>撰寫</span></div>',
    '  </div>',
    '</a>'
  ];
  return rows.filter(Boolean).join('\n');
}

function prerenderList(pageFile, region) {
  const p = path.join(ROOT, pageFile);
  if (!fs.existsSync(p)) { console.warn('[prerender] 找不到', pageFile); return; }
  let s = fs.readFileSync(p, 'utf8');
  const list = parsed
    .filter(a => (a.regionTag || '') === region)
    .sort((x, y) => String(y.date || '').localeCompare(String(x.date || '')));
  const cards = list.map(cardHtml).join('\n');
  const inner = cards || '      <div class="empty-state"><p>暫無文章，敬請期待。</p></div>';
  const block = '<div class="articles-grid" id="articlesGrid">\n' + inner + '\n    </div>';
  const re = /<div class="articles-grid" id="articlesGrid">[\s\S]*?\n    <\/div>\n  <\/div>\n<\/section>/;
  if (!re.test(s)) { console.warn('[prerender] 未匹配容器:', pageFile); return; }
  s = s.replace(re, block + '\n  </div>\n</section>');
  fs.writeFileSync(p, s);
  console.log('[prerender] ' + pageFile + ' 靜態化 ' + list.length + ' 張卡片');
}

prerenderList('articles-general.html', '通用');
prerenderList('articles-hk.html', 'HK');
prerenderList('articles-tw.html', 'TW');
