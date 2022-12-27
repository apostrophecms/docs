const sidebar = require('./sidebar');

module.exports = {
  title: 'Apostrophe 3 Documentation',
  theme: 'apostrophe',
  plugins: [
    [
      'sitemap',
      {
        hostname: 'https://v3.docs.apostrophecms.org'
      }
    ]
  ],
  markdown: {
    extendMarkdown: (md) => {
      md.use(require('markdown-it-attrs'));
    }
  },
  themeConfig: {
    // Disabled to move into dropdown nav
    // repo: 'https://github.com/apostrophecms/apostrophe',
    docsRepo: 'https://github.com/apostrophecms/a3-docs',
    docsBranch: 'main',
    docsDir: 'docs',
    lastUpdated: 'Last updated',
    nextLinks: true,
    prevLinks: true,
    editLinks: true,
    sidebar,
    search: false,
    feedbackWidget: {
      docsRepoIssue: 'apostrophecms/a3-docs'
    },
    logo: '/images/apos-dark.png',
    nav: [
      {
        text: 'Versions',
        ariaLabel: 'Apostrophe versions',
        items: [
          {
            text: 'Apostrophe 3',
            link: '/'
          },
          {
            text: 'Apostrophe 2',
            link: 'https://v2.docs.apostrophecms.org',
            target: '_self'
          }
        ]
      },
      {
        text: 'Sections',
        ariaLabel: 'Documentation sections',
        items: [
          {
            text: 'Getting started',
            link: '/guide/setting-up.md'
          },
          {
            text: 'Guide',
            link: '/guide/introduction.md'
          },
          {
            text: 'Reference',
            link: '/reference/'
          },
          {
            text: 'Cookbook',
            link: '/cookbook/'
          },
          {
            text: 'Migration',
            link: '/guide/migration/overview.md'
          }
        ]
      },
      {
        text: 'More',
        ariaLabel: 'More Apostrophe links',
        items: [
          {
            text: 'Main site',
            link: 'https://apostrophecms.com',
            rel: false
          },
          {
            text: 'Extensions',
            link: 'https://apostrophecms.com/extensions',
            rel: false
          },
          {
            text: 'GitHub',
            link: 'https://github.com/apostrophecms/apostrophe',
            re: false
          },
          {
            text: 'Discord',
            link: 'http://chat.apostrophecms.org/',
            rel: false
          },
          {
            text: 'Forum',
            link: 'https://github.com/apostrophecms/apostrophe/discussions',
            rel: false
          },
          {
            text: 'Stack Overflow',
            link: 'https://stackoverflow.com/questions/tagged/apostrophe-cms',
            rel: false
          }
        ]
      }
    ],
    // algolia: {
    //   apiKey: 'e11d95029c6a9ac596343664b7f622e4',
    //   indexName: 'apostrophecms',
    //   algoliaOptions: {
    //     facetFilters: ['tags:v3']
    //   }
    // }
  },
  head: [
    // <script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/6104347.js"></script>
    [
      'script',
      {
        type: 'text/javascript',
        id: 'google-search-script-loader',
        async: 'true',
        defer: 'true',
        src: 'https://cse.google.com/cse.js?cx=a5ea71de12ddd427f'
      }
    ],
    [
      'script',
      {
        type: 'text/javascript',
        id: 'hs-script-loader',
        async: 'true',
        defer: 'true',
        src: '//js.hs-scripts.com/6104347.js'
      }
    ],
    // Microsoft Clarity tag script
    [
      'script', {}, `
      (function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}; t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i; y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window, document, "clarity", "script", "emium5rsl8");
    ` ],
    // Google Analytics Tag manager script 1
    [
      'script', {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-T1M7W6BWMD'
      }
    ],
    // Google Analytics Tag manager script 2
    [
      'script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-T1M7W6BWMD');
    ` ],
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
  ]
};
