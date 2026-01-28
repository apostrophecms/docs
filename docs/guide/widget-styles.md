# Per-Widget Styling

**Per-widget styling** allows content creators to customize individual widget instances through the widget editor modal. Unlike global styles that apply site-wide, widget styles are scoped to specific widget instances, enabling unique styling for each occurrence of a widget on your pages.

## Configuration

Widget styles are configured by adding a `styles` property to your widget's schema configuration, using the same `styles` cascade pattern as global styles. You define fields with types, labels, selectors, and properties—but these controls apply only to individual widget instances rather than site-wide.

Add styles to any widget by including a `styles` property in the widget's `index.js`:

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Hero Widget'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Title'
      },
      image: {
        type: 'area',
        label: 'Image',
        options: {
          widgets: {
            '@apostrophecms/image': {}
          }
        }
      }
    }
  },
  styles: {
    add: {
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        selector: '.hero-wrapper',
        property: 'background-color',
        def: '#ffffff'
      },
      textColor: {
        type: 'color',
        label: 'Text Color',
        selector: '.hero-title',
        property: 'color',
        def: '#000000'
      },
      spacing: {
        preset: 'padding',
        selector: '.hero-wrapper'
      }
    }
  }
};
```

<template v-slot:caption>
  modules/hero-widget/index.js
</template>

</AposCodeBlock>

::: info Permissions
Widget styling permissions follow the widget's own edit permissions. If a user can edit a widget instance, they can modify its style settings. With the `@apostrophecms-pro/advanced-permissions` module installed you can add per-field permissions to limit styles to specific user groups.
:::


## Field types and properties

Widget styles support the [same field types and essential properties](/guide/global-styles.html#field-types) as global styles:

### Supported field types

- **`box`**: Four-sided spacing controls for margins, padding, and border widths (top, right, bottom, left)
- **`color`**: Color picker for backgrounds, text, borders
- **`range`**: Slider controls for spacing, sizes, numeric values
- **`integer`**: Numeric input for whole numbers with optional min/max constraints
- **`float`**: Numeric input for decimal values with optional min/max constraints
- **`string`**: Text input for font names, custom values
- **`select`**: Dropdown menus for predefined options

::: info
Using other field types is not recommended and may result in unexpected behavior.
:::

### Essential properties

All the same properties from global styles are available:

- **`selector`**: CSS selector(s) to target elements within the widget template (string or array) - **Optional for widget styles**
- **`property`**: CSS property or properties to modify (string or array)
- **`class`**: Add CSS classes instead of inline styles (see below)
- **`unit`**: Unit to append to numeric values (`px`, `rem`, `%`, etc.)
- **`valueTemplate`**: Template for wrapping values in CSS functions (e.g., `'rgb(%VALUE%)'`)
- **`mediaQuery`**: Apply styles only within specific media queries

#### The `selector` property in widget styles

Unlike global styles where `selector` is required, **`selector` is optional for widget styles**. Widget styles are automatically scoped to each widget instance, so:

- **Without a selector**: The style applies directly to the widget wrapper element
- **With a selector**: The style targets nested elements within the widget template

<AposCodeBlock>

```javascript
styles: {
  add: {
    // No selector - applies to widget wrapper itself
    wrapperBorder: {
      type: 'color',
      label: 'Border Color',
      property: 'border-color'
    },
    // With selector - targets nested element
    titleColor: {
      type: 'color',
      label: 'Title Color',
      selector: '.widget-title',
      property: 'color'
    }
  }
}
```

<template v-slot:caption>
  Optional selector usage
</template>

</AposCodeBlock>

#### The `class` property

Add CSS classes instead of inline styles. The `class` property has two modes:

**For `select` and `checkboxes` fields** - Use `class: true` to add the field's value as a CSS class:

<AposCodeBlock>

```javascript
alignment: {
  type: 'select',
  label: 'Alignment',
  selector: '.content',
  class: true,
  choices: [
    { label: 'Left', value: 'align-left' },
    { label: 'Center', value: 'align-center' },
    { label: 'Right', value: 'align-right' }
  ]
}
```

</AposCodeBlock>

**For `boolean` fields** - Use `class: 'class-name'` to add a specific class when true:

<AposCodeBlock>

```javascript
featured: {
  type: 'boolean',
  label: 'Featured Style',
  selector: '.card',
  class: 'is-featured'
}
```

<template v-slot:caption>
  Using class with boolean fields
</template>

</AposCodeBlock>

### Additional property examples

<AposCodeBlock>

```javascript
styles: {
  add: {
    // Multiple selectors and properties
    spacing: {
      type: 'range',
      label: 'Vertical Spacing',
      selector: ['.hero-header', '.hero-footer'],
      property: ['padding-top', 'padding-bottom'],
      min: 0,
      max: 4,
      step: 0.5,
      unit: 'rem'
    },
    // Value template
    shadow: {
      type: 'color',
      label: 'Shadow Color',
      selector: '.card',
      property: 'box-shadow',
      valueTemplate: '0 2px 8px %VALUE%'
    },
    // Media query
    mobileFont: {
      type: 'range',
      label: 'Mobile Font Size',
      selector: '.widget-title',
      property: 'font-size',
      min: 14,
      max: 24,
      unit: 'px',
      mediaQuery: '(max-width: 768px)'
    }
  }
}
```

<template v-slot:caption>
  modules/my-widget/index.js
</template>

</AposCodeBlock>

For complete documentation on field types and properties, see the [Global Styling documentation](/guide/global-styles.md).

## Using presets

Widget styles support all the same built-in presets as global styles:

- **`width`** - Width percentage slider
- **`alignment`** - Left/center/right alignment classes
- **`padding`** - Four-sided padding control
- **`margin`** - Four-sided margin control
- **`border`** - Multi-field border controls (width, radius, color, style)
- **`boxShadow`** - Multi-field drop shadow controls

Use presets with shorthand or customization:

<AposCodeBlock>

```javascript
styles: {
  add: {
    // Shorthand
    cardPadding: 'padding',
    cardMargin: 'margin',

    // With customization
    cardBorder: {
      preset: 'border',
      selector: '.card-container'
    },
    dropShadow: {
      preset: 'boxShadow',
      selector: '.card-container'
    },

    // Alignment preset includes built-in CSS classes
    contentAlign: {
      preset: 'alignment',
      selector: '.card-content'
    }
  }
}
```

<template v-slot:caption>
  modules/card-widget/index.js
</template>

</AposCodeBlock>

::: info
The `alignment` preset uses built-in CSS classes (`.apos-left`, `.apos-center`, `.apos-right`) that ship with ApostropheCMS core. These classes are available site-wide and can be overridden at project level if needed.
:::

For details on each preset's fields and configuration, see the [Global Styling documentation](/guide/global-styles.md).

## Object field limitations

Object fields are supported in widget styles but cannot be nested within other object fields. This limitation exists because the styles module only iterates one level deep through object fields — it does not recursively process nested object structures.

This means:

- You **can** use object fields at the top level of your widget's `styles` schema
- You **cannot** use presets within object fields (since presets may themselves be object fields)
- You **cannot** nest object fields within other object fields

Object fields are primarily supported to enable the subfields used in multi-field presets like `border` and `boxShadow`.

## Automatic styling (default)

By default, widget styles are applied automatically with no template modifications required. The styles module generates scoped CSS for each widget instance and wraps the widget output with the necessary styling elements.

**How it works:**
- Styles are automatically scoped to each widget instance (one widget's styles don't affect another)
- A unique ID is generated per instance
- CSS is injected via a `<style>` tag scoped to that instance
- Classes and inline styles are applied to a wrapper element

## Manual styling control

For complete control over style application, you can opt out of automatic wrapping and use template helpers:

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Custom Widget',
    stylesWrapper: false  // Opt out of automatic wrapper
  },
  // ... fields and styles configuration
};
```

