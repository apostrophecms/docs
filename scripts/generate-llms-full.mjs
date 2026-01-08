// scripts/generate-llms-full-vitepress.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Run from repo root.
 * Your sidebarGuide uses process.cwd() + docs/... internally (getItemRefs),
 * so cwd must be correct for dynamic items to populate.
 */

const REPO_ROOT = process.cwd();
const DOCS_DIR = path.join(REPO_ROOT, 'docs');

const GUIDE_SIDEBAR_PATH =
  process.env.GUIDE_SIDEBAR || './docs/.vitepress/sidebarGuide.js';
const TUTORIALS_SIDEBAR_PATH =
  process.env.TUTORIALS_SIDEBAR || './docs/.vitepress/sidebarTutorials.js';

const OUT_PATH =
  process.env.LLMS_FULL_OUT || path.join(DOCS_DIR, 'public', 'llms-full.txt');

// Your deployed docs base (used for URL: lines)
const SITE_BASE_URL =
  process.env.DOCS_BASE_URL || 'https://apostrophecms.com/docs';

// --- helpers ---

function cleanText(s = '') {
  return String(s)
    .replace(/<[^>]+>/g, '') // sidebar text sometimes contains HTML (icons/arrows)
    .replace(/\s+/g, ' ')
    .trim();
}

function isExternalLink(link = '') {
  return /^https?:\/\//i.test(link);
}

function normalizeDocLink(link = '') {
  let p = String(link).trim();
  if (!p || p === '/') return null;

  // strip leading slash
  p = p.replace(/^\//, '');

  // treat folder routes as index.md
  if (p.endsWith('/')) p += 'index.md';

  // if no extension, assume .md
  if (!path.extname(p)) p += '.md';

  return p;
}

function docPathToUrl(docRelPath) {
  // docs/guide/foo.md -> /guide/foo
  // docs/guide/index.md -> /guide/
  const noExt = docRelPath.replace(/\.md$/i, '');
  const asRoute = noExt.replace(/\/index$/i, '/');
  const url = `${SITE_BASE_URL}/${asRoute}`.replace(/\/{2,}/g, '/');
  return url.replace(':/', '://');
}

function stripFrontmatter(md) {
  return md.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
}

function stripVitePressContainerLines(md) {
  // Removes lines like ::: tip / :::warning / ::: etc (keeps the inner content)
  return md
    .split('\n')
    .filter((line) => !/^:::\s*$/.test(line) && !/^:::\w+/.test(line))
    .join('\n');
}

function stripTopLevelImports(md) {
  // Remove VitePress MD imports in preamble
  const lines = md.split('\n');
  const out = [];
  let inPreamble = true;

  for (const line of lines) {
    if (inPreamble && /^\s*import\s.+from\s.+;\s*$/.test(line)) continue;
    if (inPreamble && /^\s*$/.test(line)) continue;
    inPreamble = false;
    out.push(line);
  }
  return out.join('\n');
}

function ensureStartsWithH1(md, fallbackTitle) {
  const hasH1 = /^\s*#\s+.+$/m.test(md);
  if (hasH1) return md;
  return `# ${fallbackTitle}\n\n${md}`;
}

function flattenSidebar(nodes, { collection, navPath = [] } = {}) {
  const pages = [];

  for (const node of nodes || []) {
    // Skip CTAs: your sidebars include style:'cta' navigation items.
    if (node.style === 'cta') continue;

    const label = cleanText(node.text || '');
    const nextNavPath = label ? [...navPath, label] : [...navPath];

    if (node.link && !isExternalLink(node.link)) {
      const docRelPath = normalizeDocLink(node.link);
      if (docRelPath) {
        pages.push({
          collection,
          navPath: nextNavPath,
          sidebarTitle: label || null,
          docRelPath
        });
      }
    }

    if (Array.isArray(node.items) && node.items.length) {
      pages.push(...flattenSidebar(node.items, {
        collection,
        navPath: nextNavPath
      }));
    }
  }

  // de-dupe in first-seen order
  const seen = new Set();
  return pages.filter((p) => {
    const k = `${p.collection}::${p.docRelPath}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function safeRead(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function loadSidebars() {
  const guideMod = await import(
    pathToFileURL(path.resolve(REPO_ROOT, GUIDE_SIDEBAR_PATH)).href
  );
  const tutorialsMod = await import(
    pathToFileURL(path.resolve(REPO_ROOT, TUTORIALS_SIDEBAR_PATH)).href
  );

  const sidebarGuide = guideMod.sidebarGuide;
  const sidebarTutorials = tutorialsMod.sidebarTutorials;

  if (!sidebarGuide) throw new Error('Could not find export `sidebarGuide`');
  if (!sidebarTutorials) throw new Error('Could not find export `sidebarTutorials`');

  return { sidebarGuide, sidebarTutorials };
}

async function main() {
  const { sidebarGuide, sidebarTutorials } = await loadSidebars();

  const guidePages = flattenSidebar(sidebarGuide, { collection: 'guides' });
  const tutorialPages = flattenSidebar(sidebarTutorials, { collection: 'tutorials' });

  const allPages = [...guidePages, ...tutorialPages];

  const out = [];
  out.push('LLMS_FULL_VERSION: 1');
  out.push(`SITE_BASE_URL: ${SITE_BASE_URL}`);
  out.push(`GENERATED_AT: ${new Date().toISOString()}`);
  out.push(`TOTAL_PAGES: ${allPages.length}`);
  out.push('');

  let missing = 0;

  for (const page of allPages) {
    const abs = path.join(DOCS_DIR, page.docRelPath);
    const raw = await safeRead(abs);

    const title = page.sidebarTitle || page.docRelPath;
    const url = docPathToUrl(page.docRelPath);
    const navPath = page.navPath.join(' > ');

    out.push('================================================================================');
    out.push(`COLLECTION: ${page.collection}`);
    out.push(`NAV_PATH: ${navPath}`);
    out.push(`DOC_PATH: ${page.docRelPath}`);
    out.push(`URL: ${url}`);
    out.push('================================================================================');

    if (!raw) {
      missing += 1;
      out.push(`# ${title}`);
      out.push(`(MISSING_FILE: ${page.docRelPath})`);
      out.push('');
      continue;
    }

    let md = raw;
    md = stripFrontmatter(md);
    md = stripTopLevelImports(md);
    md = stripVitePressContainerLines(md);
    md = md.trim();

    // Ensure each page begins with a single H1.
    md = ensureStartsWithH1(md, title);

    out.push(md);
    out.push('');
  }

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, out.join('\n'), 'utf8');

  // eslint-disable-next-line no-console
  console.log(`✅ Wrote ${OUT_PATH}`);
  // eslint-disable-next-line no-console
  console.log(`Pages: ${allPages.length} | Missing: ${missing}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
