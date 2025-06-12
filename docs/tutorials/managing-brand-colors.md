---
title: "Managing Brand Colors"
detailHeading: "Tutorial"
url: "/tutorials/managing-brand-colors.html"
content: "Learn how to create a reusable brand color configuration that ensures content editors always have access to approved colors across all color field instances in your ApostropheCMS project."
tags:
  topic: "best practices"
  type: tutorial
  effort: beginner
---
# Managing Brand Colors in ApostropheCMS Color Fields
Brand consistency is critical for professional websites, but managing colors across a CMS can be challenging. Content editors need quick access to approved brand colors without memorizing hex codes, while developers need a system that scales and adapts when brand guidelines change.

ApostropheCMS color fields support preset color swatches that give editors one-click access to approved colors. This tutorial shows you how to create a centralized brand color system that works across all your color fields and automatically updates existing content when colors change. For teams that need content managers to adjust brand colors without code changes, we'll also explore how the Palette extension provides a complete brand management interface.

<!-- INSERT VIDEO HERE -->

## Why This Matters

Content editors need quick access to approved brand colors without memorizing hex codes or risking off-brand color choices. More importantly, when brand colors change (and they will), you want those changes to flow through your entire site automatically—including content that's already been created.

By using CSS variables with a centralized color configuration, you get true site-wide color management where updating a single value instantly changes colors across all templates, existing content, and future content.

## The CSS Variables Approach (Recommended)

The most powerful approach uses CSS custom properties (CSS variables) that create a true single source of truth for your brand colors. When you update the value of a CSS variable, the change appears instantly everywhere it's used—including in previously saved content.

> [!NOTE]
> **Understanding Mixed Color Usage**: When you configure `presetColors` with CSS variables, content editors see those variables as color swatches in the picker alongside the option to choose custom colors. If an editor selects a preset swatch, the stored value is the CSS variable name (like `--brand-primary`). If they choose a custom color, the stored value is the actual color (like `#ff0000` or `rgb(255, 0, 0)`). Your templates need to handle both cases—we'll show you how in [Step 4](/tutorials/managing-brand-colors.html#step-4-using-colors-in-your-templates).

### Step 1: Define Your Brand Colors as CSS Variables

Add your brand colors as CSS custom properties to your main stylesheet:

<AposCodeBlock>

```css
/* Define your brand colors as CSS variables */
:root {
  --brand-primary: #2563eb;
  --brand-secondary: #64748b;
  --brand-accent: #f97316;
  --brand-success: #10b981;
  --brand-warning: #f59e0b;
  --brand-error: #ef4444;
}
```
  <template v-slot:caption>
    ui/src/variables.scss
  </template>
</AposCodeBlock>

### Step 2: Create Your JavaScript Configuration

Create a shared configuration file that references your CSS variables. This makes them available as preset colors in all your color fields and easily imported across modules:

<AposCodeBlock>

```javascript
export default [
  '--brand-primary',   // Primary Blue
  '--brand-secondary', // Secondary Gray
  '--brand-accent',    // Accent Orange
  '--brand-success',   // Success Green
  '--brand-warning',   // Warning Yellow
  '--brand-error'      // Error Red
];
```
  <template v-slot:caption>
    lib/brand-colors.js
  </template>
</AposCodeBlock>

> [!IMPORTANT]
> Using CSS Variables in Color Fields: When setting up `presetColors` with CSS variables, use just the variable name (`--brand-primary`) without the `var()` wrapper. The color field handles the CSS function internally.

### Step 3: Apply to Your Schemas

Import your brand colors and apply them to any color field. Content editors will see these as preset color swatches in the color picker interface:

<AposCodeBlock>

```javascript
import brandColors from '../../lib/brand-colors.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Card'
  },
  fields: {
    add: {
      accentColor: {
        type: 'color',
        label: 'Accent Color',
        help: 'Choose a color to highlight this article title',
        options: {
          presetColors: brandColors
        }
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        options: {
          presetColors: brandColors
        }
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

> [!TIP]
> **Enforcing Brand Compliance**: To prevent editors from straying from approved colors, you can restrict the color picker interface by disabling custom color options. Set `options.disableSpectrum: true` to remove the color spectrum, `options.disableAlpha: true` to disable transparency controls, and `options.disableFields: true` to hide hex/RGB input fields. This leaves only your preset swatches available, ensuring perfect brand compliance. See the [documentation](/reference/field-types/color.html) for more info.

### Step 4: Using Colors in Your Templates

When using CSS variables as preset swatches, content editors can choose either:
- A preset swatch (stored as `--brand-primary`)
- A custom color (stored as `#ff0000` or `rgb(255, 0, 0)`)

