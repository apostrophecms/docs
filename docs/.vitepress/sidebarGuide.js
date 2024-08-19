import { readdirSync } from 'node:fs';
import { join } from 'path';

const sidebarGuide = [
  {
    text: 'Getting Started',
    collapsed: false,
    items: [
      { text: 'Introduction', link: 'guide/introduction.md' },
      { text: 'Why Apostrophe', link: 'guide/why-apostrophe.md' },
      { text: 'Technical Overview', link: 'guide/technical-overview.md' },
      { text: 'Core Concepts', link: 'guide/core-concepts.md' },
      { text: 'Development Setup', link: 'guide/development-setup.md' },
      { text: 'Windows Development', link: 'cookbook/windows-development.md' },
      { text: 'Dockerized MongoDB', link: 'guide/dockerized-mongodb.md' },
      {
        text: 'Migrating',
        collapsed: true,
        items: [
          { text: 'Overview', link: 'guide/migration/overview.md' },
          {text: 'Upgrade From Apostrophe 2', link: 'guide/migration/upgrading.md'},
          { text: 'Upgrade From Apostrophe 3', link: 'guide/migration/upgrading-3-to-4.md' }
        ]
      }
    ]
  },
  {
    text: 'Learn Apostrophe with a tutorial project &#8594',
    link: '/tutorials/',
    style: 'cta'
  },
  {
    text: 'Essentials',
    collapsed: false,
    items: [
      {
        text: 'Code Organization',
        collapsed: true,
        items: [
          { text: 'Modules', link: 'guide/modules.md' },
          { text: 'Nesting Modules', link: 'guide/nested-module-subdirs.md' },
          {
            text: 'Front End',
            collapsed: true,
            items: [
              { text: 'CSS and JS', link: 'guide/front-end-assets.md' },
              { text: 'Front End Tips', link: 'guide/front-end-tips.md' },
              { text: 'Front End Helpers', link: 'guide/front-end-helpers.md' },
              { text: 'Static Assets', link: 'guide/static-module-assets.md' }
            ]
          }
        ]
      },
      {
        text: 'Schemas',
        collapsed: true,
        items: [
          { text: 'Content Fields', link: 'guide/content-schema.md' },
          { text: 'Conditional Fields', link: 'guide/conditional-fields.md' },
          { text: 'Content Relationships', link: 'guide/relationships.md' },
          { text: 'Images and Media', link: 'guide/media.md' }
        ]
      },
      {
        text: 'Pages and Pieces',
        collapsed: true,
        items: [
          { text: 'Pages', link: 'guide/pages.md' },
          { text: 'Pieces', link: 'guide/pieces.md' },
          { text: 'Piece Pages', link: 'guide/piece-pages.md' }
        ]
      },
      {
        text: 'Areas and Widgets',
        collapsed: true,
        items: [
          { text: 'Areas', link: 'guide/areas-and-widgets.md' },
          { text: 'Core Widgets', link: 'guide/core-widgets.md' },
          { text: 'Custom Widgets', link: 'guide/custom-widgets.md' }
        ]
      },
      {
        text: 'Templating',
        collapsed: true,
        items: [
          { text: 'Working with Templates', link: 'guide/templating.md' },
          { text: 'Layout Templates', link: 'guide/layout-template.md' },
          { text: 'Template Data', link: 'guide/template-data.md' },
          { text: 'Template Filters', link: 'guide/template-filters.md' },
          { text: 'Template Fragments', link: 'guide/fragments.md' },
          { text: 'Async Components', link: 'guide/async-components.md' },
          { text: 'Custom Nunjucks Tags', link: 'reference/template-tags.md' },
        ]
      },
      { text: 'Headless', link: 'guide/headless-cms.md' },
      { text: 'Users and Roles', link: 'guide/users.md' },
      { text: 'Site Settings', link: 'guide/global.md' },
    ]
  },
  {
    text: 'Scaling Up',
    collapsed: false,
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
      { text: 'Logging', link: 'guide/logging.md' },
      { text: 'Profiling', link: 'cookbook/opentelemetry.md' },
      { text: 'Sending Email', link: 'guide/sending-email.md' },
    ]
  },
  {
    text: 'Customizing & Extending',
    collapsed: false,
    items: [
      {
        text: 'The Database',
        collapsed: true,
        items: [
          { text: 'Database Queries', link: 'guide/database-queries.md' },
          {
            text: 'Inserting and Updating Docs',
            link: 'guide/database-insert-update.md'
          },
          {
            text: 'Accessing the Database Directly',
            link: 'guide/database-access.md'
          }
        ]
      },
      { text: 'Keyboard Shortcuts', link: 'guide/command-menu.md' },
      { text: 'Custom Admin UI', link: 'guide/custom-ui.md' },
      { text: 'Custom Field Types', link: 'guide/custom-schema-field-types.md' },
      { text: 'Adding Batch Operations', link: 'guide/batch-operations.md' },
      { text: 'In-context Custom Widgets', link: 'guide/editing-custom-widgets-in-context.md' },
      { text: 'Custom Widget Placeholders', link: 'guide/adding-custom-widget-placeholder-content.md' },
      { text: 'Custom Auth Requirements', link: 'guide/custom-login-requirements.md' },
      { text: 'Webpack Configuration', link: 'guide/webpack.md' },
      { text: 'Using pnpm', link: 'guide/using-pnpm.md' },
      { text: 'Webhooks', link: 'cookbook/creating-webhooks.md' },
      { text: 'Server-side errors for fields', link: 'guide/server-side-field-errors.md' }
    ]
  },
  {
    text: 'Hosting & DevOps',
    collapsed: false,
    items: [
      { text: 'Hosting in Production', link: 'guide/hosting.md' },
      { text: 'Docker', link: 'cookbook/using-docker.md' },
      { text: 'Ubuntu', link: 'cookbook/ubuntu-hosting.md' },
      { text: 'Heroku', link: 'cookbook/deploying-to-heroku.md' },
      { text: 'Amazon S3', link: 'cookbook/using-s3-storage.md' },
    ]
  },
  {
    text: 'Config & API Reference',
    collapsed: false,
    items: [
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
        link: 'reference/field-types/index.md',
        items: getItemRefs(
          [ '_choices-setting', 'index' ],
          '',
          'reference',
          'field-types',
          { 'relationship-reverse.md': 'relationshipReverse' }
        )
      },
      {
        icon: 'cog',
        text: 'Module Configuration',
        collapsed: true,
        items: [
          {
            text: 'Module Overview',
            link: 'reference/module-api/module-overview.md'
          },
          {
            text: 'Module Options',
            link: 'reference/module-api/module-options.md'
          },
          {
            text: 'Server Events',
            link: 'reference/server-events.md'
          },
          {
            text: 'Query Builders',
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
      }
    ]
  },
  {
    text: 'Starter Kits',
    collapsed: false,
    items: [
      {
        text: 'Essentials Starter Kit',
        link: 'starters/essentials.md'
      },
      {
        text: 'Pro Essentials Starter Kit',
        link: 'starters/pro-essentials.md'
      },
      {
        text: ' Pro Assembly Starter Kit',
        link: 'starters/assembly.md'
      }
    ]
  },
  {
    text: 'Pro Extensions',
    collapsed: false,
    items: [
      { text: 'Multisite', link: 'https://apostrophecms.com/extensions/multisite-apostrophe-assembly' },
      { text: 'Advanced Permissions', link: 'https://apostrophecms.com/extensions/advanced-permission' },
      { text: 'Document Versions', link: 'https://apostrophecms.com/extensions/document-version' },
      { text: 'Template Library', link: 'https://apostrophecms.com/extensions/template-library' },
      { text: 'Palette Design Editor', link: 'https://apostrophecms.com/extensions/palette-3' },
      { text: 'Apostrophe Basics', link: 'https://apostrophecms.com/extensions/apostrophe-basics' },
      { text: 'Data Set', link: 'https://apostrophecms.com/extensions/data-set' },
      { text: 'Account Signup', link: 'https://apostrophecms.com/extensions/account-signup' },
      { text: 'Automated Testing Tools', link: 'https://apostrophecms.com/extensions/automated-testing-tools' },
      { text: 'Automatic Translation', link: 'https://apostrophecms.com/extensions/automatic-translation' },
      { text: 'SEO Assistant', link: 'https://apostrophecms.com/extensions/seo-assistant'}
    ]
  }
];

function getItemRefs(
  excludeStartsWith = [],
  titlePrefix = '',
  folder = '',
  subFolder = '',
  customDisplayNames = {}
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
      // Use custom display name if it exists, otherwise use the default name
      let displayText = customDisplayNames[filename]
        ? customDisplayNames[filename]
        : filename.replace('.md', '');

      return {
        text: `${titlePrefix}${displayText}`,
        link: subFolder
          ? `${folder}/${subFolder}/${filename}`
          : `${folder}/${filename}`
      };
    });
}


export { sidebarGuide }