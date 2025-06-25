---
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

Most popular third-party support desk solutions can be easily integrated with ApostropheCMS. Many create buttons that the users can click to trigger the help desk through a simple script embedded in the head of your site. However, using this approach means that you might have to worry that the end reader of your site has the option to open the help desk, which may not be desired. Adding it as a button to the admin bar means that you can allow just logged-in users to access the support desk. But, this also means that you need to disable the automatic button addition.

Common third-party support desk solutions that work well with ApostropheCMS include Zendesk Support Widget (a comprehensive customer service platform with ticketing and knowledge base), Intercom Chat (a conversational relationship platform with chat-based support), Freshdesk Messaging (customer support software with ticketing and automation), Help Scout Beacon (email-based customer support with a clean interface), and Crisp Live Chat (a lightweight customer messaging platform with chatbot capabilities).

## Integration Approach

We'll look at how to integrate your support desk button by creating a Crisp Live Chat integration. This example demonstrates all the key concepts you'll need for any support desk provider.

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
        icon: 'phone-icon', // Icon for the button
        tooltip: 'supportDesk:supportDesk' // Namespaced tooltip text for translation
      }
    );
  }
};
```
  <template v-slot:caption>
    modules/support-desk/index.js
  </template>
</AposCodeBlock>

Here we are creating a new project-level module named `support-desk`. We don't have an `extend` property, so it will implicitly extend the core `@apostrophecms/module`. Since it is a new project-level module, we also need to register it in the project `app.js` file.

<AposCodeBlock>

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'my-website',
  modules: {
    'support-desk': {},
    // other modules
  }
});
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

In this example we have added the button to the context menu, but you may choose to add it as a main navigation item or the user drop-down menu. See the [reference documentation for other placement options](/reference/modules/admin-bar.html#add-name-label-permission-options).

This single method call is all you need to add the button to the admin bar. The first parameter is a unique identifier that you'll reference in your event handler. The second parameter is the visible label (ideally using a translation string in production). The third parameter controls permissions, where `false` makes it available to all users with admin access. The final parameter is an options object that determines the button's placement and appearance.

### Handling the Button Click Event

Once you've added the support button to the admin bar, you need to create a browser-side component to handle clicks. This is where you'll connect your admin bar button to the API for the Crisp chat widget or other selected support desk.

In your project's UI JavaScript file, add an event listener for the admin bar button click and trigger the Crisp widget:

<AposCodeBlock>

```javascript
export default () => {
  // Only proceed for logged-in users
  if (!apos.user) {
    return;
  }

  // Listen for admin bar button clicks once ApostropheCMS is loaded
  apos.util.onReady(() => {
    apos.bus.$on('admin-menu-click', (item) => {
      // Check if our support desk button was clicked
      if (item === 'support-desk') {
        openCrispChat();
      }
    });
  });

  function openCrispChat() {
    // Call the Crisp API to open the chat widget
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:open']);
      window.$crisp.push(['do', 'chat:show']);

      // Set user information
      if (apos.user) {
        window.$crisp.push(['set', 'user:email', apos.user.email || '']);
        window.$crisp.push(['set', 'user:nickname', apos.user.title || '']);
      }
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

  // Initialize Crisp chat
  initCrispChat();

  function initCrispChat() {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "YOUR_WEBSITE_ID"; // Replace with your actual ID as assigned by Crisp

    // Load Crisp script
    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);

    // Hide default button and handle close events
    window.$crisp.push(['do', 'chat:hide']);
    window.$crisp.push(['on', 'chat:closed', function() {
      window.$crisp.push(['do', 'chat:hide']);
    }]);
  }
};
```
  <template v-slot:caption>
    modules/support-desk/ui/apos/apps/SupportDesk.js
  </template>
</AposCodeBlock>

> [!IMPORTANT]
> Note the location of this script. It should be placed in the `ui/apos/apps` folder of your module so that it has access to the `apos.bus.$on()` method and only loads for logged-in users who need this functionality.

This approach ensures that when a content manager clicks the support button in the admin bar, the third-party support desk widget appears, allowing them to get help without leaving the CMS interface.

> **Note**: For other support desk solutions, you'll need to replace the Crisp-specific API calls (like `window.$crisp.push(['do', 'chat:open'])`) with the appropriate method provided by your support desk solution. Check their developer documentation for the correct method name and parameters.

### Including the Support Desk Script

The Crisp integration above includes the script loading in the `initCrispChat()` method, but you may want to understand the different approaches available for other support desk solutions. This can be done in your layout template or in your UI JavaScript file as we demonstrated above, depending on your preference and the support tool's requirements.

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
    {# Load the support desk script only for logged-in users #}
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

## Hiding the Default Widget Button

Most support desk widgets automatically add their own button to the page. You'll need to hide this default button to avoid duplication with your admin bar integration. This is a crucial step in creating a clean, professional interface that only shows the support option to authenticated users through the admin bar.

This can usually be accomplished in one of two ways:

### Configuration-Based Approach (Preferred)

Most support desk services provide configuration options to hide their default launcher. The Crisp chat widget API provides a workaround through the `chat:hide` and `chat:show`. The exact property names will vary by provider, but the pattern is usually similar:

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