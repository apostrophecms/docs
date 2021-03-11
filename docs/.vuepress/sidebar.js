module.exports = {
  '/guide': [
    {
      title: 'Guide',
      path: '/guide',
      collapsable: false,
      children: [
        'guide/whats-new.md',
        'guide/coming-soon.md',
        'guide/major-changes.md',
        'guide/upgrade.md',
        'guide/starting-your-project.md',
        'guide/module-format-example.md',
        'guide/front-end-assets.md',
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
        'guide/custom-page-types.md',
        'guide/page-tree-navigation.md',
        'guide/pieces.md',
        'guide/piece-pages.md',
        'guide/async-components.md',
        'guide/rest-apis.md'
      ]
    },
    'reference/'
  ],
  '/reference': [
    'guide/',
    {
      title: 'Reference',
      path: '/reference',
      collapsable: false,
      children: [
        'reference/glossary',
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
            // 'reference/field-types/relationship-reverse',
            'reference/field-types/select',
            'reference/field-types/string',
            'reference/field-types/slug',
            'reference/field-types/time',
            'reference/field-types/url'
          ]
        },
        {
          title: 'API routes',
          path: '/reference/api',
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
          children: [
            'reference/module-api/module-overview',
            'reference/module-api/module-options'
          ]
        }
      ]
    }
  ]
};
