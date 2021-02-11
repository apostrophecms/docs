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
            'guide/widgets-and-templates/custom-widgets.md'
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
          title: 'APIs',
          path: '/reference/api',
          children: [
            'reference/api/authentication',
            'reference/api/pieces',
            'reference/api/pages',
            'reference/api/media',
            'reference/api/field-formats'
          ]
        }
      ]
    }
  ]
};
