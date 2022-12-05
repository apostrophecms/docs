const { readdirSync } = require('fs');

module.exports = {
  '/guide/migration/': [
    [ '/guide/migration/overview.md', 'Overview' ],
    [ '/guide/migration/upgrading.md', 'Upgrading from A2' ]
  ],
  '/guide': [
    {
      title: 'Getting started',
      collapsable: false,
      children: [
        'guide/setting-up.md',
        'guide/technical-overview.md'
      ]
    },
    {
      title: 'Guide',
      collapsable: false,
      children: [
        'guide/introduction.md',
        'guide/modules.md',
        'guide/content-schema.md',
        'guide/pages.md',
        {
          title: 'Areas and widgets',
          children: [
            'guide/areas-and-widgets',
            'guide/core-widgets.md',
            'guide/custom-widgets.md'
          ]
        },
        'guide/pieces.md',
        'guide/piece-pages.md',
        'guide/global.md',
        'guide/relationships.md',
        {
          title: 'Templating',
          children: [
            'guide/templating.md',
            'guide/layout-template.md',
            'guide/template-data.md',
            'guide/template-filters.md',
            'guide/fragments.md'
          ]
        },
        'guide/users.md',
        {
          title: 'Front end code',
          children: [
            [ 'guide/front-end-assets.md', 'Front end CSS and JS' ],
            [ 'guide/front-end-tips.md', 'Front end code tips' ],
            'guide/front-end-helpers.md'
          ]
        },
        [ 'guide/media.md', 'Working with images and media' ],
        'guide/sending-email.md'
      ]
    },
    {
      title: 'Advanced topics',
      collapsable: false,
      children: [
        'guide/caching.md',
        'guide/conditional-fields.md',
        'guide/async-components.md',
        'guide/static-module-assets.md',
        'guide/nested-module-subdirs.md',
        {
          title: 'Localization',
          path: '/guide/localization',
          children: [
            [ 'guide/localization/static.md', 'Static l10n' ],
            [ 'guide/localization/dynamic.md', 'Dynamic l10n' ]
          ]
        },
        [ 'guide/server-events.md', 'Server-side events' ],
        {
          title: 'Working with the database',
          children: [
            'guide/database-queries.md',
            [ 'guide/database-insert-update.md', 'Inserting and updating docs' ]
          ]
        },
        [ 'guide/headless-cms.md', 'Using as a headless CMS' ],
        'guide/custom-ui.md',
        [ 'guide/hosting.md', 'Hosting in production' ],
        {
          title: 'Other module config',
          children: [
            [ 'guide/batch-operations.md', 'Batch operations' ]
          ]
        },
        {
          title: 'Other customizations',
          children: [
            [ 'guide/custom-schema-field-types.md', 'Custom field types' ],
            'guide/custom-login-requirements.md',
            'guide/editing-custom-widgets-in-context.md'
          ]
        },
        'guide/webpack.md'
      ]
    },
    {
      title: 'Extensions and Integrations',
      path: 'https://apostrophecms.com/extensions'
    },
    'guide/contribution.md'
  ],
  '/cookbook': [
    {
      title: 'Project features',
      collapsable: false,
      children: [
        [ 'cookbook/building-navigation.md', 'Building site navigation' ],
        [ 'cookbook/html-conversion.md', 'Converting an HTML template' ]
      ]
    },
    {
      title: 'Hosting',
      collapsable: false,
      children: [
        [ 'cookbook/ubuntu-hosting.md', 'Ubuntu hosting setup' ],
        [ 'cookbook/deploying-to-heroku.md', 'Deploying to Heroku'],
        [ 'cookbook/using-s3-storage.md', 'Setting up S3 storage' ]
      ]
    },
    {
      title: 'Profiling',
      collapsable: false,
      children: [
        [ 'cookbook/opentelemetry.md', 'Profiling ApostropheCMS with OpenTelemetry' ]
      ]
    },
    {
      title: 'Microsoft Windows',
      collapsable: false,
      children: [
        [ 'cookbook/windows-development.md', 'Windows development environment' ]
      ]
    },
    {
      title: 'Docker containers',
      collapsable: false,
      children: [
        [ 'cookbook/using-docker.md', 'Hosting an Apostrophe project with Docker' ]
      ]
    }
  ],
  '/reference': [
    'reference/glossary',
    {
      title: 'API routes',
      path: '/reference/api',
      collapsable: false,
      children: [
        'reference/api/authentication',
        'reference/api/pieces',
        'reference/api/pages',
        'reference/api/media',
        'reference/api/field-formats'
      ]
    },
    {
      title: 'Server-side',
      path: '/reference/module-api',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        'reference/module-api/module-overview',
        [ 'reference/module-api/module-options', 'Module options' ],
        '/reference/server-events',
        '/reference/query-builders'
      ]
    },
    {
      title: 'Field types',
      path: '/reference/field-types',
      children: [
        'reference/field-types/area',
        'reference/field-types/array',
        'reference/field-types/attachment',
        'reference/field-types/boolean',
        'reference/field-types/checkboxes',
        'reference/field-types/color',
        'reference/field-types/date',
        'reference/field-types/email',
        'reference/field-types/float',
        'reference/field-types/integer',
        'reference/field-types/object',
        'reference/field-types/oembed',
        'reference/field-types/password',
        'reference/field-types/radio',
        'reference/field-types/range',
        'reference/field-types/relationship',
        'reference/field-types/relationship-reverse',
        'reference/field-types/select',
        'reference/field-types/string',
        'reference/field-types/slug',
        'reference/field-types/time',
        'reference/field-types/url'
      ]
    },
    'reference/template-tags',
    {
      title: 'Core Modules',
      children: getModuleRefs()
    }
  ]
};

function getModuleRefs () {
  const moduleFiles = readdirSync(`${process.cwd()}/docs/reference/modules`);

  return moduleFiles
    .filter(filename => !filename.startsWith('_template'))
    .map(filename => {
      return `/reference/modules/${filename}`;
    });
};
