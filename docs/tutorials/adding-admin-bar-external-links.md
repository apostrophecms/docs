---
title: "Adding External Link Buttons to the ApostropheCMS Admin Bar"
detailHeading: "Tutorial"
url: "/tutorials/adding-admin-bar-external-links.html"
content: "Learn how to add a custom button to the ApostropheCMS admin bar that opens an external URL, giving content editors quick access to external resources without leaving the CMS interface."
tags:
  topic: "Admin UI"
  type: tutorial
  effort: beginner
---
# Adding External Link Buttons to the ApostropheCMS Admin Bar

## Why This Matters

Content editors often need quick access to external resources like style guides, analytics dashboards, or a company intranet while working in the CMS. By adding a custom button to the ApostropheCMS admin bar that opens external URLs, you create a seamless workflow that keeps essential tools just one click away, improving efficiency and reducing context switching.

## When to Use This Approach

This pattern works best for:
- Documentation sites or style guides
- Analytics dashboards
- Company intranets or wikis
- Support ticket systems
- Any frequently-accessed external tool that complements content creation

For tools that need to pass data from the CMS or deeply integrate with ApostropheCMS workflows, consider building custom modules instead.

## Integration Approach

Adding a URL-opening button to the admin bar requires two main components:
1. Server-side configuration to add the button to the admin bar
2. Browser-side code to handle the button click and open the URL

### Adding the Button to the Admin Bar

In ApostropheCMS, you can add a custom button to the admin bar from the `init` method of any module.

<AposCodeBlock>

```javascript
export default {
  init(self) {
    // Add URL-opening button to the admin bar
    self.apos.adminBar.add(
      'external-resource',        // Unique identifier
      'Documentation',            // Button label
      false,                      // Available to all users with admin access
      {
        // This options object controls button placement
        contextUtility: true,     // Places button in the right side utility area
        icon: 'book-open',        // Icon for the button
        tooltip: 'myProject:openDocs' // Namespaced tooltip text for translation
      }
    );
  },
  icons: {
    'book-open': 'BookOpen'
  }
};
```
  <template v-slot:caption>
    modules/external-links/index.js
  </template>
</AposCodeBlock>

> [!NOTE]
> The `tooltip` property uses a namespaced localization key (`myProject:openDocs`) to support multiple languages in the admin UI. To set up translations for admin interface elements like tooltips, button labels, and schema field labels, see the guide on [localizing schema field labels](/guide/localization/static.html#localizing-schema-field-labels).
 
> [!TIP]
> The `book-open` icon isn't already registered as an ApostropheCMS icon, but is in the version of the [vue-material-design-icons](https://gist.github.com/BoDonkey/a28419ed8954b57931f80061e5e6a3dd) that is present in core. You can register the new icon using the top-level `icons` configuration property. To do so, you pass the name you want to use, in this case `book-open`, as a key and the icon name in the package as value. You can read more [here](/reference/module-api/module-overview.md#icons).

This method call registers a new button in the admin bar. The parameters are:

1. A unique identifier that you'll reference in your event handler
2. The visible label (ideally using a translation string in production)
3. Permissions control (where `false` makes it available to all admin users)
4. Options object determining placement and appearance

### Button Placement Options

You have several options for where to place your URL-opening button:

- **Context Utility Area** (shown above): Place the button on the right side of the admin bar alongside other utility tools by setting `contextUtility: true`
- **Main Menu**: Place the button main navigation by omitting the options object
- **User Menu**: Place the button in the user dropdown menu by setting `user: true` in the options object

Choose the placement based on the importance and frequency of use. Context utility is best for frequently used external tools, while the user menu might be better for less common resources.

### Handling the Button Click Event

Once you've added the button to the admin bar, you need to create a browser-side component to handle clicks. This is where you'll open the external URL.

<AposCodeBlock>

```javascript
export default () => {
  // Use apos.util.onReady to ensure ApostropheCMS is fully initialized
  apos.util.onReady(() => {
    // Check if bus is available 
    if (!apos.bus || !apos.bus.$on) {
      console.error('Event bus not available, cannot register handler');
      return;
    }

    // Now listen for admin bar button clicks
    apos.bus.$on('admin-menu-click', (item) => {
      // Check if our custom external resource button was clicked
      if (item === 'external-resource') {
        openExternalURL();
      }
    });
  });

  function openExternalURL() {
    // Create an accessible link element with appropriate attributes
    const link = document.createElement('a');
    link.href = 'https://docs.apostrophecms.org';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Opening documentation in a new tab');
    // Briefly add to the DOM and trigger the click programmatically
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
```
  <template v-slot:caption>
    modules/external-links/ui/apos/apps/index.js
  </template>
</AposCodeBlock>

> [!IMPORTANT]
> Make sure to add this to the `ui/apos/apps/` folder, or import it into a file located there. If you try to load this code by adding it to `ui/src` you will get an error in the console because the admin functions won't be available, yet.
> 
> **Why this path matters**: The `ui/apos/apps/` directory ensures your code loads in the admin interface context where `apos.bus` and other admin APIs are available. Code in `ui/src/` loads in the public site context where these APIs don't exist.

This code uses `apos.util.onReady` to ensure our event listener is only registered after ApostropheCMS is fully initialized. It then listens to the `apos.bus` for the admin-bar to emit the `admin-menu-click` event, that will also provide our button name. If it was our button that was clicked a link is added to the page and then triggered. This ensures that screen readers are signalled that we are navigating to a new page.

## Conclusion

Adding external link buttons to the ApostropheCMS admin bar provides content editors with quick access to external resources without requiring complex custom modules. By leveraging the `apos.adminBar.add()` method and browser-side event handling, you can create a seamless integration between your CMS and external tools.

For more complex integrations with external services, consider exploring deeper integration patterns that leverage the ApostropheCMS REST API or custom modules.

---

**Related Resources:**
- [ApostropheCMS 4.x Admin-bar Module Documentation](/reference/modules/admin-bar.md)
- [Integrating a Third-Party Support Desk](/tutorials/adding-a-support-desk-button.html)