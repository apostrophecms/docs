---
title: "Adding Confirmation Dialogs to ApostropheCMS User Actions"
detailHeading: "Tutorial"
url: "/tutorials/adding-confirmation-dialogs.html"
content: "Learn how to implement user-friendly confirmation dialogs in ApostropheCMS to prevent accidental actions and improve the content management experience."
tags:
  topic: "Admin UI"
  type: tutorial
  effort: beginner
---
# Adding Confirmation Dialogs to ApostropheCMS User Actions

## Why This Matters

Confirmation dialogs play a crucial role in preventing accidental actions that could lead to data loss or workflow disruptions. By implementing thoughtful confirmation prompts before potentially destructive or significant actions, you improve user confidence and reduce errors. This is especially important in a CMS environment where content managers work with valuable content daily.

## Understanding Confirmation Dialogs in ApostropheCMS

ApostropheCMS provides a built-in confirmation system that handles accessibility concerns, maintains UI consistency, and provides a promise-based API for easy integration with your custom functionality.

## Basic Implementation

### Simple Confirmation Dialog

The core method for creating confirmation dialogs is `apos.confirm()`, which presents a modal dialog and returns a promise that resolves when the user confirms or rejects when they cancel.

<AposCodeBlock>

```javascript
export default () => {
  apos.util.onReady(() => {
    // Your code that needs a confirmation dialog
    async function performActionWithConfirmation() {
      try {
        // Show confirmation dialog and wait for user response
        await apos.confirm({
          heading: 'myproject:confirmActionHeading',
          description: 'myproject:confirmActionDescription',
          affirmativeLabel: 'myproject:proceed',
          negativeLabel: 'myproject:cancel'
        });
        
        // This code only runs if the user confirms
        console.log('User confirmed, proceeding with action');
        // Perform your action here
        
      } catch (error) {
        // This code runs if the user cancels
        console.log('User cancelled the action');
        // Handle cancellation or do nothing
      }
    }
    
    // Call your function when needed
    // performActionWithConfirmation();
  });
};
```
  <template v-slot:caption>
    modules/your-module/ui/apos/apps/your-component.js
  </template>
</AposCodeBlock>

### Configuration Options

The `apos.confirm()` method accepts an options object with these properties:

- `heading` (String): The dialog title (use namespaced translation labels like `'myproject:headingText'`)
- `description` (String): The main message text (use namespaced translation labels)
- `affirmativeLabel` (String): Text for the confirmation button (use namespaced translation labels)
- `negativeLabel` (String): Text for the cancel button (use namespaced translation labels)
- `icon` (Boolean): Whether to show the default warning icon (defaults to true)

> [!IMPORTANT]
> For all user-facing text in the admin interface, always use translation strings with a custom namespace prefix (like `myproject:`). This ensures your CMS can be properly internationalized and maintains consistency. Never use the `apostrophe:` namespace for your custom strings, as this could conflict with existing or future core translations.

### Important Implementation Notes

1. Always use `apos.util.onReady()` to ensure ApostropheCMS is fully initialized before attempting to use `apos.confirm()`
2. Always use try/catch to properly handle user cancellation
3. Place your confirmation dialogs in the appropriate UI folder for admin functionality (typically `ui/apos/apps/`)

## Real-World Examples

### Example 1: Confirming Before Opening External URLs

When adding buttons to the admin bar that open external URLs, you should confirm before navigating away from the CMS. This builds upon the approach covered in our [URL-opening tutorial](/tutorials/opening-url-from-admin-bar.html):

<AposCodeBlock>

