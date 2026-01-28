---
extends: '@apostrophecms/module'
---

# `@apostrophecms/ui`

 The `@apostrophecms/ui` module provides the components and mixins for creating the admin UI seen by logged-in users with editing privileges. It also provides the UI styling with some built-in theming capabilities that can be leveraged to create a custom admin experience. This module has no impact on the experience of ordinary logged-out site visitors.

## Options

|  Property | Type | Description |
|---|---|---|
| `widgetMargin` | String | CSS margin value for widget spacing, default is `'20px 0'` |

### `widgetMargin`
This option sets the padding on nested areas and only impacts what a logged-in user with editing privileges will see. It has no impact on the CSS for logged-out users or users without editing privileges.

## Core Components

The `@apostrophecms/ui` module provides the following key UI components:

### Basic UI Components
- **AposButton** - Button component with various styles and states
- **AposCheckbox** - Checkbox input component
- **AposSelect** - Dropdown select component
- **AposToggle** - Toggle switch component
- **AposIndicator** - Icon display component
- **AposSpinner** / **AposLoading** - Loading indicators

### Layout Components
- **AposTable** - Table for displaying data
- **AposTree** - Hierarchical tree display
- **AposSlatList** - List component for "slats" (item cards)
- **AposContextMenu** - Context menu for dropdown actions
- **AposPager** - Pagination component

### Interaction Components
- **AposFile** - File upload component
- **AposLocalePicker** - Locale selection component
- **AposTagList** / **AposTag** - Tag management components

## Admin UI Customization

The `@apostrophecms/ui` module provides the foundation for customizing the admin interface. For complete guidance on customizing the admin UI, refer to the [Customizing the User Interface](/guide/custom-ui.md) guide.

Common customization options include:

