const sidebarTutorials = [ 
  {
    text: 'Learn ApostropheCMS',
    collapsed: false,
    items: [
      { text: 'Introduction', link: 'tutorials/introduction.md' },
      { text: 'Code Organization', link: 'tutorials/code-organization.md' },
      { text: 'Creating Pages', link: 'tutorials/pages.md' },
      { text: 'Add CSS and JS Assets', link: 'tutorials/assets.md' },
      { text: 'Creating Widgets', link: 'tutorials/widgets.md' },
      { text: 'Creating Pieces', link: 'tutorials/pieces.md' },
      { text: 'Building Navigation', link: 'tutorials/navigation.md' },
      { text: 'Configuring Admin Bar', link: 'tutorials/admin-ui.md' },
      { text: 'Adding Extensions', link: 'tutorials/adding-extensions.md' }
    ]
  },
  {
    text: 'Beyond the Basics',
    collapsed: false,
    items: [
      {
        text: 'From HTML to ApostropheCMS',
        link: 'tutorials/html-conversion.md'
      },
      {
        text: 'Composing custom schema fields from standard fields',
        link: 'tutorials/reusing-standard-fields.md'
      },
      {
        text: 'Building navigation',
        link: 'tutorials/building-navigation.md'
      }
    ]
  },
  {
    icon: 'book',
    text: 'Master Apostrophe with the guide and reference material',
    link: '../',
    style: 'cta'
  }
];

export { sidebarTutorials };