Your templates need to handle both cases. Check if the value starts with `--` to determine if it's a CSS variable:

<AposCodeBlock>

```nunjucks
<div class="article-card" 
     style="background-color: {% if data.piece.backgroundColor.startsWith('--') %}var({{ data.piece.backgroundColor }}){% else %}{{ data.piece.backgroundColor }}{% endif %};">
  <h2 style="color: {% if data.piece.accentColor.startsWith('--') %}var({{ data.piece.accentColor }}){% else %}{{ data.piece.accentColor }}{% endif %};">
    {{ data.piece.title }}
  </h2>
  <p>{{ data.piece.content }}</p>
</div>
```
  <template v-slot:caption>
    modules/article/views/show.html
  </template>
</AposCodeBlock>

For cleaner templates, you can create a macro to handle this logic:

<AposCodeBlock>

```nunjucks
{# Create a reusable macro for color values #}
{% macro colorValue(color) %}
  {%- if color and color.startsWith('--') -%}
    var({{ color }})
  {%- else -%}
    {{ color }}
  {%- endif -%}
{% endmacro %}

<div class="article-card" style="background-color: {{ colorValue(data.piece.backgroundColor) }};">
  <h2 style="color: {{ colorValue(data.piece.accentColor) }};">
    {{ data.piece.title }}
  </h2>
  <p>{{ data.piece.content }}</p>
</div>
```
  <template v-slot:caption>
    modules/article/views/show.html
  </template>
</AposCodeBlock>

**How This Works:**
- CSS variable swatches: `--brand-primary` becomes `var(--brand-primary)`
- Custom colors: `#ff0000` or `rgb(255, 0, 0)` remain unchanged
- The conditional ensures both types work correctly in your CSS

### The Power of This Approach

Now when you need to update colors, change a single CSS variable:

```css
:root {
  --brand-primary: #1d4ed8; /* Updated from #2563eb */
}
```

This instantly updates the color everywhere it appears across your site—in new content, existing content, and any CSS that references the variable.

> [!IMPORTANT]
> **Managing Complexity**: Using CSS variables creates a dependency between your CSS and JavaScript configurations. Your JavaScript config references the variable names (like `--brand-primary`) while your CSS defines their values. Changes to CSS variable names must be coordinated with your JavaScript config. We recommend establishing team conventions for managing this coupling and documenting the relationship clearly.

## Filtering Colors for Specific Use Cases

You can still filter your brand colors for specific fields while maintaining the central configuration. This works the same way whether you're using CSS variables or hex codes:

<AposCodeBlock>

```javascript
import brandColors from '../../lib/brand-colors.js';

export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Event'
  },
  fields: {
    add: {
      statusColor: {
        type: 'color',
        label: 'Status Color',
        help: 'Color for event status indicators',
        options: {
          // Only show status-related colors
          presetColors: brandColors.filter(color =>
            color.includes('--brand-success') || // Success Green
            color.includes('--brand-warning') ||  // Warning Yellow
            color.includes('--brand-error')    // Error Red
          )
        }
      },
      themeColor: {
        type: 'color',
        label: 'Theme Color',
        options: {
          // Only show primary brand colors
          presetColors: brandColors.slice(0, 3) // Primary, Secondary, Accent
        }
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/event/index.js
  </template>
</AposCodeBlock>

## Advanced: Using Semantic Tokens for Better Organization

As your project grows, you can make color management more maintainable by storing both names and values. This makes filtering more explicit and less brittle:

<AposCodeBlock>

```javascript
export const brandColors = [
  { name: 'primary', value: '--brand-primary' },
  { name: 'secondary', value: '--brand-secondary' },
  { name: 'accent', value: '--brand-accent' },
  { name: 'success', value: '--brand-success' },
  { name: 'warning', value: '--brand-warning' },
  { name: 'error', value: '--brand-error' }
];

