const sidebarTutorials = [ 
  {
    text: 'Master Apostrophe with the guide and reference material &#8594',
    link: '../',
    style: 'cta'
  },
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
        text: 'Composing Custom Fields',
        link: 'tutorials/reusing-standard-fields.md'
      },
      {
        text: 'Navigation Building Techniques',
        link: 'tutorials/building-navigation.md'
      },
      {
        text: 'Creating Custom Rich Text Extensions',
        link: 'tutorials/rich-text-extensions.md'
      }
    ]
  }
];

export { sidebarTutorials };
