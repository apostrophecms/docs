import { SitemapStream } from 'sitemap';
import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';
import { readdirSync } from 'node:fs';
import { join } from 'path';

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
    // <script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/6104347.js"></script>
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
  transformHead: function ({ pageData }) {
    const head = [];

    head.push(['meta', { property: 'og:title', content: pageData.title }]);
    //head.push(['meta', { property: 'og:description', content: pageData.frontmatter.description }]);

    return head;
  },
  buildEnd: async ({ outDir, ...siteData }) => {
    console.log('Generating sitemap', siteData);
    const sitemap = new SitemapStream({
      hostname: 'https://v3.docs.apostrophecms.org/'
    });
    // const pages = await createContentLoader('*.md').load()
    const writeStream = createWriteStream(resolve(outDir, 'sitemap.xml'));

    sitemap.pipe(writeStream);
    siteData.pages.forEach((page) =>
      sitemap.write({
        url: page,
        changefreq: 'daily'
      })
    );
    sitemap.end();

    await new Promise((r) => writeStream.on('finish', r));
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
      { text: 'Extensions', link: 'https://apostrophecms.com/extensions' },
      { text: 'Community', link: 'https://discord.com/invite/XkbRNq7' },
      {
        text: 'Enterprise Solutions',
        link: 'https://apostrophecms.com/pricing'
      }
    ],
    sidebar: [
      {
        icon: 'sun',
        text: 'Introduction',
        link: 'guide/introduction',
        collapsed: true,
        items: [
          { text: 'Technical Overview', link: 'guide/technical-overview.md' }
        ]
      },
      {
        icon: 'list',
        text: 'Getting Started',
        link: 'guide/setting-up.md'
      },
      {
        icon: 'book',
        text: 'Cookbooks',
        link: 'cookbook',
        collapsed: true,
        items: [
          {
            text: 'Project Features',
            collapsed: true,
            items: [
              {
                text: 'Building navigation',
                link: 'cookbook/building-navigation.md'
              },
              { text: 'HTML conversion', link: 'cookbook/html-conversion.md' },
              {
                text: 'Creating webhooks',
                link: 'cookbook/creating-webhooks.md'
              },
              {
                text: 'Composing custom schema fields from existing fields',
                link: 'cookbook/reusing-standard-fields.md'
              }
            ]
          },
          {
            text: 'Hosting',
            collapsed: true,
            items: [
              {
                text: 'Ubuntu hosting setup',
                link: 'cookbook/ubuntu-hosting.md'
              },
              {
                text: 'Deploying to heroku',
                link: 'cookbook/deploying-to-heroku.md'
              },
              {
                text: 'Deploying with docker',
                link: 'cookbook/using-docker.md'
              },
              {
                text: 'Setting up S3 storage',
                link: 'cookbook/using-s3-storage.md'
              }
            ]
          },
          {
            text: 'Profiling',
            collapsed: true,
            items: [
              { text: 'Opentelemetry', link: 'cookbook/opentelemetry.md' }
            ]
          },
          {
            text: 'Microsoft Windows',
            collapsed: true,
            items: [
              {
                text: 'Windows development environment',
                link: 'cookbook/windows-development.md'
              }
            ]
          }
        ]
      },
      {
        icon: 'change',
        text: 'Migrating from A2 to A3',
        collapsed: true,
        link: 'guide/migration/overview.md',
        items: [
          { text: 'Upgrading from A2', link: 'guide/migration/upgrading.md' }
        ]
      },
      {
        break: true
      },
      {
        text: 'Code Organization',
        collapsed: true,
        items: [
          { text: 'Modules', link: 'guide/modules.md' },
          {
            text: 'Nested module folders',
            link: 'guide/nested-module-subdirs.md'
          },
          {
            text: 'Front End Code',
            collapsed: true,
            items: [
              {
                text: 'Front end CSS and JS',
                link: 'guide/front-end-assets.md'
              },
              { text: 'Front end code tips', link: 'guide/front-end-tips.md' },
              {
                text: 'Front end helper methods',
                link: 'guide/front-end-helpers.md'
              },
              { text: 'Static assets', link: 'guide/static-module-assets.md' }
            ]
          }
        ]
      },
      {
        text: 'Schema Fields',
        collapsed: true,
        items: [
          { text: 'Content fields', link: 'guide/content-schema.md' },
          { text: 'Conditional Fields', link: 'guide/conditional-fields.md' },
          {
            text: 'Connecting content with relationships',
            link: 'guide/relationships.md'
          },
          { text: 'Working with images and media', link: 'guide/media.md' }
        ]
      },
      {
        text: 'Pages',
        link: 'guide/pages.md'
      },
      {
        text: 'Areas and Widgets',
        collapsed: true,
        items: [
          { text: 'Areas', link: 'guide/areas-and-widgets.md' },
          { text: 'Core widgets', link: 'guide/core-widgets.md' },
          { text: 'Custom Widgets', link: 'guide/custom-widgets.md' }
        ]
      },
      {
        text: 'Pieces',
        collapsed: true,
        items: [
          { text: 'Pieces', link: 'guide/pieces.md' },
          { text: 'Piece Pages', link: 'guide/piece-pages.md' }
        ]
      },
      {
        text: 'Templating',
        collapsed: true,
        items: [
          { text: 'Working with templates', link: 'guide/templating.md' },
          { text: 'Layout templates', link: 'guide/layout-template.md' },
          { text: 'Template data', link: 'guide/template-data.md' },
          { text: 'Template filters', link: 'guide/template-filters.md' },
          { text: 'Template fragments', link: 'guide/fragments.md' },
          { text: 'Async Components', link: 'guide/async-components.md' },
          { text: 'Custom Nunjucks tags', link: 'reference/template-tags.md' },
        ]
      },
      {
        text: 'Global Settings',
        link: 'guide/global.md'
      },
      {
        text: 'User and User Roles',
        link: '/guide/users.md'
      },
      {
        text: 'Advanced Topics',
        collapsed: true,
        items: [
          {
            text: 'Localization',
            collapsed: true,
            items: [
              { text: 'Overview', link: 'guide/localization/overview.md' },
              { text: 'Static i10n', link: 'guide/localization/static.md' },
              { text: 'Dynamic i10n', link: 'guide/localization/dynamic.md' }
            ]
          },
          { text: 'Caching', link: 'guide/caching.md' },
          {
            text: 'Sending email',
            link: 'guide/sending-email.md'
          },
          {
            text: 'Working with the database',
            collapsed: true,
            items: [
              { text: 'Database Queries', link: 'guide/database-queries.md' },
              {
                text: 'Inserting and updating docs',
                link: 'guide/database-insert-update.md'
              },
              {
                text: 'Accessing the database directly',
                link: 'guide/database-access.md'
              }
            ]
          },
          {
            text: 'Using as a headless CMS',
            link: 'guide/headless-cms.md'
          },
          {
            text: 'Customizing the user interface',
            link: 'guide/custom-ui.md'
          },
          {
            text: 'Additional Customization',
            collapsed: true,
            items: [
              {
                text: 'Custom field types',
                link: 'guide/custom-schema-field-types.md'
              },
              {
                text: 'Custom login requirements',
                link: 'guide/custom-login-requirements.md'
              },
              {
                text: 'Editing custom widgets in context',
                link: 'guide/editing-custom-widgets-in-context.md'
              },
              {
                text: 'Adding placeholders to custom widgets',
                link: 'guide/adding-custom-widget-placeholder-content.md'
              }
            ]
          },
          {
            text: 'Module configuration',
            collapsed: true,
            items: [
              { text: 'Batch-operations', link: 'guide/batch-operations.md' },
              { text: 'Command menu', link: 'guide/command-menu.md' }
            ]
          },
          { text: 'Server-side events', link: 'guide/server-events.md' },
          { text: 'Hosting in production', link: 'guide/hosting.md' },
          { text: 'Webpack', link: 'guide/webpack.md' },
          { text: 'Using pnpm', link: 'guide/using-pnpm.md' },
          { text: 'Logging in Apostrophe', link: 'guide/logging.md' }
        ]
      },
      { break: true },
      {
        icon: 'core',
        text: 'Core Modules',
        collapsed: true,
        items: getItemRefs(
          ['_template'],
          '@apostrophecms/',
          'reference',
          'modules'
        )
      },
      {
        icon: 'field',
        text: 'Field Types',
        collapsed: true,
        items: getItemRefs(
          ['_choices-setting', 'index'],
          '',
          'reference',
          'field-types'
        )
      },
      {
        icon: 'cog',
        text: 'Module Configuration',
        collapsed: true,
        items: [
          {
            text: 'Module overview',
            link: 'reference/module-api/module-overview.md'
          },
          {
            text: 'Module options',
            link: 'reference/module-api/module-options.md'
          },
          {
            text: 'Server events',
            link: 'reference/server-events.md'
          },
          {
            text: 'Query builders',
            link: 'reference/query-builders.md'
          }
        ]
      },
      {
        icon: 'brain-circuit',
        text: 'REST API Reference',
        collapsed: true,
        items: getItemRefs(['README'], '', 'reference', 'api')
      },
      {
        icon: 'open-book',
        text: 'Glossary',
        link: 'reference/glossary.md'
      },
      { break: true },
      {
        text: 'Contribution Guide',
        link: '/guide/contribution.md'
      },
      {
        text: 'Extensions',
        link: 'https://apostrophecms.com/extensions'
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/apostrophecms' }],
    search: {
      provider: 'local'
    }
  }
});

function getItemRefs(
  excludeStartsWith = [],
  titlePrefix = '',
  folder = '',
  subFolder = ''
) {
  const moduleFiles = readdirSync(
    join(process.cwd(), 'docs', folder, subFolder)
  );

  return moduleFiles
    .filter((filename) => {
      // Exclude files that start with any of the strings in excludeStartsWith array
      for (let exclude of excludeStartsWith) {
        if (filename.startsWith(exclude)) {
          return false;
        }
      }
      return true;
    })
    .map((filename) => {
      return {
        text: `${titlePrefix}${filename.replace('.md', '')}`,
        link: subFolder
          ? `${folder}/${subFolder}/${filename}`
          : `${folder}/${filename}`
      };
    });
}
