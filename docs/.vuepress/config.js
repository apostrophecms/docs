const sidebar = require('./sidebar');

module.exports = {
  title: 'Apostrophe 3 Documentation',
  theme: 'apostrophe',
  plugins: [
    [
      '@vuepress/google-analytics',
      {
        ga: 'UA-106613728-6'
      }
    ],
    [
      'sitemap',
      {
        hostname: 'https://v3.docs.apostrophecms.org'
      }
    ]
  ],
  markdown: {
    extendMarkdown: md => {
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
    algolia: {
      apiKey: 'e11d95029c6a9ac596343664b7f622e4',
      indexName: 'apostrophecms',
      algoliaOptions: {
        facetFilters: [ 'tags:v3' ]
      }
    }
  },
  head: [
    // <script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/6104347.js"></script>
    [ 'script', {
      type: 'text/javascript',
      id: 'hs-script-loader',
      async: 'true',
      defer: 'true',
      src: '//js.hs-scripts.com/6104347.js'
    } ]
  ]
};
