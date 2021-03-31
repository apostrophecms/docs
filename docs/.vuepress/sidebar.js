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
      title: 'Coming from A2',
      collapsable: false,
      children: [
        'guide/new-apostrophe.md',
        'guide/major-changes.md',
        'guide/upgrade.md'
      ]
    },
    {
      title: 'Guide',
      collapsable: false,
      children: [
        'guide/introduction.md',
        'guide/custom-page-types.md',
        'guide/page-tree-navigation.md',
        {
          title: 'Widgets and templates',
          path: '/guide/widgets-and-templates',
          children: [
            'guide/widgets-and-templates/home-page.md',
            'guide/widgets-and-templates/standard-widgets.md',
            'guide/widgets-and-templates/custom-widgets.md',
            'guide/widgets-and-templates/fragments.md'
          ]
        },
        'guide/pieces.md',
        'guide/piece-pages.md',
        'guide/front-end-assets.md',
        'guide/async-components.md',
        'guide/rest-apis.md'
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
      children: [
        'reference/module-api/module-overview',
        'reference/module-api/module-options',
        'reference/module-api/example.md'
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
