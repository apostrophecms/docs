import { defineConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';
import { sidebarGuide } from './sidebarGuide';
import { sidebarTutorials } from './sidebarTutorials';
import { JSDOM } from 'jsdom';

import nunjucks from './theme/njk-html.tmLanguage.json';

import {
  detectModuleFormat,
  transpileToESM,
  transpileToCJS
} from './helpers/transpile';

const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID || 'testing';
const DEBUG_TRACKING = process.env.DEBUG_TRACKING || 'false';
const ENV = process.env.ENV || 'prod';

// package.json sets ENV to one of these, otherwise we're doing local testing and
// a domain + port in the URL will just be a pain in the butt -Tom
const hostnames = {
  staging: 'https://staging.apostrophecms.com',
  prod: 'https://apostrophecms.com',
  dev: ''
};

const base = '/docs/';

const hostname = hostnames[process.env.ENV || 'dev' ];

export default defineConfig({
  title: 'ApostropheCMS',
  description: 'Guides, tutorials, and API reference for ApostropheCMS, the open source Node.js CMS.',

  ignoreDeadLinks: 'localhostLinks',
  base,
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/AposNavBar.vue', import.meta.url)
          )
        },
        {
          find: /^.*\/VPSidebar\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/AposSidebar.vue', import.meta.url)
          )
        },
        {
          find: /^.*\/VPSidebarItem\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/AposSidebarItem.vue', import.meta.url)
          )
        },
        {
          find: /^.*\/VPDocFooter\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/AposDocFooter.vue', import.meta.url)
          )
        },
        {
          find: /^.*\/VPLocalSearchBox\.vue$/,
          replacement: fileURLToPath(
            new URL('./components/AposLocalSearchBox.vue', import.meta.url)
          )
        }
      ]
    }
  },
  head: [
    // Umami tracking code
    [
      'script',
      {
        defer: '',
        src: 'https://cloud.umami.is/script.js',
        'data-website-id': umamiWebsiteId
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/docs/images/favicon/favicon-32.png'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '128x128',
        href: '/docs/images/favicon/favicon-128.png'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/docs/images/favicon/favicon-192.png'
      }
    ],
    [
      'link',
      {
        rel: 'shortcut icon',
        type: 'image/png',
        sizes: '196x196',
        href: '/docs/images/favicon/favicon-196.png'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        sizes: '152x152',
        href: '/docs/images/favicon/favicon-152.png'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        sizes: '167x167',
        href: '/docs/images/favicon/favicon-167.png'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        sizes: '180x180',
        href: '/docs/images/favicon/favicon-180.png'
      }
    ]
  ],
  sitemap: {
    // here a hostname is not optional, we want one to be
    // generated for review even in dev
    hostname: (hostname || 'http://localhost:4173'),
    transformItems: (items) => {
      items.forEach(page => {
        // We need to add
        // the base because vitepress doesn't do that automatically
        // for sitemaps as of today
        page.url = `${base}${page.url}`;
        page.changefreq = 'monthly';
      });
      return items;
    }
  },
  transformHead: async (context) => {
    const { pageData } = context;
    const { frontmatter } = pageData;
    // Tutorials keep a hand-written summary for their listing card in `content`
    const leadText = (
      frontmatter.description ||
      (typeof frontmatter.content === 'string' && frontmatter.content.trim()) ||
      extractLeadText(context.content)
    ).replace(/`/g, '');
    // Search engines show about 155 characters; social previews show a little more
    const metaDescription = truncate(leadText, 155);
    const socialDescription = truncate(leadText, 200);

    const relativePath = pageData.relativePath;
    // Index pages are linked as `/docs/` and `/docs/tutorials/`, not `index.html`
    const pagePath = relativePath
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '.html');
    const absolutePath = `${hostname}/docs/${pagePath}`;

    const head = [
      [
        'meta',
        {
          property: 'og:url',
          content: absolutePath
        }
      ],
      [
        'meta',
        {
          property: 'og:type',
          content: 'website'
        }
      ],
      [
        'meta',
        {
          property: 'og:locale',
          content: 'en_US'
        }
      ],
      [
        'meta',
        {
          name: 'author',
          content: 'ApostropheCMS Team'
        }
      ],
      [
        'meta',
        {
          name: 'twitter:site',
          content: '@apostrophecms'
        }
      ],
      [
        'meta',
        {
          name: 'twitter:creator',
          content: '@apostrophecms'
        }
      ],
      [
        'meta',
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0'
        }
      ],
      [
        'meta',
        {
          name: 'theme-color',
          content: '#ffffff'
        }
      ],
      [
        'meta',
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes'
        }
      ],
      [
        'meta',
        {
          property: 'og:title',
          content: pageData.title
        }
      ],
      [
        'meta',
        {
          property: 'og:description',
          content: socialDescription
        }
      ],
      [
        'meta',
        {
          property: 'og:image',
          content: `${hostname}/docs/images/og-docs-image.png`
        }
      ],
      [
        'meta',
        {
          property: 'og:image:width',
          content: '1200'
        }
      ],
      [
        'meta',
        {
          property: 'og:image:height',
          content: '630'
        }
      ],
      [
        'meta',
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        }
      ],
      [
        'meta',
        {
          name: 'twitter:domain',
          content: 'apostrophecms.com'
        }
      ],
      [
        'meta',
        {
          name: 'twitter:url',
          content: absolutePath
        }
      ],
      [
        'meta',
        {
          property: 'twitter:title',
          content: pageData.title
        }
      ],
      [
        'meta',
        {
          property: 'twitter:description',
          content: socialDescription
        }
      ],
      [
        'meta',
        {
          property: 'twitter:image',
          content: `${hostname}/docs/images/og-docs-image.png`
        }
      ],
      [
        'meta',
        {
          property: 'og:site_name',
          content: 'ApostropheCMS Documentation'
        }
      ]
    ];

    // Replaces VitePress's site-wide default description
    if (metaDescription) {
      head.push(['meta', {
        name: 'description',
        content: metaDescription
      }]);
    }

    // Keywords from structured tags (new object format)
    if (pageData.frontmatter.tags && typeof pageData.frontmatter.tags === 'object' && !Array.isArray(pageData.frontmatter.tags)) {
      const tagValues = Object.values(pageData.frontmatter.tags).filter(Boolean);
      if (tagValues.length > 0) {
        head.push(['meta', {
          name: 'keywords',
          content: tagValues.join(', ')
        }]);
      }
    }

    // Article-specific meta tags
    if (pageData.frontmatter.date) {
      head.push(['meta', {
        property: 'article:published_time',
        content: pageData.frontmatter.date
      }]);
    }

    if (pageData.frontmatter.lastmod) {
      head.push(['meta', {
        property: 'article:modified_time',
        content: pageData.frontmatter.lastmod
      }]);
    }

    if (pageData.frontmatter.author) {
      head.push(['meta', {
        property: 'article:author',
        content: pageData.frontmatter.author
      }]);
    }

    // Categories for article tagging
    if (pageData.frontmatter.categories && Array.isArray(pageData.frontmatter.categories)) {
      pageData.frontmatter.categories.forEach(category => {
        head.push(['meta', {
          property: 'article:section',
          content: category
        }]);
      });
    }

    // Tags for article tagging (structured tags - new object format)
    if (pageData.frontmatter.tags && typeof pageData.frontmatter.tags === 'object' && !Array.isArray(pageData.frontmatter.tags)) {
      Object.values(pageData.frontmatter.tags).filter(Boolean).forEach(tag => {
        head.push(['meta', {
          property: 'article:tag',
          content: tag
        }]);
      });
    }

    // Canonical URL, unless the page sets its own in frontmatter `head`
    // (redirect stubs point theirs at the new page)
    const hasCanonical = (frontmatter.head || [])
      .some(([ tag, attrs ]) => tag === 'link' && attrs?.rel === 'canonical');
    if (!hasCanonical) {
      head.push(['link', {
        rel: 'canonical',
        href: frontmatter.canonical || absolutePath
      }]);
    }

    // Structured data for tutorials
    if (pageData.frontmatter.categories?.includes('Tutorials')) {
      // Handle keywords for structured data
      let keywordsString = '';
      if (pageData.frontmatter.tags && typeof pageData.frontmatter.tags === 'object' && !Array.isArray(pageData.frontmatter.tags)) {
        keywordsString = Object.values(pageData.frontmatter.tags).filter(Boolean).join(', ');
      } else if (pageData.frontmatter.tags && Array.isArray(pageData.frontmatter.tags)) {
        keywordsString = pageData.frontmatter.tags.join(', ');
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: pageData.title,
        description: metaDescription,
        author: {
          '@type': 'Organization',
          name: pageData.frontmatter.author || 'ApostropheCMS Team'
        },
        datePublished: pageData.frontmatter.date,
        dateModified: pageData.frontmatter.lastmod || pageData.frontmatter.date,
        keywords: keywordsString,
        programmingLanguage: 'JavaScript',
        operatingSystem: 'Cross-platform',
        applicationCategory: 'Web Development',
        about: {
          '@type': 'SoftwareApplication',
          name: 'ApostropheCMS'
        }
      };

      if (pageData.frontmatter.featured_image) {
        structuredData.image = `${hostname}${pageData.frontmatter.featured_image}`;
      }

      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(structuredData)]);
    }

    return head;
  },
  markdown: {
    theme: require('./theme/dracula-at-night.json'),
    defaultHighlightLang: 'sh',
    // `mjs` and `cjs` fences highlight as JavaScript but opt out of the
    // CJS/ESM toggle below, which only applies to `js`, `javascript` and `ts`
    languageAlias: {
      mjs: 'js',
      cjs: 'js'
    },
    languages: [
      'html',
      {
        id: 'njk-html',
        scopeName: 'text.html.njk',
        ...nunjucks,
        displayName: 'Nunjucks',
        embeddedLangs: ['html'],
        aliases: ['njk', 'nunjucks']
      }
    ],
    preConfig: (md) => {
      const defaultFence = md.renderer.rules.fence;

      const getHighlightedCode = (content, lang, options, env, slf) => {
        const tempToken = {
          type: 'fence',
          info: lang,
          content: content,
          markup: '```',
          map: null
        };
        return defaultFence([tempToken], 0, options, env, slf);
      };

      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        const lang = token.info.trim().split(/\s+/)[0];
        const { canTransform, format } = detectModuleFormat(token.content);

        if (!canTransform) {
          return defaultFence(tokens, idx, options, env, slf);
        }

        if (['js', 'javascript', 'ts'].includes(lang)) {
          let cjsCode, esmCode;

          if (format === 'cjs') {
            cjsCode = token.content;
            esmCode = transpileToESM(token.content);
          } else if (format === 'esm') {
            esmCode = token.content;
            cjsCode = transpileToCJS(token.content);
          }

          const cjsHighlighted = getHighlightedCode(cjsCode, lang, options, env, slf);
          const esmHighlighted = getHighlightedCode(esmCode, lang, options, env, slf);

          const finalOutput = `<div class="module-code-block language-${lang}"
            data-cjs="${encodeURIComponent(cjsHighlighted)}"
            data-esm="${encodeURIComponent(esmHighlighted)}"
            data-source="${format}"
            data-lang="${lang}">
            ${format === 'cjs' ? cjsHighlighted : esmHighlighted}
            </div>`;
          return finalOutput;
        }

        return defaultFence(tokens, idx, options, env, slf);
      }
    }
  },
  themeConfig: {
    logo: '/apostrophe-primary-mark.svg',
    lastUpdated: true,
    docsRepo: 'https://github.com/apostrophecms/docs',
    docsBranch: 'main',
    docsDir: 'docs',
    lastUpdatedText: 'Last updated',
    ignoreDeadLinks: 'localhostLinks',
    editLinkText: 'Edit this page on GitHub',
    nav: [
      // match if the url doesn't contain /tutorials/
      { text: 'Guide', link: '/', activeMatch: '^/(?!tutorials)' },
      { text: 'Tutorials', link: '/tutorials/', activeMatch: '/tutorials/' },
      {
        text: 'More',
        items: [
          { text: 'Extensions', link: 'https://apostrophecms.com/extensions' },
          { text: 'Starter Kits', link: 'https://apostrophecms.com/starter-kits' },
          { text: 'Community', link: 'https://discord.com/invite/XkbRNq7' },
          { text: 'Enterprise Solutions', link: 'https://apostrophecms.com/pricing' }
        ]
      },
    ],
    sidebar: {
      '/': { items: sidebarGuide },
      '/tutorials/': { items: sidebarTutorials }
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/apostrophecms' }],
    search: {
      provider: 'local'
    },
    __DEBUG_TRACKING__: JSON.stringify(DEBUG_TRACKING),
    __ENV__: JSON.stringify(ENV)
  }
});

