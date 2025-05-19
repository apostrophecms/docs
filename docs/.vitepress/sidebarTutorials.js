const sidebarTutorials = [
  {
    text: 'Tutorials Home',
    link: '/tutorials/',
    icon: 'home',
    customClass: 'reduce-bottom-margin'
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
        collapsed: false,
        link: 'tutorials/introduction-to-rich-text-extensions.md',
        items: [
          {
            text: 'Using Tiptap Extensions',
            link: 'tutorials/using-tiptap-extensions.md'
          },
          {
            text: 'Creating a Text Replacement Extension',
            link: 'tutorials/creating-a-text-replacement-extension.md'
          },
          {
            text: 'Toolbar and Insert Menu Extensions',
            link: 'tutorials/rich-text-extension-deep-dive.md'
          }
        ]
      },
      {
        text: 'Harnessing Dynamic Routing in ApostropheCMS',
        link: 'tutorials/dynamic-routing.md'
      },
      {
        text: 'Using JSX to Build a Weather Widget in ApostropheCMS',
        link: 'tutorials/using-jsx-in-apostrophe.md'
      }
    ]
  },
  {
    text: 'Astro Topics',
    collapsed: false,
    items: [
      {
        text: 'ApostropheCMS + Astro',
        link: 'tutorials/astro/apostrophecms-and-astro.md'
      },
      {
        text: 'Introducing Apollo',
        link: 'tutorials/astro/introducing-apollo.md'
      },
      {
        text: 'Creating Pages',
        link: 'tutorials/astro/creating-pages.md'
      },
      {
        text: 'Creating Widgets',
        link: 'tutorials/astro/creating-widgets.md'
      },
      {
        text: 'Creating Pieces',
        link: 'tutorials/astro/creating-pieces.md'
      },
      {
        text: 'Deploying an ApostropheCMS-Astro project',
        link: 'tutorials/astro/deploying-hybrid-projects.md'
      }
    ]
  },
  {
    text: 'Pro topics',
    collapsed: false,
    items: [
      {
        text: 'Setting up Advanced Permissions',
        link: 'tutorials/setting-up-the-advanced-permission-pro-extension.md'
      }
    ]
  },
  {
    text: 'Ecomm test',
    link: 'e-comm/introduction.md'
  },
  {
    text: 'Return to the guide &#8594',
    link: '/',
    icon: 'book-marked',
    style: 'cta'
  }
];

export { sidebarTutorials };