<template v-slot:caption>
  modules/custom-widget/index.js
</template>

</AposCodeBlock>

Then use the template helpers in your widget template:

<AposCodeBlock>

```nunjucks
{%- set styles = apos.styles.render(data.widget) -%}
{{ apos.styles.elements(styles) }}

<article {{ apos.styles.attributes(styles, { class: 'my-custom-class' }) }}>
  <h2>{{ data.widget.title }}</h2>
  <!-- widget content -->
</article>
```

<template v-slot:caption>
  modules/custom-widget/views/widget.html
</template>

</AposCodeBlock>

### Template helpers

**`apos.styles.render(widget)`**
- Prepares styles for the widget
- Returns a styles object for use with other helpers

**`apos.styles.elements(styles)`**
- Generates the `<style>` tag with scoped CSS
- Must be called before using the styles

**`apos.styles.attributes(styles, additionalAttributes, options)`**
- Generates HTML attributes for the widget wrapper
- Merges style classes and inline styles with any additional attributes
- `additionalAttributes` (optional): Object with additional HTML attributes
- `options` (optional): 
  - `asObject: true` - Return attributes as object instead of string

<AposCodeBlock>

```nunjucks
{# Basic usage #}
<div {{ apos.styles.attributes(styles) }}>

{# With additional attributes #}
<article {{ apos.styles.attributes(styles, { 
  class: 'fancy-article',
  'data-category': 'featured' 
}) }}>

{# As object for further manipulation #}
{% set attrs = apos.styles.attributes(styles, {}, { asObject: true }) %}
```

<template v-slot:caption>
  Example template helper usage
