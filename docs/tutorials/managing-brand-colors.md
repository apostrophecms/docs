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

## Why This Matters

Content editors need quick access to approved brand colors without memorizing hex codes or risking off-brand color choices. By creating a centralized color configuration, you ensure brand consistency across all color fields while making future brand updates simple and reliable.

## Creating a Reusable Color Configuration

Create a shared configuration file that defines your brand's color palette. This keeps all color definitions in one place and makes them easily importable across modules.

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
    lib/brand-colors.js
  </template>
</AposCodeBlock>

The array of color strings matches exactly what the color field expects for `presetColors`. You can use hex codes, CSS color names, or even CSS variables in this array.

## Using Brand Colors in Your Schemas

Import your brand colors and apply them to any color field. Content editors will see these as preset options in the color picker interface.

<AposCodeBlock>

```javascript
import brandColors from '../../lib/brand-colors.js';

export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article'
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

## Filtering Colors for Specific Use Cases

Sometimes you'll want to limit color choices based on context. You can filter your brand colors for specific fields while maintaining the central configuration.

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
            color.includes('#10b981') || // Success Green
            color.includes('#f59e0b') ||  // Warning Yellow
            color.includes('#ef4444')    // Error Red
          )
        }
      },
      themeColor: {
        type: 'color',
        label: 'Theme Color',
        options: {
          // Only show primary brand colors (first three in array)
          presetColors: brandColors.slice(0, 3)
        }
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

## Best Practices

**Use Descriptive Comments**: Since the array only contains color values, use inline comments to document what each color represents for future developers.

**Keep It Focused**: Include only the colors content editors actually need. Too many options can be overwhelming.

**Mix Formats Carefully**: While you can mix hex, RGB, and CSS variables, stick to one format for consistency unless you have a specific reason to mix them.

## Taking Brand Colors Further with Palette

While the centralized configuration approach works great for developer-defined brand colors, you might want to give content managers the ability to adjust brand colors site-wide without code changes. The [ApostropheCMS Palette extension](https://apostrophecms.com/extensions/palette-extension) makes this possible by creating an in-context interface for editing CSS variables that automatically update across your entire site.

Here's how you can combine both approaches:

<AposCodeBlock>

```javascript
export default [
  '--brand-primary',   // Editable via Palette
  '--brand-secondary', // Editable via Palette
  '--brand-accent',    // Editable via Palette
  '#10b981', // Fixed success color
  '#f59e0b', // Fixed warning color
  '#ef4444'  // Fixed error color
];
```
  <template v-slot:caption>
    lib/brand-colors.js
  </template>
</AposCodeBlock>

> [!IMPORTANT]
> Note that in order to set the color for the swatches using variables, you should just pass the variable name, don't enclose it with `var()`. If you choose to mix CSS variables with fixed color values, make sure your template can handle both cases, e.g. `{% if bgColor.startsWith('--') %}`

With Palette configured to manage these CSS variables, content managers can adjust the primary brand colors in real-time while developers maintain control over functional colors like success and error states. Changes appear instantly across all color fields and throughout the site.

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

> [!NOTE]
> If you don't want those CSS variables to be undefined before the content manager edits them in Palette, you can add fallback values to any modules `/ui/src/index.scss` file. The styles from these stylesheets will be added early in the `<head>`, and Palette injects its stylesheet at the end. The cascade will ensure that the values set in the Palette styles are displayed.

Now content managers can adjust these colors through Palette's in-context interface, and the changes automatically flow through to all your color field presets and any CSS that uses these variables.

[Learn more about ApostropheCMS Palette →](https://apostrophecms.com/extensions/palette-extension)

## Conclusion

A centralized brand color configuration eliminates guesswork for content editors and ensures consistent brand application across your site. This simple pattern reduces maintenance overhead while improving the content editing experience. For sites requiring more dynamic brand control, consider combining this approach with the ApostropheCMS Palette extension for the ultimate flexibility.

---

**Related Resources:**
- [ApostropheCMS Color Field Documentation](/reference/field-types/color.html)
- [ApostropheCMS Palette Extension](https://apostrophecms.com/extensions/palette-extension)