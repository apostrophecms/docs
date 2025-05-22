---
title: "Consistent Brand Colors in ApostropheCMS Color Fields"
detailHeading: "Tutorial"
url: "/tutorials/consistent-brand-colors-color-fields.html"
content: "Learn how to create a reusable brand color configuration that ensures content editors always have access to approved colors across all color field instances in your ApostropheCMS project."
tags:
  topic: "content modeling"
  type: tutorial
  effort: beginner
---
# Consistent Brand Colors in ApostropheCMS Color Fields

## Why This Matters

Content editors need quick access to approved brand colors without memorizing hex codes or risking off-brand color choices. By creating a centralized color configuration, you ensure brand consistency across all color fields while making future brand updates simple and reliable.

## Creating a Reusable Color Configuration

Create a shared configuration file that defines your brand's color palette. This keeps all color definitions in one place and makes them easily importable across modules.

<AposCodeBlock>

```javascript
// lib/brand-colors.js
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
import brandColors from '../lib/brand-colors.js';

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
        help: 'Choose a color to highlight this article',
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
import brandColors from '../lib/brand-colors.js';

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

**Plan for Updates**: When you need to update brand colors, change them in the central file and they'll automatically update across all fields using the configuration.

<AposCodeBlock>

```javascript
// Good: Clear, organized array with comments
export default [
  '#2563eb', // Primary Brand
  '#374151', // Neutral Dark  
  '#f59e0b'  // Accent Bright
];

// Also valid: Mix of color formats
export default [
  '#2563eb',           // Hex
  'rgb(55, 65, 81)',   // RGB
  'var(--brand-accent)' // CSS Variable
];
```
  <template v-slot:caption>
    lib/brand-colors.js (examples)
  </template>
</AposCodeBlock>

## Conclusion

A centralized brand color configuration eliminates guesswork for content editors and ensures consistent brand application across your site. This simple pattern reduces maintenance overhead while improving the content editing experience.

---

**Related Resources:**
- [ApostropheCMS Color Field Documentation](/reference/field-types/color.html)
- [Content Schema Best Practices](/tutorials/content-schema-best-practices.html)