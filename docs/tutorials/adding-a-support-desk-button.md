---
next: false
prev: false
title: "Integrating a Third-Party Support Desk into ApostropheCMS Admin Bar"
detailHeading: "Tutorial"
url: "/tutorials/adding-a-support-desk-button.html"
content: "Learn how to add a support desk button to the ApostropheCMS admin bar, giving content editors easy access to help without leaving the CMS interface."
tags:
  topic: "Admin UI"
  type: tutorial
  effort: beginner
---
# Integrating a Third-Party Support Desk into ApostropheCMS Admin Bar

## Why This Matters

Customer support is a critical part of any website management experience. By integrating a support desk directly into the ApostropheCMS admin bar, you make it easy for content managers to get help without leaving their workflow. This integration reduces friction, improves the user experience, and ultimately leads to faster issue resolution and higher satisfaction.

## Understanding Third-Party Support Desk Options

Most popular third-party support desk solutions can be easily integrated with ApostropheCMS. Many create buttons that the users can click to trigger the help desk through a simple script embedded in the head of your site. However, using this approach means that you might have to worry that the end reader of your site has the option to open the help desk, which may not be desired. Adding it as a button to the admin-bar means that you can allow just logged-in users to access the support desk. But, this also means that you need to disable the automatic button addition.

Common third-party support desk solutions that work well with ApostropheCMS include Zendesk Support Widget (a comprehensive customer service platform with ticketing and knowledge base), Intercom Chat (a conversational relationship platform with chat-based support), Freshdesk Messaging (customer support software with ticketing and automation), Help Scout Beacon (email-based customer support with a clean interface), and Crisp Live Chat (a lightweight customer messaging platform with chatbot capabilities).

## Integration Approach

### Adding the Support Button to the Admin Bar

In ApostropheCMS, you can add a support desk button to the admin bar from the `init` method of any module.

The code is straightforward, using the `self.apos.adminBar.add()` method to register the new button:

<AposCodeBlock>

```javascript
export default {
  init(self) {
    // Add support desk button to the admin bar
    self.apos.adminBar.add(
      'support-desk',           // Unique identifier
      'Get Support',            // Button label
      false,                    // Available to all users with admin access
      {
        contextUtility: true,   // Places button in the right side utility area
        icon: 'question-circle', // Icon for the button
        tooltip: 'myProject:supportDesk' // Namespaced tooltip text for translation
      }
    );
  }
};
```
  <template v-slot:caption>
    modules/asset/index.js
  </template>
</AposCodeBlock>