```javascript
export default () => {
  apos.util.onReady(() => {
    apos.bus.$on('admin-menu-click', async (item) => {
      // Check if our external resource button was clicked
      if (item === 'external-resource') {
        try {
          // Confirm before navigating away from the CMS
          await apos.confirm({
            heading: 'myproject:openExternalDocsHeading',
            description: 'myproject:openExternalDocsDescription',
            affirmativeLabel: 'myproject:openDocs',
            negativeLabel: 'myproject:stayHere'
          });
          
          // Only open the URL if the user confirms
          openExternalURL();
        } catch (error) {
          // User cancelled, do nothing
        }
      }
    });
  });
  
  // See the URL-opening tutorial for the full implementation
  function openExternalURL() {
    // Implementation details in the URL-opening tutorial
    window.open('https://docs.apostrophecms.org', '_blank', 'noopener,noreferrer');
  }
};
```
  <template v-slot:caption>
    modules/external-links/ui/apos/apps/index.js
  </template>
</AposCodeBlock>

### Example 2: Confirming Before Destructive Actions

When implementing custom functionality that deletes or modifies content, always confirm:

<AposCodeBlock>

```javascript
export default () => {
  apos.util.onReady(() => {
    // Example function for a custom bulk action
    async function archiveSelectedItems(items) {
      try {
        // Provide specific information about the action
        await apos.confirm({
          heading: 'myproject:archiveItemsHeading',
          description: `myproject:archiveItemsDescription|${items.length}`,  // Using a translation with parameter
          affirmativeLabel: 'myproject:archiveItems',
          negativeLabel: 'myproject:cancel'
        });
        
        // Proceed with archiving - implementation would go here
        
      } catch (error) {
        // User cancelled, do nothing
      }
    }
    
    // Attach to your UI as needed
  });
};
```
  <template v-slot:caption>
    modules/custom-archive/ui/apos/apps/bulk-actions.js
  </template>
</AposCodeBlock>

## Custom Dialog Appearance

### Removing the Warning Icon

For non-destructive confirmations, you may want to remove the warning icon:

```javascript
await apos.confirm({
  heading: 'myproject:applyTemplateHeading',
  description: 'myproject:applyTemplateDescription',
  affirmativeLabel: 'myproject:apply',
  negativeLabel: 'myproject:cancel',
  icon: false  // Removes the warning icon
});
```

### Writing Effective Button Labels

Ensure your translation strings for button labels clearly indicate the action:

```javascript
await apos.confirm({
  heading: 'myproject:deleteContentHeading',
  description: 'myproject:deleteContentDescription',
  affirmativeLabel: 'myproject:confirmDelete',  // Should translate to a clear, specific label
  negativeLabel: 'myproject:keepContent'        // Should translate to an explicit alternative
});
```

## Best Practices

### When to Use Confirmation Dialogs

Use confirmation dialogs for:
- Actions that cannot be easily undone (deletions, publishing)
- Actions that navigate away from unsaved work
- Actions that might disrupt the user's workflow (opening external sites)
- Bulk operations affecting multiple items

### When NOT to Use Confirmation Dialogs

Avoid confirmation dialogs for:
- Actions that are already expected (clicking "Save")
- Actions that have no significant consequences
- Actions that can be easily undone
- Every single action (dialog fatigue)

### Writing Effective Confirmation Messages

For maximum clarity and usability:
1. Use specific headings that name the action
2. Clearly describe consequences in the description
3. Use action verbs in button labels that clearly indicate what will happen
4. Provide enough information for the user to make an informed decision

### Accessibility Considerations

ApostropheCMS's built-in confirmation dialogs handle most accessibility concerns, but keep these points in mind:
- Keep messages concise and clear
- Ensure button labels accurately describe the action
- Test with keyboard navigation

## Conclusion

Confirmation dialogs are a simple but powerful way to prevent user errors and improve the content management experience in ApostropheCMS. By implementing them thoughtfully and following the best practices outlined above, you can create a more robust and user-friendly CMS interface.

---

**Related Resources:**
- [ApostropheCMS 4.x UI Components Documentation](/reference/modules/ui.md)
- [Adding a URL-Opening Button to the Admin Bar](/tutorials/opening-url-from-admin-bar.html)
- [Best Practices for Admin Bar Setup](/tutorials/snippet/admin-bar-best-practices.html)
- [Integrating a Third-Party Support Desk](/tutorials/adding-a-support-desk-button.html)