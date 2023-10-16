import { readdirSync } from 'node:fs';
import { join } from 'path';

const sidebarGuide = [ 
  {
    text: 'Getting Started',
    collapsed: false,
    items: [
      { text: 'Why Apostrophe', link: 'guide/why-apostrophe.md' },
      { text: 'Technical Overview', link: 'guide/technical-overview.md' },
      { text: 'Core Concepts', link: 'guide/core-concepts.md' },
      { text: 'Development Setup', link: 'guide/development-setup.md' }
    ]
  },
  {
    icon: 'book',
    text: 'Learn Apostrophe with a tutorial project',
    link: 'tutorials/',
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
      { text: 'Custom Auth Requirements', link: 'guide/custom-login-requirements.md' },
      { text: 'Webpack Configuration', link: 'guide/webpack.md' },
      { text: 'Webhooks', link: 'cookbook/creating-webhooks.md' },
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
      },
    ]
  },
  {
    icon: 'sun',
    text: 'Upgrading From Apostrophe 2',
    link: '',
  },
  {
    text: 'Extensions',
    collapsed: false,
    items: [
      { text: 'Multisite', link: 'https://apostrophecms.com/extensions/multisite-apostrophe-assembly' },
    ]
  }
];

const sidebarOld = [
  {
    icon: 'sun',
    text: 'Introduction',
    link: 'guide/introduction.md',
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
    link: '/cookbook/',
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
    link: 'reference/field-types/index.md',
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
]

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

export { sidebarGuide }