</template>

</AposCodeBlock>

## Restricting style editing with Advanced Permission

If you need to allow some users to edit widget content but not widget styles, you can use the [Advanced Permission module](https://github.com/apostrophecms/advanced-permission) to create granular access controls.

::: info
This requires the `@apostrophecms-pro/advanced-permission` module. For global styles, you can simply control edit access to the styles document itself through group permissions — no field-level permissions needed.
:::

### Setting up permission-restricted widget styles

**1. Create a custom permission for your widget type:**

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Hero Widget'
  },
  permissions: {
    add: {
      editStyles: {
        label: 'Edit Widget Styles',
        requires: 'edit'
      }
    }
  },
  // ... fields and styles configuration
};
```

<template v-slot:caption>
  modules/hero-widget/index.js
</template>

</AposCodeBlock>

**2. Add `editPermission` to each style field:**

<AposCodeBlock>

```javascript
styles: {
  add: {
    backgroundColor: {
      type: 'color',
      label: 'Background Color',
      property: 'background-color',
      editPermission: {
        action: 'editStyles',
        type: 'hero-widget'
      }
    },
    padding: {
      preset: 'padding',
      editPermission: {
        action: 'editStyles',
        type: 'hero-widget'
      }
    }
  }
}
```

<template v-slot:caption>
  Adding editPermission to each field
</template>

</AposCodeBlock>

**3. Configure groups with appropriate permissions:**

- **Content Editors**: Grant `edit` permission only (can edit content, not styles)
- **Design Editors**: Grant both `edit` and `editStyles` permissions (can edit everything)

::: warning
You must add `editPermission` to **every style field individually**. In the case of presets, you may set `editPermission` once for each use of the preset and it will be applied to every field generated by that use of the preset.
:::

### Reducing repetition

For widgets with many style fields, create a helper function:

<AposCodeBlock>

```javascript
function addStylePermission(styleConfig) {
  return {
    ...styleConfig,
    editPermission: {
      action: 'editStyles',
      type: 'hero-widget'
    }
  };
}

export default {
  // ... module configuration
  styles: {
    add: {
      backgroundColor: addStylePermission({
        type: 'color',
        label: 'Background Color',
        property: 'background-color'
      }),
      padding: addStylePermission({
        preset: 'padding'
      })
    }
  }
};
```

<template v-slot:caption>
  Helper function to reduce repetition
</template>

</AposCodeBlock>


## Differences from global styles

| Feature | Global Styles | Widget Styles |
|---------|--------------|---------------|
| **Scope** | Site-wide | Per widget instance |
| **Storage** | Global document | Widget data |
| **Delivery** | Cached stylesheet + inline | Inline per widget |
| **Interface** | Dedicated admin UI | Widget editor modal |
| **Selectors** | Required | Optional (for nested elements) |
| **Grouping** | Supports nested groups | Not supported |
| **Overrides** | Supports custom render method | Not supported |

::: warning
Widget styles do not support field grouping. All widget style fields appear in a single "Styles" tab within the widget editor. Attempting to use the `group` property with widget styles will cause an error.
:::

## Best practices

### Use appropriate selectors

Widget styles are automatically scoped to each widget instance. The `selector` property is **optional**:

- **Without a selector**: Styles apply to the widget wrapper element itself
- **With a selector**: Styles target nested elements within your widget template

<AposCodeBlock>

```javascript
styles: {
  add: {
    // No selector - applies to widget wrapper
    wrapperBackground: {
      type: 'color',
      label: 'Background Color',
      property: 'background-color'
    },
    // With selector - targets nested element
    titleColor: {
      type: 'color',
      label: 'Title Color',
      selector: '.widget-title',
      property: 'color'
    }
  }
}
```

</AposCodeBlock>

Avoid selectors that target elements outside your widget template - they won't match due to automatic scoping:

<AposCodeBlock>

```javascript
// Bad - won't match anything
textColor: {
  selector: 'body',  // Becomes #widget-abc123 body (no match)
  property: 'color',
  type: 'color'
}
```

</AposCodeBlock>

### Performance considerations

- Widget styles are generated for each instance, so they add to page size
- For styles that should apply to all instances of a widget type, use global styles or regular CSS
- Reserve widget styles for per-instance customization that content creators need

## When to use widget styles vs. global styles

**Use widget styles when:**
- Content creators need per-instance customization
- Different instances of the same widget need different appearances
- Styles are specific to widget content (e.g., background color based on content)

**Use global styles when:**
- Styles should apply site-wide
- Maintaining consistent branding across the site
- Defining design system tokens (colors, spacing, typography)

**Use regular CSS when:**
- All instances of a widget should look the same
- Styles are structural or required for widget functionality
- Performance is critical and per-instance variation isn't needed