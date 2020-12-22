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
        'guide/widgets-and-templates.md',
        'guide/custom-widgets.md',
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
        {
          title: 'APIs',
          path: '/reference/api',
          children: [
            'reference/api/authentication',
            'reference/api/pieces',
            'reference/api/pages',
            'reference/api/media'
          ]
        }
      ]
    }
  ]
  // '/': [
  //   'guide/',
  //   'reference/'
  // ]
};
