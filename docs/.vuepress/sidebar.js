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
        'guide/modules.md',
        'guide/content-schema.md',
        'guide/pages.md',
        {
          title: 'Areas and widgets',
          // What are widgets and areas and how you configure them
          path: '/guide/areas-and-widgets',
          children: [
            'guide/areas-and-widgets/core-widgets.md',
            'guide/areas-and-widgets/custom-widgets.md'
          ]
        },
        'guide/pieces.md',
        'guide/piece-pages.md',
        'guide/global.md',
        'guide/relationships.md',
        // 'guide/users.md',
        'guide/front-end-assets.md'
      ]
    },
    {
      title: 'Advanced topics',
      collapsable: false,
      children: [
        'guide/advanced/rest-apis.md',
        'guide/advanced/conditional-fields.md',
        'guide/advanced/async-components.md',
        'guide/template-fragments'
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
