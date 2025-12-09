const sidebarTutorials = [
  {
    text: 'Tutorials Home',
    link: '/tutorials/',
    icon: 'home',
    customClass: 'reduce-bottom-margin'
  },
  {
    text: 'Intro to ApostropheCMS',
    collapsed: 'fixed',
    link: 'tutorials/introduction.md',
    items: [
      { text: 'Organizing Your Code', link: 'tutorials/code-organization.md' },
      { text: 'Creating Pages', link: 'tutorials/pages.md' },
      { text: 'Adding CSS and JS Assets', link: 'tutorials/assets.md' },
      { text: 'Creating Widgets', link: 'tutorials/widgets.md' },
      { text: 'Creating Pieces', link: 'tutorials/pieces.md' },
      { text: 'Building Navigation', link: 'tutorials/navigation.md' },
      { text: 'Configuring the Admin Bar', link: 'tutorials/admin-ui.md' },
      { text: 'Adding Extensions', link: 'tutorials/adding-extensions.md' }
    ]
  },
  {
    text: 'ApostropheCMS & Astro',
    collapsed: 'fixed',
    link: 'tutorials/astro/apostrophecms-and-astro.md',
    items: [
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
        text: 'Deploying With Astro',
        link: 'tutorials/astro/deploying-hybrid-projects.md'
      }
    ]
  },
  {
    text: 'Recipes',
    collapsed: 'fixed',
    link: 'tutorials/recipes.md',
    items: [
      {
        text: 'Customizing Rich Text',
        collapsed: 'true',
        link: 'tutorials/introduction-to-rich-text-extensions.md',
        items: [
          {
            text: 'Installing Extensions',
            link: 'tutorials/using-tiptap-extensions.md'
          },
          {
            text: 'Creating an Extension',
            link: 'tutorials/creating-a-text-replacement-extension.md'
          },
          {
            text: 'Extending the Toolbar',
            link: 'tutorials/rich-text-extension-deep-dive.md'
          }
        ]
      },
      {
        text: 'Adding a support desk button',
        link: 'tutorials/adding-a-support-desk-button.md'
      },

      {
        text: 'Adding an Admin Bar External Link',
        link: 'tutorials/adding-admin-bar-external-links.md'
      },
      {
        text: 'Admir Bar Best Practices',
        link: 'tutorials/admin-bar-best-practices.md'
      },
      {
        text: 'Building Navigation',
        link: 'tutorials/building-navigation.md'
      },
      {
        text: 'Harnessing Dynamic Routing',
        link: 'tutorials/dynamic-routing.md'
      },
      {
        text: 'Creating Better Help Text',
        link: 'tutorials/help-and-placeholder-text-best-practices.md'
      },
      {
        text: 'Converting a Static Template',
        link: 'tutorials/html-conversion.md'
      },
      {
        text: 'Managing Brand Colors',
        link: 'tutorials/managing-brand-colors.md'
      },
      {
        text: 'Responsive Widget Visibility',
        link: '/tutorials/responsive-widget-visibility.md'
      },
      {
        text: 'Composing Custom Fields',
        link: 'tutorials/reusing-standard-fields.md'
      },
      {
        text: 'Building a JSX Widget',
        link: 'tutorials/using-jsx-in-apostrophe.md'
      },
      {
        text: 'Local Extension Development',
        link: 'tutorials/local-extension-development.md'
      },
      {
        text: 'Creating Command Line Tasks',
        link: 'tutorials/creating-command-line-tasks.md'
      }
    ]
  },
  {
    text: 'Pro Topics',
    collapsed: 'fixed',
    link: 'tutorials/pro.md',
    items: [
      {
        text: 'Using Advanced Permissions',
        link: 'tutorials/setting-up-the-advanced-permission-pro-extension.md'
      },
      {
        text: 'Passing Site Data in Multisite',
        link: '/tutorials/passing-site-data-in-multisite.md'
      }
    ]
  },
  {
    text: 'Return to the guide &#8594',
    link: '/',
    icon: 'book-marked',
    style: 'cta'
  }
];

export { sidebarTutorials };