In this example we have added the button to the context menu, but you may choose to add it as a main navigation item or the user drop-down menu. See the [reference documentation for other placement options](/reference/modules/admin-bar.html#add-name-label-permission-options).

This single method call is all you need to add the button to the admin bar. The first parameter is a unique identifier that you'll reference in your event handler. The second parameter is the visible label (ideally using a translation string in production). The third parameter controls permissions, where `false` makes it available to all users with admin access. The final parameter is an options object that determines the button's placement and appearance.

### Handling the Button Click Event

Once you've added the support button to the admin bar, you need to create a browser-side component to handle clicks. This is where you'll connect your admin bar button to the third-party support desk widget's API.

In your project's UI JavaScript file, add an event listener for the admin bar button click and trigger the appropriate support widget:

<AposCodeBlock>

```javascript
export default () => {
  // Listen for admin bar button clicks once ApostropheCMS is loaded
  apos.bus.$on('ready', () => {
    apos.bus.$on('admin-menu-click', (item) => {
      // Check if our support desk button was clicked
      if (item === 'support-desk') {
        openSupportWidget();
      }
    });
  });

  function openSupportWidget() {
    // Call the appropriate API based on which support desk you're using
    // The exact method will vary by provider - check their documentation

    // For most widget-based help desks
    if (window.supportWidget) {
      window.supportWidget.open();
    }

    // Add an announcement for screen readers (accessibility improvement)
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = 'Support desk is now open';
    document.body.appendChild(announcement);

    // Remove after announcement is read
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 3000);
  }
};
```
  <template v-slot:caption>
    modules/asset/ui/src/index.js
  </template>
</AposCodeBlock>

This approach ensures that when a content manager clicks the support button in the admin bar, the third-party support desk widget appears, allowing them to get help without leaving the CMS interface.

> **Note**: You'll need to replace `window.supportWidget.open()` with the actual method provided by your support desk solution. Check their developer documentation for the correct method name and parameters.

### Including the Support Desk Script

You'll need to add the initialization code for your chosen support desk solution. This can be done in your layout template or in your UI JavaScript file, depending on your preference and the support tool's requirements.

#### General Pattern

Regardless of which support desk solution you use, the implementation typically follows this pattern:

1. Only load the support desk for authenticated users
2. Include the vendor's JavaScript
3. Configure the widget to hide the default launcher
4. Pass user information when available

#### Template-Based Implementation

This approach works well for simpler implementations:

<AposCodeBlock>

```nunjucks
{% block extraBody %}
  {{ super() }}

  {% if data.user %}
    {# Load the support desk script only for authenticated users #}
    <script src="https://cdn.example.com/support-desk.js?key=YOUR_API_KEY" async></script>
    <script>
      // Configure your support desk
      // This example is generic - check your provider's documentation for specifics
      window.supportDeskConfig = {
        // Common configurations:
        hideLauncher: true,
        user: {
          name: '{{ data.user.title }}',
          email: '{{ data.user.email }}'
        }
      };
    </script>
  {% endif %}
{% endblock %}
```
  <template v-slot:caption>
    views/layout.html
  </template>
</AposCodeBlock>

#### JavaScript-Based Implementation

For more control, you can load the script programmatically:

<AposCodeBlock>

```javascript
export default () => {
  // Only initialize for authenticated users
  if (!apos.user) {
    return;
  }

  // Configure your support desk with user information
  // The property names will vary based on your support desk provider
  window.supportDeskConfig = {
    apiKey: 'YOUR_API_KEY',
    hideLauncher: true,
    user: {
      name: apos.user.title || '',
      email: apos.user.email || ''
    }
  };

  // Load the support desk script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://cdn.example.com/support-desk.js';
  document.head.appendChild(script);
};
```
  <template v-slot:caption>
    modules/asset/ui/src/index.js
  </template>
</AposCodeBlock>

This conditional loading approach ensures the support desk is only available to authenticated CMS users, not to your website visitors.

> **Note**: Replace the example URLs, configuration object names, and properties with the specifics from your chosen support desk provider's documentation. Pay attention to API key exposure and whether there are both private and public API keys. Each provider will have slightly different implementation requirements.

## Hiding the Default Widget Button

Most support desk widgets automatically add their own button to the page. You'll need to hide this default button to avoid duplication with your admin bar integration. This is a crucial step in creating a clean, professional interface that only shows the support option to authenticated users through the admin bar.

This can usually be accomplished in one of two ways:

### Configuration-Based Approach (Preferred)

Most support desk services provide configuration options to hide their default launcher. The exact property names will vary by provider, but the pattern is usually similar:

```javascript
// Generic example - refer to your provider's documentation
window.supportDeskConfig = {
  // Common configuration names for hiding the default launcher
  hideLauncher: true,
  // OR
  hideDefaultLauncher: true,
  // OR
  launcher: {
    visible: false
  }
};
```

### CSS-Based Approach (Fallback)

If configuration doesn't work, you can use CSS as a fallback. You'll need to inspect the page to find the specific CSS selector for your support desk's button:

```css
/* Generic example - you'll need to find the actual selector */
.support-widget-launcher {
  display: none !important;
}
```

Check your support desk provider's documentation for specific guidance on hiding the default launcher through configuration or CSS.

## Conclusion

Integrating a third-party support desk into the ApostropheCMS admin bar provides an immediate help channel for your content managers without creating a custom module. By leveraging the `apos.adminBar.add()` method and the third-party widget's JavaScript API, you can create a seamless support experience that feels like a natural part of the CMS.

---

**Related Resources:**
- [ApostropheCMS Admin-bar Module Documentation](/reference/modules/admin-bar.md)
- [Best Practices for Admin Bar Setup](/tutorials/snippet/admin-bar-best-practices.html)