// Builds a plain-text summary of a page from its opening paragraphs.
// Headings, code blocks, tables, and callouts are skipped so that only
// prose ends up in the meta and social descriptions.
function extractLeadText(html) {
  const { document } = new JSDOM(html).window;
  const root = document.querySelector('.vp-doc') ||
    document.querySelector('h1')?.parentElement;
  if (!root) {
    return '';
  }

  root.querySelectorAll([
    'pre',
    'table',
    '.header-anchor',
    '.custom-block',
    '.code-block-container',
    '[class*="language-"]'
  ].join(', ')).forEach(el => el.remove());

  const parts = [];
  let length = 0;
  for (const el of root.querySelectorAll('p, h2')) {
    // Prefer the page's introduction over text from later sections
    if (el.tagName === 'H2') {
      if (parts.length) {
        break;
      }
      continue;
    }
    const text = el.textContent.replace(/[\s\u200B]+/g, ' ').trim();
    // Skip empty paragraphs and rows of links like "Demo · Roadmap"
    const linkText = [ ...el.querySelectorAll('a') ]
      .map(a => a.textContent)
      .join('');
    if (!text || text.replace(/[\s·|-]/g, '') === linkText.replace(/\s/g, '')) {
      continue;
    }
    // Skip label lines like "**Alias:** `apos.asset`" on module reference pages
    const label = el.firstElementChild;
    if (label?.tagName === 'STRONG' && label.textContent.trim().endsWith(':') &&
      text.length < 100) {
      continue;
    }
    parts.push(text);
    length += text.length;
    if (length >= 300) {
      break;
    }
  }
  return parts.join(' ');
}

// Shortens text to `max` characters at a word boundary.
function truncate(text, max) {
  if (text.length <= max) {
    return text;
  }
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.]+$/, '')}…`;
}
