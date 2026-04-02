/**
 * Static site generator for Cloudflare Pages.
 * Run: node build.js (from backend/node/)
 * Output: backend/node/dist/
 * CF Pages build command: cd backend/node && npm install && node build.js
 * CF Pages output directory: backend/node/dist
 */

'use strict';

const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const PAGES_DIR = path.join(ROOT, 'frontend/src/pages');
const DIST_DIR = path.join(__dirname, 'dist');

const PAGES = [
  { template: 'home',        out: 'index.html',              title: 'Home',        currentPage: 'home',        description: 'Arzisoft — Building the Future of Solutions' },
  { template: 'services',    out: 'services/index.html',     title: 'Services',    currentPage: 'services' },
  { template: 'product',     out: 'product/index.html',      title: 'Products',    currentPage: 'product' },
  { template: 'ai',          out: 'ai/index.html',           title: 'AI Chat',     currentPage: 'ai' },
  { template: 'devgrup',     out: 'devgrup/index.html',      title: 'DEVGRUP',     currentPage: 'devgrup' },
  { template: 'login',       out: 'login/index.html',        title: 'Login',       currentPage: 'login' },
  { template: 'get-started', out: 'get-started/index.html',  title: 'Get Started', currentPage: 'get-started' },
  { template: 'resources',      out: 'resources/index.html',       title: 'Resources',              currentPage: 'resources' },
  { template: 'ai-automation', out: 'ai-automation/index.html',  title: 'Automation Flow Designer', currentPage: 'ai' },
  { template: 'admin',         out: 'admin/index.html',          title: 'Admin',                    currentPage: '' },
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Render EJS pages
  for (const page of PAGES) {
    const templatePath = path.join(PAGES_DIR, `${page.template}.ejs`);
    const outPath = path.join(DIST_DIR, page.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const vars = {
      currentPage: page.currentPage,
      title: page.title,
      ...(page.description ? { description: page.description } : {}),
    };

    try {
      const html = await ejs.renderFile(templatePath, vars, { views: [PAGES_DIR] });
      fs.writeFileSync(outPath, html, 'utf8');
      console.log(`  rendered  ${page.out}`);
    } catch (err) {
      console.error(`  ERROR     ${page.template}: ${err.message}`);
      process.exit(1);
    }
  }

  // Copy static assets
  copyDir(path.join(ROOT, 'frontend/src/styles'),  path.join(DIST_DIR, 'styles'));
  copyDir(path.join(ROOT, 'frontend/src/scripts'), path.join(DIST_DIR, 'scripts'));
  copyDir(path.join(ROOT, 'frontend/public/assets'), path.join(DIST_DIR, 'assets'));
  console.log('  copied    styles/ scripts/ assets/');

  console.log(`\nBuild complete → ${DIST_DIR}`);
}

build();
