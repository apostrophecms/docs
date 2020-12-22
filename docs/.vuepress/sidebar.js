module.exports = {
  '/reference': [
    '/',
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
  ],
  '/': [
    '/whats-new.md',
    '/coming-soon.md',
    '/major-changes.md',
    '/upgrade.md',
    '/starting-your-project.md',
    '/module-format-example.md',
    '/front-end-assets.md',
    '/widgets-and-templates.md',
    '/custom-widgets.md',
    '/custom-page-types.md',
    '/page-tree-navigation.md',
    '/pieces.md',
    '/piece-pages.md',
    '/async-components.md',
    '/rest-apis.md',
    'reference/'
  ]
};
