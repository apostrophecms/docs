---
extends: '@apostrophecms/piece-type'
---

# `@apostrophecms/styles`

<AposRefExtends :module="$frontmatter.extends" />

This module provides the styling system for ApostropheCMS, powering both **global site-wide styles** and **per-widget instance styles**. It allows developers to define CSS customization controls that content creators can adjust through the admin interface.

For global styles, the module functions as a singleton piece type that stores CSS values in the global document and generates site-wide stylesheets. For widget styles, it generates scoped CSS for individual widget instances, allowing per-instance customization.

The styles module is enabled by default and requires no initial configuration to function. Configuration is only necessary when you want to add custom style controls.

## Configuration

### `styles`

This configuration cascade defines style controls. When used in `modules/@apostrophecms/styles/index.js`, it creates **global site-wide styles**. When used in a widget module (e.g., `modules/hero-widget/index.js`), it creates **per-widget instance styles**.

The configuration syntax is identical for both, but the scope and storage differ:
- **Global styles:** Stored in the global document, applied site-wide
- **Widget styles:** Stored with each widget instance, automatically scoped

The `styles` configuration uses `add` to define individual style fields:

**Global styles example:**

```javascript
// modules/@apostrophecms/styles/index.js
module.exports = {
  styles: {
    add: {
      backgroundColor: {
        type: 'color',
        label: 'Page Background',
        selector: 'body',
        property: 'background-color',
        def: '#ffffff'
      },
      primaryColor: {
        type: 'color',
        label: 'Primary Brand Color',
        selector: ':root',
        property: '--primary-color'
      }
    },
    group: {
      colors: {
        label: 'Brand Colors',
        fields: ['backgroundColor', 'primaryColor']
      }
    }
  }
};
```

**Widget styles example:**

```javascript
// modules/hero-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  // ... other widget configuration
  styles: {
    add: {
      textColor: {
        type: 'color',
        label: 'Text Color',
        selector: '.hero-title',
        property: 'color'
      },
      padding: 'padding'  // Using preset shorthand
    }
  }
};
```

::: info
The `styles` cascade is the recommended approach. The legacy `fields` cascade is still supported for backward compatibility with the former `@apostrophecms-pro/palette` module, but mixing both in the global styles configuration will cause an error.
:::

#### Field properties

Style fields support these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Field type: `box`, `color`, `range`, `string`, `select`, or `object` |
| `label` | String | Yes | Label displayed in the admin interface |
| `selector` | String or Array | Conditional* | CSS selector(s) to target (*see note below) |
| `property` | String or Array | Conditional* | CSS property/properties to modify (*see note below) |
| `class` | Boolean or String | No | Add CSS classes: `true` for select/checkboxes, `'class-name'` for booleans |
| `def` | Any | No | Default value for the field |
| `unit` | String | No | Unit to append to numeric values (`px`, `rem`, `%`, etc.) |
| `valueTemplate` | String | No | Template for wrapping values (e.g., `'rgb(%VALUE%)'`) |
| `mediaQuery` | String | No | Media query to scope the CSS rule |
| `preset` | String | No | Name of a preset to use |
| `if` | Object | No | Conditional display based on field values |

**Notes on required properties:**
- **`selector`**: Required for global styles (except when using presets). Optional for widget styles—without a selector, styles apply to the widget wrapper; with a selector, they target nested elements.
- **`property`**: Required unless using presets or when `class` is specified.
- **`class`**: When present, field values become CSS classes instead of inline styles. Mutually exclusive with `property`.

#### Using presets

Presets can be referenced using shorthand or with customization:

```javascript
styles: {
  add: {
    // Shorthand
    padding: 'padding',
    
    // With customization
    cardBorder: {
      preset: 'border',
      selector: '.card'
    }
  }
}
```

#### Grouping (global styles only)

The `group` property organizes fields into tabs and sections **for global styles only**. Widget styles do not support grouping—all widget style fields appear in a single "Styles" tab.

```javascript
styles: {
  add: {
    // Fields
  },
  group: {
    // Top-level group appears as a tab
    colors: {
      label: 'Colors',
      fields: ['primaryColor', 'accentColor']
    },
    // Nested groups create sections within tabs
    typography: {
      label: 'Typography',
      group: {
        headings: {
          label: 'Headings',
          fields: ['headingFont', 'headingSize']
        },
        body: {
          label: 'Body Text',
          fields: ['bodyFont', 'bodySize']
        }
      }
    }
  }
}
```

::: warning
Widget modules do not support the `group` property in their `styles` configuration. Attempting to use grouping with widget styles will cause an error.
:::

