const sidebar = require('./sidebar');

module.exports = {
  title: 'Apostrophe 3 Documentation',
  plugins: {
    '@vuepress/google-analytics': {
      ga: 'UA-106613728-6'
    },
    sitemap: {
      hostname: 'https://docs.apostrophecms.com'
    }
  },
  themeConfig: {
    repo: 'https://github.com/apostrophecms/a3-boilerplate/',
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
        text: 'Guide',
        items: [
          {
            text: 'Getting Started',
            link: '/getting-started/'
          },
          {
            text: 'Guide',
            link: '/guide/'
          }
        ]
      },
      {
        text: 'Reference',
        link: '/reference/'
      },
      {
        text: 'More',
        ariaLabel: 'More Apostrophe links',
        items: [
          {
            text: 'Community',
            link: 'https://apostrophecms.com/get-involved',
            rel: false
          },
          {
            text: 'Apostrophe Website',
            link: 'https://apostrophecms.com',
            rel: false
          }
        ]
      }
    ]
  },
  head: [
    // <script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/6104347.js"></script>
    ['script', {
      type: 'text/javascript',
      id: 'hs-script-loader',
      async: 'true',
      defer: 'true',
      src: '//js.hs-scripts.com/6104347.js'
    }]
  ]
};
