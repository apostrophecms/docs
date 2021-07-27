module.exports = {
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
            [ 'guide/template-data.md', 'Template data 🆕' ],
            'guide/fragments.md'
          ]
        },
        'guide/users.md',
        {
          title: 'Front end code',
          children: [
            [ 'guide/front-end-assets.md', 'Front end CSS and JS 🆕' ],
            [ 'guide/front-end-helpers.md', 'Front end helper methods 🆕' ]
          ]
        },
        [ 'guide/media.md', 'Working with images and media 🆕' ]
      ]
    },
    {
      title: 'Advanced topics',
      collapsable: false,
      children: [
        'guide/conditional-fields.md',
        [ 'guide/async-components.md', 'Async components 🆕' ],
        [ 'guide/hosting.md', 'Hosting in production 🆕' ]
      ]
    },
    [ 'guide/upgrading.md', 'Coming from 2.x 🆕' ],
    [ 'guide/contribution.md', 'Contribution guide 🆕' ]
  ],
  '/cookbook': [
    {
      title: 'Hosting',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        [ 'cookbook/ubuntu-hosting.md', 'Ubuntu hosting setup 🆕' ]
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
      title: 'Module API',
      path: '/reference/module-api',
      collapsable: false,
      sidebarDepth: 2,
      children: [
        'reference/module-api/module-overview',
        'reference/module-api/module-options'
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
    }
  ]
};
