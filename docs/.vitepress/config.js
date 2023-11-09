import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';
import { sidebarGuide } from './sidebarGuide';
import { sidebarTutorials } from './sidebarTutorials';
import { readdirSync } from 'node:fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import nlp from 'compromise';

export default defineConfig({
  title: 'ApostropheCMS',
  description: 'Documentation for Apostrophe 3',

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
        href: 'images/favicon/favicon-192.png'
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
    const returnedArray = [
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
          content: 'https://v3.docs.apostrophecms.org/images/apos-dark.png'
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
      ]
    ];
    return returnedArray;
  },
  markdown: {
    theme: require('./theme/dracula-at-night.json'),
    languages: [
      {
        id: 'njk-html',
        scopeName: 'text.html.njk',
        grammar: require('./theme/njk-html.tmLanguage.json'),
        displayName: 'Nunjucks',
        embeddedLangs: ['html'],
        aliases: ['njk', 'nunjucks']
      }
    ]
  },
  themeConfig: {
    logo: '/apostrophe-primary-mark.svg',
    lastUpdated: true,
    docsRepo: 'https://github.com/apostrophecms/a3-vitepress-docs',
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
    }
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
  const strippedHTML = htmlBlock.replace(/<\/?[^>]+(>|$)|[\u0022\u0027\u0060\u003C\u003E\u0026]/g, function(match) {
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
