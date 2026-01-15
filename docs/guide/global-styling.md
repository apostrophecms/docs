# Global Styles

**Global styles** allow content creators to modify CSS properties through the ApostropheCMS admin interface. Developers define which properties can be modified using schema field configuration, and content creators adjust colors, spacing, typography, and other design elements without writing code.

## Configuration

Global styles are configured in a project-level `modules/@apostrophecms/styles/index.js` using a styles cascade that works much like the schema fields cascade. You define fields with types, labels, and properties—but instead of creating form inputs for content, these fields create controls for CSS properties.

<AposCodeBlock>

```javascript
export default {
  styles: {
    add: {
      // Color field - uses color picker
      backgroundColor: {
        type: 'color',
        label: 'Page Background',
        selector: 'body',
        property: 'background-color'
      },
      // Range field - uses slider
      maxWidth: {
        type: 'range',
        label: 'Content Width',
        selector: '.container',
        property: 'max-width',
        min: 800,
        max: 1400,
        step: 50,
        unit: 'px'
      },
      // Preset - pre-configured multi-field control
      containerPadding: {
        preset: 'padding',
        selector: '.container'
      }
    },
    group: {
      layout: {
        label: 'Layout',
        fields: ['maxWidth', 'containerPadding']
      },
      colors: {
        label: 'Colors',
        fields: ['backgroundColor']
      }
    }
  }
};
```

<template v-slot:caption>
  modules/@apostrophecms/styles/index.js
</template>

</AposCodeBlock>

**Every field needs:**
- `type` (or `preset`) - The control type: `color`, `range`, `string`, `select`, `box`, or a preset name
- `label` - Display name in the interface
- `selector` - CSS selector(s) to target
- `property` - CSS property to modify