export const brandColorValues = brandColors.map(c => c.value);
```
  <template v-slot:caption>
    lib/brand-colors.js
  </template>
</AposCodeBlock>

For fields that allow all brand colors:

```javascript
import { brandColorValues } from '../../lib/brand-colors.js'
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Card'
  },
  fields: {
    add: {
      accentColor: {
        type: 'color',
        label: 'Accent Color',
        help: 'Choose a color to highlight this article title',
        options: {
          presetColors: brandColorValues
        }
      },
      // ...remainder of code
```

### Filtering using names

Now you can filter by semantic names rather than array positions:

<AposCodeBlock>

```javascript
import { brandColors } from '../../lib/brand-colors.js';

export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Event'
  },
  fields: {
    add: {
      statusColor: {
        type: 'color',
        label: 'Status Color',
        help: 'Color for event status indicators',
        options: {
          presetColors: brandColors
            .filter(c => ['success', 'warning', 'error'].includes(c.name))
            .map(c => c.value)
        }
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/event/index.js
  </template>
</AposCodeBlock>

## Alternative: Static Color Values

In some cases, you might prefer using static hex codes instead of CSS variables. This approach is simpler to manage but doesn't provide automatic updates to existing content.

**Use static colors when:**
- Colors truly never change after launch
- You need email template compatibility
- You're integrating with third-party tools that need actual color values
- You want to avoid the CSS/JavaScript coordination complexity

<AposCodeBlock>

```javascript
export default [
  '#2563eb', // Primary Blue
  '#64748b', // Secondary Gray
  '#f97316', // Accent Orange
  '#10b981', // Success Green
  '#f59e0b', // Warning Yellow
  '#ef4444'  // Error Red
];
```
  <template v-slot:caption>
    lib/static-brand-colors.js
  </template>
</AposCodeBlock>

> [!NOTE]
> With static colors, changing the hex values in your configuration will update the available swatches for editors going forward, but documents that already have color values saved will not automatically update.

## Taking Brand Colors Further with Palette

While the centralized configuration approach works great for developer-defined brand colors, you might want to give content managers the ability to adjust brand colors site-wide without code changes. The [ApostropheCMS Palette extension](https://apostrophecms.com/extensions/palette-extension) makes this possible by creating an in-context interface for editing CSS variables that automatically update across your entire site.

When combined with CSS variables, Palette allows content managers to safely update brand colors site-wide without code changes or manually republishing content.

You brand colors config file remains the same, exporting an array of either the values alone, or the named values. Your Nunjucks template and schema fields using the `brandColorValues` also remain the same.

In the Palette configuration, you add a field for each CSS variable you want to set with `:root` as the `selector`:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      brandPrimary: {
        type: 'color',
        label: 'Primary Brand Color',
        selector: ':root',
        property: '--brand-primary'
      },
      brandSecondary: {
        type: 'color',
        label: 'Secondary Brand Color',
        selector: ':root',
        property: '--brand-secondary'
      },
      brandAccent: {
        type: 'color',
        label: 'Accent Brand Color',
        selector: ':root',
        property: '--brand-accent'
      }
    },
    group: {
      brandColors: {
        label: 'Brand Colors',
        fields: ['brandPrimary', 'brandSecondary', 'brandAccent']
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms-pro/palette/index.js
  </template>
</AposCodeBlock>

> [!TIP]
> To prevent CSS variables from being undefined before content managers edit them in Palette, add fallback values to your `/ui/src/index.scss` file. Palette's styles will override these defaults through CSS cascade.

## Best Practices

**Document Dependencies**: When using CSS variables, clearly document the relationship between your CSS and JavaScript configurations. Establish team conventions for managing changes.

**Use Descriptive Names**: Whether using CSS variables or hex codes, use clear, semantic names that communicate purpose, not just appearance.

**Keep It Focused**: Include only the colors content editors actually need. Too many options can be overwhelming.

**Plan for Change**: Even if you start with static colors, structure your configuration to make upgrading to CSS variables straightforward later.

## Conclusion

CSS variables provide the most powerful approach to brand color management in ApostropheCMS, enabling true site-wide color control where changes instantly flow through all content—past, present, and future. While this approach requires coordinating CSS and JavaScript configurations, the benefits of automatic content updates typically outweigh the additional complexity.

For simpler projects or specific constraints, static color values remain a valid choice. The key is choosing the approach that best fits your project's needs and team capabilities.

---

**Related Resources:**
- [ApostropheCMS Color Field Documentation](/reference/field-types/color.html)
- [ApostropheCMS Palette Extension](https://apostrophecms.com/extensions/palette-extension)