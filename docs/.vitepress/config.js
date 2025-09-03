import { defineConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';
import { sidebarGuide } from './sidebarGuide';
import { sidebarTutorials } from './sidebarTutorials';
import { JSDOM } from 'jsdom';
import nlp from 'compromise';

import nunjucks from './theme/njk-html.tmLanguage.json';

import {
  detectModuleFormat,
  transpileToESM,
  transpileToCJS
} from './helpers/transpile';

const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID || 'testing';
const DEBUG_TRACKING = process.env.DEBUG_TRACKING || 'false';
const ENV = process.env.ENV || 'production';

export default defineConfig({
  title: 'ApostropheCMS',
  description: 'Documentation for ApostropheCMS',

  ignoreDeadLinks: 'localhostLinks',
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
        href: '/images/favicon/favicon-32.png'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '128x128',
        href: '/images/favicon/favicon-128.png'
      }
    ],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/images/favicon/favicon-192.png'
      }
    ],
    [
      'link',
      {
        rel: 'shortcut icon',
        type: 'image/png',
        sizes: '196x196',
        href: '/images/favicon/favicon-196.png'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        sizes: '152x152',
        href: '/images/favicon/favicon-152.png'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        sizes: '167x167',
        href: '/images/favicon/favicon-167.png'
      }
    ],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        sizes: '180x180',
        href: '/images/favicon/favicon-180.png'
      }
    ]
  ],
  sitemap: {
    hostname: 'https://docs.apostrophecms.org/',
    transformItems: (items) => {
      items.forEach(page => {
        page.changefreq = 'monthly';
      });
      return items;
    }
  },
  transformHead: async (context) => {
    const docText = await parseContent(context.content);
    const description = await processText(docText);
    const { pageData } = context;

    const relativePath = pageData.relativePath;
    const absolutePath = `https://docs.apostrophecms.org/${relativePath.replace('.md', '.html')}`;

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
          content: description
        }
      ],
      [
        'meta',
        {
          property: 'og:image',
          content: 'https://docs.apostrophecms.org/images/og-docs-image.png'
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
          content: 'docs.apostrophecms.org'
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
          content: description
        }
      ],
      [
        'meta',
        {
          property: 'twitter:image',
          content: 'https://docs.apostrophecms.org/images/og-docs-image.png'
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

    // Basic SEO meta tags from frontmatter
    if (pageData.frontmatter.description) {
      head.push(['meta', {
        name: 'description',
        content: pageData.frontmatter.description
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

    // Canonical URL
    const canonicalUrl = pageData.frontmatter.canonical || absolutePath;
    head.push(['link', {
      rel: 'canonical',
      href: canonicalUrl
    }]);

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
        description: pageData.frontmatter.description || description,
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
        structuredData.image = `https://docs.apostrophecms.org${pageData.frontmatter.featured_image}`;
      }

      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(structuredData)]);
    }

    return head;
  },
  markdown: {
    theme: require('./theme/dracula-at-night.json'),
    defaultHighlightLang: 'sh',
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

async function parseContent(htmlBlock) {
  const dom = new JSDOM(htmlBlock);
  const h1Element = dom.window.document.querySelector('h1');
  let textContent;

  if (h1Element) {
    const parentElement = h1Element.parentElement;
    parentElement.removeChild(h1Element);
    textContent = parentElement.textContent.trim();
  }
  return textContent;
}

async function processText(htmlBlock) {
  if (!htmlBlock) {
    return '';
  }
  const truncate = (str, length) => {
    if (str.length <= length) return str;
    const trimmedStr = str.substr(0, length);
    return (
      trimmedStr.substr(
        0,
        Math.min(trimmedStr.length, trimmedStr.lastIndexOf(' '))
      ) + '...'
    );
  };
  const strippedHTML = htmlBlock.replace(/<\/?[^>]+(>|$)|[\u0022\u0027\u0060\u003C\u003E\u0026]/g, function (match) {
    if (match === '\u200B') {
      return ' ';
    }
    return '';
  });

  const analysis = nlp(strippedHTML);
  const sentences = analysis.sentences().out('array');
  let summary = sentences.join(' ');
  summary = truncate(summary, 300);
  return summary;
}
