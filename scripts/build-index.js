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
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    // 處理單引號字符串
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    // 處理布爾值
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    // 處理數字
    else if (/^\d+$/.test(value)) value = parseInt(value, 10);
    else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);

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
} catch (err) {
  console.error('[build-index] 生成失敗:', err.message);
  // 失敗時生成空索引，避免前端崩潰
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ articles: [] }));
  process.exit(0);
}
