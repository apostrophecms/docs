# Best Practices for Admin Bar Setup in ApostropheCMS 4.x

## Why This Matters & Core Principles

The admin bar is the primary navigation tool content managers use daily. A thoughtfully configured admin bar reduces friction in content workflows, decreases training time, and increases overall satisfaction with the CMS. Remember: developers configure the site once, but content managers use it every day.

When configuring your admin bar, prioritize:
- **Content managers first**: Organize for their workflows, not technical structure
- **Consistency**: Maintain predictable patterns aligned with core ApostropheCMS experiences
- **Clarity**: Use clear labels and intuitive groupings
- **Efficiency**: Minimize clicks needed to accomplish common tasks

<!-- VIDEO: Admin Bar Overview Tutorial -->

## Understanding the Admin Bar Components

![The basic ApostropheCMS admin-bar with markup](../../images/admin-bar-base-markup.png)

The ApostropheCMS admin bar consists of four key components:
1.  **Main menu items**: Primary navigation links in the left section
    * Pages menu (always present)
    * Piece-type modules (each registered piece type gets its own menu item by default)
2. **Quick create menu**: The "+" button providing shortcuts to create new content
3. **Utility context items**: Right-side icons for universal tools 
4. **User preferences**: Profile menu for account settings and personalization

Each component can be customized to better serve your editors' needs.

## Configuration Best Practices

### Logical Grouping & Naming

Configure your admin bar to group related functionality together. For example: content creation tools, publishing workflow tools, and support tools. Make sure to use clear, action-oriented labels. Maintain consistent naming patterns across modules and avoid technical jargon in menu labels visible to content managers.

<AposCodeBlock>