## Options

::: info
These options configure the styles module behavior and should be set in `modules/@apostrophecms/styles/index.js`.
:::

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| [`serverRendered`](#serverrendered) | Boolean | `false` | Enable server-side CSS rendering for custom `getStylesheet` method |
| [`defaultStyles`](#defaultstyles) | Object | See below | Default values for built-in presets |

### `serverRendered`

When set to `true`, all CSS rendering (including preview during editing) goes through your custom `getStylesheet` method. This is required when implementing custom CSS generation logic.
**This option is only available for global styles.** Widget styles are always rendered server-side for performance reasons.

```javascript
module.exports = {
  options: {
    serverRendered: true
  }
};
```

### `defaultStyles`

Configure default values for built-in presets like `border` and `boxShadow`:

```javascript
module.exports = {
  options: {
    defaultStyles: {
      borderColor: '#cccccc',
      shadowColor: '#00000033'
    }
  }
};
```

Available defaults:
- `borderColor`: Default color for the `border` preset (default: `'black'`)
- `shadowColor`: Default color for the `boxShadow` preset (default: `'gray'`)

## Featured methods

### `registerPresets()`

Override this method to register custom presets or modify built-in presets. This method is called during schema initialization.

```javascript
extendMethods(self) {
  return {
    registerPresets(_super) {
      // Always call the parent to register built-in presets
      _super();
      
      // Register a custom preset
      self.setPreset('gradient', {
        type: 'object',
        label: 'Gradient Background',
        property: 'background-image',
        valueTemplate: 'linear-gradient(%direction%, %startColor%, %endColor%)',
        fields: {
          add: {
            active: {
              type: 'boolean',
              label: 'Enable Gradient',
              def: false
            },
            direction: {
              type: 'select',
              label: 'Direction',
              def: 'to right',
              if: { active: true },
              choices: [
                { label: 'Left to Right', value: 'to right' },
                { label: 'Top to Bottom', value: 'to bottom' }
              ]
            },
            startColor: {
              type: 'color',
              label: 'Start Color',
              def: '#ffffff',
              if: { active: true }
            },
            endColor: {
              type: 'color',
              label: 'End Color',
              def: '#000000',
              if: { active: true }
            }
          }
        }
      });

      // Or modify an existing preset
      const borderPreset = self.getPreset('border');
      borderPreset.fields.add.width.def = {
        top: 2,
        right: 2,
        bottom: 2,
        left: 2
      };
      self.setPreset('border', borderPreset);
    }
  };
}
```

::: warning
Presets must be registered inside the `registerPresets()` method before schema initialization. Attempting to call `setPreset()` outside this method will throw an error.
:::

### `setPreset(name, preset)`

Register or update a preset. Must be called within `registerPresets()` method only.

**Parameters:**
- `name` (String): Unique identifier for the preset
- `preset` (Object): Preset configuration object with a `type` property and other field properties

### `getPreset(name)`

Retrieve a preset configuration by name. Can be called after preset registration.

**Parameters:**
- `name` (String): Preset identifier

**Returns:** Preset configuration object

### `hasPreset(name)`

Check if a preset exists.

**Parameters:**
- `name` (String): Preset identifier

**Returns:** Boolean

### `async getStylesheet(doc)`

Generate CSS from style field values for **global styles**. Override this method to implement custom CSS generation logic.

::: tip
You must set `serverRendered: true` in options to ensure this method is called for all rendering, including preview during editing.
:::

```javascript
module.exports = {
  options: {
    serverRendered: true
  },
  methods(self) {
    return {
      async getStylesheet(doc) {
        const schema = self.schema;
        let css = '';

        // Custom CSS generation logic
        for (const field of schema) {
          if (doc[field.name] && field.selector && field.property) {
            css += `${field.selector} { ${field.property}: ${doc[field.name]}${field.unit || ''}; }\n`;
          }
        }

        // Must return object with css and classes properties
        return {
          css,
          classes: [] // Array of class names for <body> element
        };
      }
    };
  }
};
```

**Parameters:**
- `doc` (Object): The global document containing style field values

**Returns:** Object with properties:
- `css` (String): Complete CSS string to be wrapped in `<style>` tag
- `classes` (Array): Class names to apply to `<body>` element

**Default behavior:**
The default implementation calls the internal `stylesheetGlobalRender` method which:
- Iterates through all style fields in the schema
- Generates CSS rules based on field configuration
- Handles selectors, properties, units, value templates, and media queries
- Returns CSS and body classes

### `getWidgetStylesheet(schema, doc, options)`

Generate scoped CSS for a **widget instance**. This method is used internally by `@apostrophecms/widget-type` when rendering widgets with styles. It is rarely called directly but can be overridden for custom widget styling needs.

**Parameters:**
- `schema` (Array): Widget style field schema
- `doc` (Object): Widget data with style field values
- `options` (Object): Configuration options
  - `rootSelector` (String): Custom root selector for scoped styles

**Returns:** Object with properties:
- `css` (String): Scoped stylesheet for `<style>` tag
- `inline` (String): Inline styles for widget wrapper `style` attribute
- `classes` (Array): Class names for widget wrapper `class` attribute

**Default behavior:**
The default implementation calls the internal `stylesheetScopedRender` method which:
- Automatically scopes all CSS rules to the widget instance
- Determines whether to use inline styles vs. `<style>` tag based on presence of selectors/media queries
- Handles all the same field properties as global styles

## Nunjucks helpers (widget styles only)

The following helpers are used for **widget styles** when `stylesWrapper: false` is set on a widget type, giving developers manual control over style application.

### `apos.styles.render(widget)`

Prepare styles for a widget instance. Used when `stylesWrapper: false` is set on the widget.

**Parameters:**
- `widget` (Object): Widget data object

**Returns:** Object with style data for use with other helpers:
- `css` (String): Scoped CSS
- `classes` (Array): Class names
- `inline` (String): Inline styles
- `styleId` (String): Unique ID for this instance
- `widgetId` (String): Widget's `_id`

### `apos.styles.elements(styles)`

Generate `<style>` tag with scoped CSS for a widget.

**Parameters:**
- `styles` (Object): Result from `apos.styles.render(widget)`

**Returns:** HTML string with `<style>` element and data attributes linking it to the widget instance

### `apos.styles.attributes(styles, additionalAttributes, options)`

Generate HTML attributes string for widget wrapper element.

**Parameters:**
- `styles` (Object): Result from `apos.styles.render(widget)`
- `additionalAttributes` (Object): Additional HTML attributes to merge (optional)
  - `class` and `style` attributes are intelligently merged
  - Other attributes are added directly
- `options` (Object): Configuration (optional)
  - `asObject` (Boolean): Return attributes as object instead of string

**Returns:** String of HTML attributes (default) or object if `asObject: true`

**Example usage in template:**

```nunjucks
{%- set styles = apos.styles.render(data.widget) -%}
{{ apos.styles.elements(styles) }}
<article {{ apos.styles.attributes(styles, { class: 'my-class' }) }}>
  <!-- widget content -->
</article>
```

## REST API routes (global styles only)

These routes serve **global styles** only. Widget styles are generated and injected inline during widget rendering.

### `GET /api/v1/@apostrophecms/styles/stylesheet`

Serves the cached global stylesheet.

**Query parameters:**
- `version` (String): Stylesheet version identifier for cache busting
- `aposLocale` (String): Locale identifier (format: `locale:mode`)

**Response:**
- Content-Type: `text/css`
- Cache-Control: `public, max-age=31557600` (1 year)
- Body: Complete CSS stylesheet

**Usage:**
This endpoint is called automatically via `<link>` tag for guest users:
```html
<link rel="stylesheet" href="/api/v1/@apostrophecms/styles/stylesheet?version=abc123&aposLocale=en:published">
```

### `POST /api/v1/@apostrophecms/styles/render`

Renders CSS in real-time for preview during editing.

**Authentication:** Required (must be logged in)

**Request body:**
```json
{
  "data": {
    "backgroundColor": "#ffffff",
    "primaryColor": "#0066cc"
    // ... other style field values
  }
}
```

**Response:**
- Content-Type: `text/css`
- Body: Generated CSS based on provided values

**Security:**
This endpoint requires authentication to prevent DOS attacks. Changes are not persisted; it only generates CSS for preview purposes.

## Built-in presets

The styles module includes several standard presets defined in `lib/presets.js`:

### `width`
- Type: `range`
- Range: 0-100%, step 10
- Default: 100%
- Property: `width`
- Unit: `%`

### `alignment`
- Type: `select`
- Adds CSS classes: `apos-left`, `apos-center`, `apos-right`
- Uses `class: true` property
- Note: Core includes CSS for these classes that can be overridden at project level

### `padding`
- Type: `box`
- Property: `padding`
- Unit: `px`

### `margin`
- Type: `box`
- Property: `margin`
- Unit: `px`

### `border`
- Type: `object` (multi-field preset)
- Fields:
  - `active` (boolean): Enable/disable border
  - `width` (box): Border width per side, uses `property: 'border-%key%-width'`
  - `radius` (range): Border radius 0-32px
  - `color` (color): Border color
  - `style` (select): solid/dotted/dashed
- All fields except `active` use conditional display (`if: { active: true }`)

### `boxShadow`
- Type: `object` (multi-field preset)
- Uses `valueTemplate: '%x% %y% %blur% %color%'` to compose CSS value
- Property: `box-shadow`
- Fields:
  - `active` (boolean): Enable/disable shadow
  - `x` (range): X offset -32 to 32px
  - `y` (range): Y offset -32 to 32px
  - `blur` (range): Blur 0-32px
  - `color` (color): Shadow color
- All fields except `active` use conditional display (`if: { active: true }`)

## Storage and delivery

This section describes how **global styles** are stored and delivered. Widget styles are stored with each widget instance and injected inline.

### Global document storage

When style changes are saved:

1. CSS is generated via `getStylesheet(doc)`
2. Results are stored in the `@apostrophecms/global` document:
   - `stylesStylesheet`: Complete CSS string
   - `stylesClasses`: Array of body class names
   - `stylesStylesheetVersion`: Cache-busting version ID (cuid2)

### Automatic injection

The module automatically injects styles into every page:

- **For logged-out visitors:** `<link>` tag pointing to cached stylesheet endpoint
- **For logged-in users:** `<style>` tag with inline CSS (to support preview features)
- **Body classes:** Automatically added to `<body>` element via `@apostrophecms/page:beforeSend` handler

No template modifications are required for global styles to work.

## Object field limitations

Object fields are supported but with these restrictions:

- Object fields cannot be nested within other object fields
- The styles module only iterates one level deep through object field structures
- Presets cannot be used within object fields (since presets may themselves be object fields)
- Object fields are primarily supported to enable multi-field presets like `border` and `boxShadow`

Good catch! Looking at the migration task code, it does more than just rename the cascade. Let me provide the complete section with accurate details:

---

## Migrating from @apostrophecms-pro/palette

**Critical: This is a manual migration, not automatic**

Unlike most ApostropheCMS migrations that run automatically at startup, the Palette-to-Styles migration must be run manually via a command-line task.

### Prerequisites

1. **Keep Palette installed**: The `@apostrophecms-pro/palette` module **must remain in your project** until after the migration is complete. The migration task is part of Palette, not the core Styles module.

2. **Backup your database**: This migration modifies database documents directly. Always backup before proceeding.

3. **Review your configuration**: Examine your existing `modules/@apostrophecms-pro/palette/index.js` configuration to understand what will need to be moved.

### Running the migration

The migration task is located in `@apostrophecms-pro/palette/lib/tasks.js`. Run it with:

```bash
node app @apostrophecms-pro/palette:migrate-to-styles
```

### What the migration task does

The migration task performs the following database-level changes:

1. **Deletes existing `@apostrophecms/styles` documents** - Removes any existing Styles documents to avoid conflicts
2. **Converts Palette documents to Styles documents** - Updates the document type from `@apostrophecms-pro/palette` to `@apostrophecms/styles`
3. **Updates the global document** - Renames Palette-specific fields in the global document:
   - `paletteStylesheet` → `stylesStylesheet`
   - `paletteStylesheetVersion` → `stylesStylesheetVersion`

**Important**: The migration task only handles database changes. Your configuration files and code must be updated manually (see below).

### Post-migration steps

After running the migration task, you must manually update your project:

1. **Move configuration**: Copy your configuration from `modules/@apostrophecms-pro/palette/index.js` to `modules/@apostrophecms/styles/index.js`

2. **Rename the cascade** (recommended): Change `fields:` to `styles:` in your configuration. While the legacy `fields` cascade still works for backward compatibility, the `styles` cascade is recommended to leverage the presets feature. **Do not mix both cascades** - attempting to use both `fields` and `styles` in the same configuration will cause an error.

3. **Test thoroughly**:
   - Verify all styles appear correctly in the admin interface
   - Check that styles render properly on the front-end
   - Test that editors can modify styles as expected

4. **Remove Palette**: Only after confirming everything works:
   - Remove `@apostrophecms-pro/palette` from your `package.json`
   - Delete the `modules/@apostrophecms-pro/palette` folder
   - Run `npm install` to clean up dependencies

### Reference

For implementation details, see the migration code in `@apostrophecms-pro/palette/lib/tasks.js`.

## Related documentation

- [Global Styling](/guide/global-styling.md)
- [Per-Widget Styling](/guide/widget-styling.md)