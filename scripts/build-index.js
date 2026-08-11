#!/usr/bin/env node
/**
 * 構建腳本：掃描 articles/*.md，提取 frontmatter 生成 articles.json
 * 前端 fetch /articles.json 渲染卡片，無需解析 Markdown
 *
 * 觸發時機：Vercel 部署時自動執行（見根目錄 vercel.json）
 */
const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const OUTPUT_FILE = path.join(__dirname, '..', 'articles.json');
const SITEMAP_FILE = path.join(__dirname, '..', 'sitemap.xml');
const BASE_URL = 'https://pensionwisetool.com';
const TODAY = new Date().toISOString().slice(0, 10);

// 簡易 frontmatter 解析器（不依賴第三方套件）
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const frontmatterText = match[1];
  const body = match[2] || '';
  const data = {};

  // 按行解析 key: value
  frontmatterText.split(/\r?\n/).forEach(line => {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) return;
    const key = m[1];
    let value = m[2].trim();

    // 處理引號字符串
    let wasQuoted = false;
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
      wasQuoted = true;
    }
    // 處理單引號字符串
    else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
      wasQuoted = true;
    }
    // 只有未加引號的值才做類型轉換
    if (!wasQuoted) {
      // 處理布爾值
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      // 處理數字
      else if (/^\d+$/.test(value)) value = parseInt(value, 10);
      else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);
    }

    data[key] = value;
  });

  return { data, body };
}

// 主流程
try {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('[build-index] articles/ 文件夾不存在，生成空索引');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ articles: [] }));
    process.exit(0);
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('[build-index] articles/ 無文章，生成空索引');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ articles: [] }));
    process.exit(0);
  }

  const articles = files.flatMap(filename => {
    try {
      const filePath = path.join(ARTICLES_DIR, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data, body } = parseFrontmatter(content);

      const article = {
        slug: filename.replace(/\.md$/, ''),
        title: data.title || '',
        publishDate: data.publishDate || '',
        excerpt: data.excerpt || '',
        cover: data.cover || '',
        coverAlt: data.coverAlt || '',
        regionTag: data.regionTag || '通用',
        badge: data.badge || '',
        categoryName: data.categoryName || '通用',
        authorName: data.authorName || '編輯部',
        authorSurname: data.authorSurname || '編',
        authorTitle: data.authorTitle || '',
        readMinutes: data.readMinutes || 5,
        featured: !!data.featured,
        body: body.trim(),
      };
      return [article];
    } catch (e) {
      console.error(`[build-index] 解析 ${filename} 失敗:`, e.message);
      return [];
    }
  });

  // 排序：featured 優先，然後按發布日期降序
  articles.sort((a, b) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    return new Date(b.publishDate) - new Date(a.publishDate);
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ articles }, null, 2));
  console.log(`[build-index] 生成 articles.json，共 ${articles.length} 篇文章`);

  // 生成 sitemap.xml：靜態頁面 + 文章頁面
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'monthly' },
    { path: '/living-cost.html', priority: '0.8', changefreq: 'monthly' },
    { path: '/retirement-gap.html', priority: '0.8', changefreq: 'monthly' },
    { path: '/mpf.html', priority: '0.8', changefreq: 'monthly' },
    { path: '/labor-pension.html', priority: '0.8', changefreq: 'monthly' },
    { path: '/articles-hk.html', priority: '0.8', changefreq: 'weekly' },
    { path: '/articles-tw.html', priority: '0.8', changefreq: 'weekly' },
    { path: '/articles-general.html', priority: '0.8', changefreq: 'weekly' },
    { path: '/about.html', priority: '0.5', changefreq: 'yearly' },
    { path: '/contact.html', priority: '0.4', changefreq: 'yearly' },
    { path: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
    { path: '/disclaimer.html', priority: '0.3', changefreq: 'yearly' },
    { path: '/cookie-policy.html', priority: '0.3', changefreq: 'yearly' },
    { path: '/terms.html', priority: '0.3', changefreq: 'yearly' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  staticPages.forEach(p => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${p.path}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
    xml += `    <priority>${p.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  articles.forEach(a => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/article/${a.slug}</loc>\n`;
    xml += `    <lastmod>${a.publishDate || TODAY}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  fs.writeFileSync(SITEMAP_FILE, xml);
  console.log(`[build-index] 生成 sitemap.xml，共 ${staticPages.length + articles.length} 個 URL`);
} catch (err) {
  console.error('[build-index] 生成失敗:', err.message);
  // 失敗時生成空索引，避免前端崩潰
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ articles: [] }));
  process.exit(0);
}