```javascript
export default {
  options: {
    // Customize the admin bar groups and their ordering
    groups: [
      {
        // Prioritize content creation - the most common task
        name: 'content',
        label: 'Content Creation', // User-friendly label
        items: [
          'pages',
          'articles',
          'media'
        ]
      },
      {
        // Group workflow items together for logical task completion
        name: 'workflow',
        label: 'Publishing Tools', // Clear, action-oriented label
        items: [
          'submissions',
          'scheduled'
        ]
      },
      {
        // Make help prominent and accessible
        name: 'help',
        label: 'Get Help', // Action-oriented label
        items: [
          'docs',
          'support'
        ]
      }
    ]
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/admin-bar/index.js
  </template>
</AposCodeBlock>

### Menu Priority and Organization

ApostropheCMS provides three ways to control item order:

1. **Global ordering with `order` option:**
    <AposCodeBlock>

      ```javascript
      export default {
        options: {
          // Items appear in the exact order specified here
          order: ['@apostrophecms/page', '@apostrophecms/global', 'article']
        }
      };
      ```
      <template v-slot:caption>
        modules/@apostrophecms/admin-bar/index.js
      </template>
    </AposCodeBlock>

2. **Relative positioning with `after` option:**
    ```javascript
    // When adding an item, specify what it should come after
    self.apos.adminBar.add('custom-item', 'My Custom Item',
      { action: 'edit', type: '@apostrophecms/page' },
      { after: 'article' }  // Places this item right after the article menu
    );
    ```

3. **Sending items to the end with `last` option:**
    ```javascript
    // When adding an item that should appear at the end
    self.apos.adminBar.add('infrequent-item', 'Rarely Used',
      { action: 'edit', type: '@apostrophecms/page' },
      { last: true }  // This item will be pushed to the end of the menu
    );
    ```

**How Grouped and Ungrouped Items Work Together:**

When mixing groups of items and ungrouped menu items, the system:
1. Positions all items first (based on `order`, `last`, or initialization order)
2. Then ensures grouped items stay together, with their position determined by their first item

<AposCodeBlock>

```javascript
// Group position is determined by its first item's position
export default {
  options: {
    order: ['@apostrophecms/page', 'content-group-leader'], // The entire content group will follow the page menu
    groups: [
      {
        name: 'content',
        label: 'Content',
        items: ['content-group-leader', 'articles', 'events'] // These stay together
      }
    ]
  }
};
```
  <template v-slot:caption>
        modules/@apostrophecms/admin-bar/index.js
  </template>
</AposCodeBlock>

> [!TIP]
> Place frequently-used items at the beginning of the admin bar for quick access.

## Managing the Quick Create Menu

The Quick Create menu (the "+" icon) should only contain frequently created content types. Remove items to streamline the experience:

```javascript
// in modules/article/index.js
export default {
  options: {
    // Prevent this content type from appearing in the quick create menu
    quickCreate: false
  }
};
```

**When to remove items:**
- Rarely created content types
- Specialized content for specific roles only (even if only selected roles can create a specific piece-type, the menu shouldn't be over-cluttered)
- When you have many piece types and need to reduce options
- Content types requiring careful setup that should use the full creation form

## Customizing the Context Utility Menu

Add custom utilities to the right side of the admin bar from the `init` method of any module:

```javascript
export default {
  init(self) {
    // Add item to the context utility menu (right side of admin bar)
    self.apos.adminBar.add(
      'custom-support:help', // Unique name
      'Get Support',         // Label
      false,                 // Permissions (false = available to all)
      {
        contextUtility: true,  // This makes it appear in the right side
        icon: 'question-circle', // Icon to display
        href: '/support'      // URL to navigate to on click
      }
    );
  }
};
```

**Best uses for context utilities:**
- Universal features needed from any context
- Support tools that should never be more than one click away
- Project-specific tools that don't fit the standard content workflow

## Customizing the User Preferences Menu

Give content managers control over their experience through customized preferences:

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    subforms: {
      themePreference: {
        label: 'UI Theme',
        fields: ['theme'],
        reload: true // Refreshes the page when this setting changes
      },
      textSize: {
        label: 'Text Size',
        fields: ['textScale'],
        reload: true // UI needs to refresh to apply new text size
      },
      notifications: {
        label: 'Notifications',
        fields: ['notificationLevel']
      },
      adminLocale: {
        fields: ['adminLocale'] // Requires adminLocales in i18n module
      }
    },
    groups: {
      accessibility: {
        label: 'Accessibility',
        subforms: ['themePreference', 'textSize']
      },
      preferences: {
        label: 'Preferences',
        subforms: ['notifications', 'adminLocale']
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/settings/index.js
  </template>
</AposCodeBlock>

> [!NOTE]
> You can read more about configuring this menu in the [main documentation](/reference/modules/settings.md). You must add any custom fields (like `theme`, `textScale`, and `notificationLevel`) to the `@apostrophecms/user` module schema. For language preferences, configure the `adminLocales` option in the `@apostrophecms/i18n` module. The `reload: true` property is particularly useful for settings that need to take effect immediately, causing the page to refresh when the setting is changed.

## Controlling Menu Visibility

Hide modules from the admin bar to reduce clutter and focus attention:

**Why remove modules:**
- Creates a cleaner interface focused on what editors actually need
- Reduces cognitive load and training time
- Prevents confusion between similar content types
- Keeps specialized modules from cluttering navigation

Real-world example: If you have multiple tag types in your project (e.g., product tags, blog tags, event tags), you might consider:

* Placing them all in a single "Tags" group in the admin bar
* Removing them from the admin bar entirely if they're only used within relationship fields when editing other content (they can be created and edited from the relationship manager)
* Keeping only the most frequently edited tag types visible

This approach prevents your admin bar from becoming cluttered with rarely-accessed supporting content types while maintaining an efficient workflow for content editors.

**Implementation example:**
```javascript
// Correct implementation for removing a module from the admin bar
// in modules/article/index.js
export default {
  methods(self) {
    return {
      // Empty method prevents this module from appearing in the admin bar
      addToAdminBar() {
        return;
      }
    };
  }
};
```

For some modules, you might want custom behavior instead of hiding completely. An example of this is in the `@apostrophecms/submitted-draft` module:

```javascript
addToAdminBar() {
  self.apos.adminBar.add(
    `${self.__meta.name}:manager`,
    self.pluralLabel,
    {
      action: 'edit',
      type: self.name
    },
    {
      component: 'AposSubmittedDraftIcon',
      contextUtility: true,
      tooltip: 'apostrophe:submittedDrafts'
    }
  );
}
```

## Conclusion

A thoughtfully configured admin bar is fundamental to a positive content management experience. By focusing on content managers' actual workflows, you create an environment where they can work efficiently and confidently. Small UX improvements in frequently used interfaces like the admin bar can significantly impact overall satisfaction with your CMS implementation.

---

**Related Resources:**
- [ApostropheCMS 4.x Admin-bar Module Documentation](/reference/modules/admin-bar.md)
- [ApostropheCMS Settings Module Documentation](/reference/modules/settings.md)
- [How to Integrate a Support Desk into Admin Bar](link-to-support-desk-doc)
- [Admin-bar Customization in Our Tutorial Project](/tutorials/admin-ui.md)