**Optional properties** like `unit`, `mediaQuery`, `class`, and more give you fine-grained control. See [Field Properties](#field-properties) for details.

**Presets** provide common multi-field controls like `padding`, `margin`, `border`. See [Using Presets](#using-presets).

**Groups** organize fields into tabs and sections in the interface. See [Organizing the Interface](#organizing-the-interface).

The admin interface and generated CSS are automatically injected into pages—no template modifications required.

::: info Permissions
Global styles require editor-level permissions to modify. Contributors and guests cannot access the styles interface. This ensures site-wide design consistency and prevents unauthorized style changes.
:::

## Field Properties

Field properties control how styles are applied and what CSS is generated.

### Required properties

#### `type` or `preset`

Every field must have either `type` (for direct field configuration) or `preset` (to use a pre-configured field).

<AposCodeBlock>

```javascript
// Using type
backgroundColor: {
  type: 'color',
  // ...
}

// Using preset
padding: {
  preset: 'padding',
  // ...
}
```

</AposCodeBlock>

#### `label`

Display name shown in the admin interface.

<AposCodeBlock>

```javascript
label: 'Background Color'
label: 'Section Spacing'
```

</AposCodeBlock>

#### `selector`

CSS selector(s) that define which elements to target. Supports any valid CSS selector.

<AposCodeBlock>

```javascript
// Single selector
selector: '.header'

// Multiple selectors
selector: ['.header', '.footer', '.sidebar']

// Complex selectors
selector: 'body'                          // Element
selector: '#main-content'                 // ID
selector: ':root'                         // Pseudo-class (for CSS custom properties)
selector: '[data-theme="dark"]'           // Attribute
selector: '.btn:hover'                    // Pseudo-class with element
selector: '.container > .row'             // Child combinator
```

</AposCodeBlock>

#### `property`

CSS property or properties to modify.

<AposCodeBlock>

```javascript
// Single property
property: 'color'
property: 'margin-top'
property: '--primary-color'  // CSS custom property

// Multiple properties
property: ['margin-top', 'margin-bottom']
```

</AposCodeBlock>

### Optional properties

#### `class`

Add CSS classes instead of inline styles. The `class` property has two modes:

**For `select` and `checkboxes` fields** - Use `class: true` to add the field's value as a CSS class:

<AposCodeBlock>

```javascript
alignment: {
  type: 'select',
  label: 'Content Alignment',
  selector: '.content',
  class: true,  // The selected value becomes a class
  choices: [
    { label: 'Left', value: 'align-left' },
    { label: 'Center', value: 'align-center' },
    { label: 'Right', value: 'align-right' }
  ]
}
// If user selects 'Center', the class 'align-center' is added to .content
```

</AposCodeBlock>

**For `boolean` fields** - Use `class: 'class-name'` to add a specific class when true:

<AposCodeBlock>

```javascript
darkMode: {
  type: 'boolean',
  label: 'Enable Dark Mode',
  selector: 'body',
  class: 'dark-theme'  // Adds 'dark-theme' class when checked
}
```

</AposCodeBlock>

::: info
The `class` property is particularly useful for working with utility CSS frameworks or when you want to use predefined CSS classes instead of generating inline styles.
:::

#### `unit`

Append units to numeric values from `range` or `box` fields.

<AposCodeBlock>

```javascript
unit: 'px'   // Results in "16px"
unit: 'rem'  // Results in "1.5rem"
unit: '%'    // Results in "75%"
unit: 'em'   // Results in "2em"
```

</AposCodeBlock>

#### `valueTemplate`

Wrap values in CSS functions or add additional text.

<AposCodeBlock>

```javascript
// Wrap color in rgb()
valueTemplate: 'rgb(%VALUE%)'
// Result: rgb(255, 0, 0)

// Create box shadow with color
valueTemplate: '0 4px 8px %VALUE%'
// Result: 0 4px 8px rgba(0,0,0,0.3)

// URL function
valueTemplate: 'url(%VALUE%)'
// Result: url(image.jpg)
```

</AposCodeBlock>

#### `mediaQuery`

Apply styles only within specific media queries.

<AposCodeBlock>

```javascript
mobileFontSize: {
  type: 'range',
  label: 'Mobile Font Size',
  selector: 'body',
  property: 'font-size',
  min: 14,
  max: 18,
  unit: 'px',
  mediaQuery: '(max-width: 768px)'  // Mobile only
}

desktopSpacing: {
  type: 'box',
  label: 'Desktop Padding',
  selector: '.container',
  property: 'padding',
  unit: 'px',
  mediaQuery: '(min-width: 1200px)'  // Desktop only
}
```

</AposCodeBlock>

### Complete field example

Here's a field using multiple properties:

<AposCodeBlock>

```javascript
heroSpacing: {
  type: 'range',
  label: 'Hero Section Spacing',
  selector: ['.hero-header', '.hero-footer'],  // Multiple selectors
  property: ['padding-top', 'padding-bottom'], // Multiple properties
  min: 0,
  max: 100,
  step: 5,
  def: 40,
  unit: 'px',
  mediaQuery: '(min-width: 768px)'  // Desktop only
}
```

</AposCodeBlock>

## Understanding Selectors
Global styles apply CSS to elements that already exist in your templates. The selector property targets your existing HTML markup—it doesn't create new elements.
When you configure a style field like this:
<AposCodeBlock>
```javascript
backgroundColor: {
  type: 'color',
  label: 'Page Background',
  selector: 'body',
  property: 'background-color'
}
```
</AposCodeBlock>
The styles module generates CSS that targets the body element in your templates. If the selector doesn't match any elements, the style will have no visible effect.

**Finding good selectors**
Look at your existing template markup to identify selectors:

<AposCodeBlock>
```nunjucks
{# layout.html #}
<body>
  <header class="site-header">
    <div class="container">
      <nav class="main-nav">...</nav>
    </div>
  </header>
  <main class="site-content">
    <div class="container">...</div>
  </main>
</body>
```
<template v-slot:caption>
  views/layout.html
</template>
</AposCodeBlock>
Based on this markup, these selectors would work:

- `body` - The body element
- `.site-header` - The header
- `.container` - Container divs (both instances)
- `.main-nav` - The navigation
- `.site-content` - The main content area

These selectors would not work (they don't exist in the template):

- `.hero-section` - No element has this class
- `#sidebar` - No element has this ID
- `.card-grid` - No element has this class

::: tip
Use your browser's developer tools to inspect your site's HTML and identify existing classes and IDs that make good selector targets.
:::

## Field Types

The styles module officially supports these field types for design controls. Other ApostropheCMS field types may work but are not guaranteed to function properly.

### `color`

Color picker for backgrounds, text colors, borders, and shadows.

<AposCodeBlock>

```javascript
textColor: {
  type: 'color',
  label: 'Body Text Color',
  selector: 'body',
  property: 'color',
  def: '#333333'
}
```

</AposCodeBlock>

::: info
Color fields support additional configuration through the `options` property, including output format (hex, rgb, hsl), preset color swatches, and UI customization. See the [color field reference](/reference/field-types/color.md) for full details.
:::

### `range`

Slider control for spacing, sizes, and numeric values.

<AposCodeBlock>

```javascript
fontSize: {
  type: 'range',
  label: 'Base Font Size',
  selector: 'body',
  property: 'font-size',
  min: 14,
  max: 20,
  step: 1,
  def: 16,
  unit: 'px'
}
```

</AposCodeBlock>

### `string`

Text input for font names, custom values, and CSS strings.

<AposCodeBlock>

```javascript
fontFamily: {
  type: 'string',
  label: 'Body Font',
  selector: 'body',
  property: 'font-family',
  def: 'Arial, sans-serif'
}
```

</AposCodeBlock>

### `select`

Dropdown menu for predefined options.

<AposCodeBlock>

```javascript
fontWeight: {
  type: 'select',
  label: 'Heading Weight',
  selector: 'h1, h2, h3',
  property: 'font-weight',
  choices: [
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Bold', value: '700' }
  ],
  def: '700'
}
```

</AposCodeBlock>

### `box`

Four-sided spacing control for margins, padding, and border widths (top, right, bottom, left).

<AposCodeBlock>

```javascript
sectionPadding: {
  type: 'box',
  label: 'Section Padding',
  selector: '.section',
  property: 'padding',
  unit: 'px',
  def: {
    top: 40,
    right: 20,
    bottom: 40,
    left: 20
  }
}
```

</AposCodeBlock>

::: info
Using other field types is not recommended and may result in unexpected behavior.
:::

## Using Presets

Presets are pre-configured field combinations that provide common styling controls. They save time and ensure consistency. Presets should be passed in place of a `type` field. Pass in values for preset fields to override the defaults. For example, you can could add a `unit: 'rem'` field to a `preset: 'margin'` to override the default `px` unit.

### Built-in presets

#### `width`

Width control with percentage-based slider.

<AposCodeBlock>

```javascript
imageWidth: {
  preset: 'width',
  selector: '.featured-image'
}
```

</AposCodeBlock>

- Type: `range`
- Range: 0-100%, step 10
- Default: 100%
- Generates: `width: X%`

#### `alignment`

Content alignment using CSS classes.

<AposCodeBlock>

```javascript
contentAlign: {
  preset: 'alignment',
  selector: '.content-block'
}
```

</AposCodeBlock>

- Type: `select`
- Options: left (`apos-left`), center (`apos-center`), right (`apos-right`)
- Uses `class: true` to add alignment classes

::: info
The styles module includes built-in CSS for the alignment classes:
```css
.apos-left { margin-right: auto }
.apos-center { margin-left: auto; margin-right: auto }
.apos-right { margin-left: auto }
```
These classes are available site-wide and can be overridden at project level.
:::

#### `padding`

Four-sided padding control.

<AposCodeBlock>

```javascript
sectionPadding: {
  preset: 'padding',
  selector: '.section'
}
```

</AposCodeBlock>

- Type: `box`
- Unit: `px`
- Generates: `padding: Tpx Rpx Bpx Lpx`

#### `margin`

Four-sided margin control.

<AposCodeBlock>

```javascript
blockMargin: {
  preset: 'margin',
  selector: '.content-block'
}
```

</AposCodeBlock>

- Type: `box`
- Unit: `px`
- Generates: `margin: Tpx Rpx Bpx Lpx`

#### `border`

Multi-field border controls including width, radius, color, and style.

<AposCodeBlock>

```javascript
cardBorder: {
  preset: 'border',
  selector: '.card'
}
```

</AposCodeBlock>

- Type: `object` (multi-field preset)
- Fields:
  - `active` (boolean) - Enable/disable border
  - `width` (box) - Border width per side
  - `radius` (range) - Border radius 0-32px
  - `color` (color) - Border color
  - `style` (select) - solid/dotted/dashed
- All fields except `active` use conditional display (`if: { active: true }`)

#### `boxShadow`

Multi-field drop shadow controls.

<AposCodeBlock>

```javascript
cardShadow: {
  preset: 'boxShadow',
  selector: '.card'
}
```

</AposCodeBlock>

- Type: `object` (multi-field preset)
- Fields:
  - `active` (boolean) - Enable/disable shadow
  - `x` (range) - X offset -32 to 32px
  - `y` (range) - Y offset -32 to 32px
  - `blur` (range) - Blur 0-32px
  - `color` (color) - Shadow color
- Uses `valueTemplate` to compose final CSS value
- Generates: `box-shadow: Xpx Ypx Blurpx Color`

### Creating custom presets

Create custom presets by extending the `registerPresets()` method:

<AposCodeBlock>

```javascript
export default {
  extendMethods(self) {
    return {
      registerPresets(_super) {
        _super();

        // Define a custom preset
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
                  { label: 'Top to Bottom', value: 'to bottom' },
                  { label: 'Diagonal', value: 'to bottom right' }
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
      }
    };
  },
  styles: {
    add: {
      heroGradient: {
        preset: 'gradient',
        selector: '.hero-section'
      }
    },
    group: {
      backgrounds: {
        label: 'Backgrounds',
        fields: ['heroGradient']
      }
    }
  }
};
```

<template v-slot:caption>
  modules/@apostrophecms/styles/index.js
</template>

</AposCodeBlock>

### Extending built-in presets

Modify existing presets without changing every usage:

<AposCodeBlock>

```javascript
extendMethods(self) {
  return {
    registerPresets(_super) {
      _super();
      
      // Get and modify an existing preset
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

<template v-slot:caption>
  modules/@apostrophecms/styles/index.js
</template>

</AposCodeBlock>

::: warning
Presets must be registered inside the `registerPresets()` method before schema initialization. Attempting to register presets elsewhere will throw an error.
:::

## Organizing the Interface

The styles module uses **field groups** to control how styling controls are organized in the admin interface. Groups affect **only the UI layout**—they do not change how CSS is generated.

Grouping helps content creators navigate large sets of design options by organizing related controls into tabs and sections.

### The grouping model

The styles module supports **two levels of grouping**, plus an optional display modifier:

```
styles.group
├── Top-level groups → Tabs
│   ├── Nested groups → Sections within a tab
│   │   └── inline groups → Visually grouped controls (no navigation)
```

### Top-level groups (tabs)

Top-level groups are defined under `styles.group`. Each top-level group appears as a **tab** in the styles interface.

Use top-level groups to separate major categories such as colors, typography, layout, or effects.

<AposCodeBlock>

```javascript
styles: {
  add: {
    primaryColor: {
      type: 'color',
      label: 'Primary Color',
      selector: ':root',
      property: '--primary-color'
    },
    buttonSpacing: {
      type: 'range',
      label: 'Button Spacing',
      selector: '.btn',
      property: 'margin',
      unit: 'rem'
    }
  },
  group: {
    branding: {
      label: 'Branding',
      fields: ['primaryColor']
    },
    layout: {
      label: 'Layout',
      fields: ['buttonSpacing']
    }
  }
}
```

</AposCodeBlock>

In this example:
- **Branding** and **Layout** appear as separate tabs
- Each tab contains the fields listed in its `fields` array

### Nested groups (sections within tabs)

When a tab contains many controls, you can add **nested groups** to organize fields into labeled sections *within* that tab.

Nested groups are defined using a `group` property inside a top-level group.

<AposCodeBlock>

```javascript
styles: {
  add: {
    lineHeight: { type: 'range', label: 'Line Height' },
    letterSpacing: { type: 'range', label: 'Letter Spacing' },
    headingFont: { type: 'string', label: 'Heading Font' },
    bodyFont: { type: 'string', label: 'Body Font' }
  },
  group: {
    typography: {
      label: 'Typography',
      group: {
        spacing: {
          label: 'Text Spacing',
          fields: ['lineHeight', 'letterSpacing']
        },
        fonts: {
          label: 'Fonts',
          fields: ['headingFont', 'bodyFont']
        }
      }
    }
  }
}
```

</AposCodeBlock>

In this example:
- **Typography** is a tab
- **Text Spacing** and **Fonts** are sections within that tab
- Each section has its own heading and field list

You can freely mix:
- Nested groups
- Direct fields (fields listed directly on the tab)
- Presets and custom fields

### Inline groups (visual grouping only)

An **inline group** is a nested group that uses `inline: true`.

Inline groups **do not create navigation or collapsible sections**. Instead, they visually group related controls together under a small heading within the current section.

<AposCodeBlock>

```javascript
group: {
  typography: {
    label: 'Typography',
    group: {
      spacing: {
        label: 'Text Spacing',
        inline: true,
        fields: ['lineHeight', 'letterSpacing', 'paragraphSpacing']
      }
    }
  }
}
```

</AposCodeBlock>

In this example:
- **Text Spacing** appears as a simple titled grouping
- The fields render inline within the surrounding layout
- No new section or navigation element is created

Think of inline groups as a **visual hint**, not a structural division.

Inline groups are useful when:
- Fields are closely related
- You want to avoid adding another visual section
- Controls should feel lightweight and compact

### Key rules

- **Top-level groups** create tabs
- **Nested groups** create labeled sections inside a tab
- **Inline groups** only affect visual layout, not navigation
- Grouping affects **only the admin UI**, not CSS output
- Grouping behavior in the styles module differs from standard ApostropheCMS schemas

## Advanced Topics

### CSS custom properties

The styles module supports CSS custom properties (variables) for flexible theming:

<AposCodeBlock>

```javascript
accentColor: {
  type: 'color',
  label: 'Site Accent Color',
  selector: ':root',
  property: '--accent-color'
}
```

<template v-slot:caption>
  modules/@apostrophecms/styles/index.js
</template>

</AposCodeBlock>

Then use the variable throughout your CSS:

```css
.button {
  background-color: var(--accent-color);
}

.highlight {
  border-left: 3px solid var(--accent-color);
}
```

### Object field limitations

Object fields are supported in the styles module but cannot be nested within other object fields. This limitation exists because the styles module only iterates one level deep through object fields—it does not recursively process nested object structures.

This means:

- You **can** use object fields at the top level of your styles schema
- You **cannot** use presets within object fields (since presets may themselves be object fields)
- You **cannot** nest object fields within other object fields

Object fields are primarily supported to enable the subfields used in multi-field presets like `border` and `boxShadow`.

### Internationalization

Localize field labels for global teams:

<AposCodeBlock>

```javascript
export default {
  i18n: {
    styleStrings: {
      browser: true,
    },
  },
  styles: {
    add: {
      primaryColor: {
        type: "color",
        label: "styleStrings:primaryColor",
        selector: ":root",
        property: "--primary-color",
      },
    },
    group: {
      colors: {
        label: "styleStrings:colorGroup",
        fields: ["primaryColor"],
      },
    },
  },
};
```

<template v-slot:caption>
  modules/@apostrophecms/styles/index.js
</template>

</AposCodeBlock>

Create translation files in `modules/@apostrophecms/styles/i18n/styleStrings/`:

<AposCodeBlock>

```json
// en.json
{
  "primaryColor": "Primary Brand Color",
  "colorGroup": "Brand Colors"
}
```

<template v-slot:caption>
  modules/@apostrophecms/styles/i18n/styleStrings/en.json
</template>

</AposCodeBlock>

<AposCodeBlock>

```json
// fr.json
{
  "primaryColor": "Couleur Principale de Marque",
  "colorGroup": "Couleurs de Marque"
}
```

<template v-slot:caption>
  modules/@apostrophecms/styles/i18n/styleStrings/fr.json
</template>

</AposCodeBlock>

### Custom CSS generation

For advanced use cases requiring complex CSS transformations or integration with external styling systems, you can override the default CSS generation with custom logic.

To enable custom rendering:

<AposCodeBlock>

```javascript
export default {
  options: {
    serverRendered: true,
  },
  methods(self) {
    return {
      async getStylesheet(doc) {
        // Custom CSS generation logic
        // The doc parameter contains style field values
        // The self.schema provides field configuration
        
        return css;
      },
    };
  },
};
```

<template v-slot:caption>
  modules/@apostrophecms/styles/index.js
</template>

</AposCodeBlock>

::: info
For detailed information on custom rendering methods, parameters, and best practices, see the [Styles Module Technical Reference](#).
:::

## How It Works

The styles module generates CSS from your field values and stores it in the global document for site-wide access.

### Generation and storage flow

1. **Content creator saves**: When editors save style changes in the admin interface
2. **CSS generation**: The module processes field values through the schema to generate CSS
3. **Global storage**: Generated CSS and body classes are stored in the `@apostrophecms/global` document:
   - `stylesStylesheet` - The complete CSS string
   - `stylesClasses` - Array of class names for the `<body>` element
   - `stylesStylesheetVersion` - Cache-busting version identifier
4. **Automatic delivery**: On every page request:
   - CSS is injected via `<link>` tag (cached stylesheet) for guests
   - CSS is injected via `<style>` tag (inline) for logged-in users who may use preview features
   - Body classes are automatically added to the `<body>` element

### Performance and caching

- **Real-time preview**: Changes appear instantly during editing without page refresh
- **Smart caching**: Generated stylesheets are cached with version identifiers for efficient delivery
- **Minimal overhead**: CSS generation only occurs when style values change, not on every page request
- **No template changes needed**: The module automatically handles injection