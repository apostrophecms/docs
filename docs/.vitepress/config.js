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
    // Microsoft Clarity tag script
    [
      'script',
      {},
      `
      (function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}; t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i; y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window, document, "clarity", "script", "emium5rsl8");
    `
    ],
    // Google Analytics Tag manager script 1
    [
      'script',
      {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-T1M7W6BWMD'
      }
    ],
    // Google Analytics Tag manager script 2
    [
      'script',
      {},
      `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-T1M7W6BWMD');
    `
    ],
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
    hostname: 'https://v3.docs.apostrophecms.org/',
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

    const relativePath = context.pageData.relativePath;
    const absolutePath = `https://v3.docs.apostrophecms.org/${relativePath.replace('.md', '.html')}`;

    const returnedArray = [
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
          property: 'og:title',
          content: context.pageData.title
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
          content: 'https://v3.docs.apostrophecms.org/images/og-docs-image.png'
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
          content: 'v3.docs.apostrophecms.org'
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
          content: context.pageData.title
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
          content: 'https://v3.docs.apostrophecms.org/images/og-docs-image.png'
        }
      ]
    ];
    return returnedArray;
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
        return defaultFence([tempToken], 0, options, env, slf)
      };

      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        const lang = token.info.trim().split(/\s+/)[0];
        const { canTransform, format } = detectModuleFormat(token.content);

        if (!canTransform) {
          return defaultFence(tokens, idx, options, env, slf);
        }

        if ([ 'js', 'javascript', 'ts' ].includes(lang)) {
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