- [**Overriding standard components**](/guide/custom-ui.html#overriding-standard-vue-js-components-by-name-in-apostrophecms) by placing files with the same name in project modules
- [**Adding custom field types**](/guide/custom-ui.html#registering-custom-field-types) to extend schema capabilities
- [**Creating custom manager view columns**](/guide/custom-ui.html#adding-custom-columns-to-the-apostrophecms-piece-type-manager) to display piece-specific data
- [**Defining custom context menu operations**](/guide/custom-ui.html#adding-custom-context-menu-items) for documents

## Theming

### CSS Variables

ApostropheCMS uses CSS variables for consistent styling across the admin UI. These variables are defined in the `modules/@apostrophecms/ui/ui/apos/scss/global/_theme.scss` file.

#### Colors

```css
--a-primary: #6516dd;           /* Default primary color */
--a-danger: #eb443b;            /* Error/danger color */
--a-success: #00bf9a;           /* Success color */
--a-warning: #ffce00;           /* Warning color */
--a-text-primary: #000;         /* Primary text color */
--a-text-inverted: #fff;        /* Inverted text color */
--a-background-primary: #fff;   /* Primary background color */
```

#### Typography

```css
--a-family-default: -apple-system, system-ui, "BlinkMacSystemFont", "Segoe UI",
  "Roboto", "Helvetica", "Arial", sans-serif;
--a-type-base: 12px;
--a-type-label: 13px;
--a-type-large: 14px;
--a-type-heading: 22px;
```

#### Layout

```css
--a-border-radius: 5px;
--a-border-radius-large: 10px;
--a-box-shadow: 0 3px 13px 4px rgb(0 0 0 / 8%);
```

### Dark Mode Theme

ApostropheCMS has a built-in dark mode theme that can be activated by adding the class `apos-theme-dark` to either the body element or the admin-bar wrapper, as [detailed below](#creating-custom-themes).

To activate dark mode through the standard ApostropheCMS Nunjucks layout, use the `bodyClass` block in your template:

<AposCodeBlock>

```nunjucks
{% extends "layout.html" %}

{% block bodyClass %}apos-theme-dark{% endblock %}
```
  <template v-slot:caption>
    views/layout.html
  </template>
</AposCodeBlock>

::: tip
If you need to add dark mode while keeping any existing body classes added to this same block use:

```nunjucks
{% block bodyClass %}{{ super() }} apos-theme-dark{% endblock %}
```
:::

You can implement a front-end UI toggle between the default light theme and the dark theme by adding and removing the `apos-theme-dark` class.

### Color Themes

ApostropheCMS supports several pre-defined color themes that can be applied to the admin UI. These themes change the primary color used throughout the interface.

Available themes:
Available themes:
- `apos-theme--primary-default` (Purple: <span class="theme-swatch" style="background:#6516dd"></span> #6516dd)
- `apos-theme--primary-blue` (Blue: <span class="theme-swatch" style="background:#0062ff"></span> #0062ff)
- `apos-theme--primary-orange` (Orange: <span class="theme-swatch" style="background:#e65100"></span> #e65100)
- `apos-theme--primary-aqua` (Aqua: <span class="theme-swatch" style="background:#1eacc7"></span> #1eacc7)
- `apos-theme--primary-sun` (Yellow: <span class="theme-swatch" style="background:#f7a704"></span> #f7a704)
- `apos-theme--primary-green` (Green: <span class="theme-swatch" style="background:#00b075"></span> #00b075)
- `apos-theme--primary-pink` (Pink: <span class="theme-swatch" style="background:#fd9ec0"></span> #fd9ec0)

Unlike the dark theme, these classes need to be added to the admin-bar wrapper.

#### Server-Side Theme Configuration

ApostropheCMS has some built-in theme support in the `@apostrophecms/ui` module. To change the primary theme, you simply need to add a schema field named `aposThemePrimary` that passes a theme color as value to either:

1. The global document (applies to all users)
2. The user document (applies to a specific user, overrides global setting)

Depending on your preference, you can add the following to either the `modules/@apostrophecms/global/index.js` or the `modules/@apostrophecms/user/index.js` schema fields:

<AposCodeBlock>

```javascript
export default () => ({
  fields: {
    add: {
      aposThemePrimary: {
        type: 'select',
        label: 'Admin UI Theme',
        choices: [
          { label: 'Default (Purple)', value: 'default' },
          { label: 'Blue', value: 'blue' },
          { label: 'Orange', value: 'orange' },
          { label: 'Aqua', value: 'aqua' },
          { label: 'Yellow', value: 'sun' },
          { label: 'Green', value: 'green' },
          { label: 'Pink', value: 'pink' }
          // Add your custom themes here shown below
          { label: 'Custom', value: 'custom' }
        ],
        def: 'default'
      }
    },
    group: {
      appearance: {
        label: 'Appearance',
        fields: ['aposThemePrimary']
      }
    }
  }
});
```
</AposCodeBlock>

With these schema additions, the existing `getBrowserData` method in the UI module will automatically detect and apply the theme settings to the admin-bar wrapper HTML markup.

### Creating Custom Themes

You can create your own custom theme by:

1. Creating a new SCSS file in your project (e.g., `modules/asset/ui/src/scss/custom-theme.scss`)
2. Adding the modern Sass module imports along with Apostrophe's mixins:

<AposCodeBlock>

```scss
// Required for using the core ApostropheCMS Sass mixins
@use 'sass:math';
@use 'sass:color';

// Import Apostrophe's mixins
@import 'apostrophe/modules/@apostrophecms/ui/ui/apos/scss/mixins/_theme_mixins';

// Custom theme definition
// change "custom" to give your theme a different name
// and pass it in the schema above as value
.apos-theme--primary-custom {
  @include apos-primary-mixin(#ff5722); // Your custom primary color

  // You can also override other CSS variables within this selector
  --a-warning: #ffa000;
  --a-success: #00c853;
  --a-border-radius: 8px;
}

// Optional: Create a dark variant of your custom theme
// Note that the `.apos-theme-dark` can be added to the
// body or to the same wrapper div as the `.apos-theme--primary-XXX`
.apos-theme-dark .apos-theme--primary-custom {
  // Override specific variables for dark + custom combo
  --a-primary-light-40: #ff8a65;
  --a-base-9: #212932;
  --a-base-10: #171d24;
}
```
</AposCodeBlock>

## Related Documentation

- [Customizing the User Interface](/guide/custom-ui.md)
- [Custom Schema Field Types](/guide/custom-schema-field-types.md)
- [Editing Custom Widgets in Context](/guide/editing-custom-widgets-in-context.md)