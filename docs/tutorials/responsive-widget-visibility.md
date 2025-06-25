---
title: "Responsive Widget Visibility Best Practices in ApostropheCMS"
detailHeading: "Tutorial"
url: "/tutorials/responsive-widget-visibility.html"
content: "Learn how to give content editors intuitive control over widget visibility across different screen sizes while maintaining clean, performant code. This guide covers modern CSS approaches, accessibility considerations, and editor-friendly configuration patterns."
tags:
  topic: best practices
  type: tutorial
  effort: beginner
---
# Responsive Widget Visibility Best Practices in ApostropheCMS

## Why This Matters & Core Principles

Content editors regularly need to control how widgets appear across different devices. A hero image that works beautifully on desktop might overwhelm a mobile screen, or detailed charts might be unreadable on small displays. Rather than forcing editors to create duplicate content or compromise their design vision, thoughtful responsive visibility controls let them optimize the experience for each screen size.

The key is providing editor-friendly controls that translate to clean, accessible, and performant CSS—not forcing editors to understand technical concepts like breakpoint pixels or CSS classes.

When implementing responsive widget visibility, prioritize:
- **Editor clarity**: Use device-based language ("Hide on mobile") rather than technical terms
- **Performance**: Generate clean CSS that doesn't impact page load
- **Accessibility**: Ensure hidden content doesn't interfere with screen readers
- **Consistency**: Maintain predictable patterns across all widgets that need responsive behavior

<!-- VIDEO: Responsive Widget Visibility Tutorial -->

## Implementation Philosophy

This tutorial uses a CSS class-based approach rather than inline styles or JavaScript-based solutions for several important reasons:

**Performance and Caching**: CSS classes defined in your stylesheet can be cached by browsers and shared across all widget instances, while inline styles create unique code for every widget occurrence.

**Maintainability**: Centralized CSS rules in your stylesheet are easier to debug, update, and maintain than scattered inline styles throughout your templates.
Editor Predictability: CSS classes create consistent, reliable behavior that editors can depend on, while JavaScript-based solutions can fail or behave unpredictably.

**Accessibility**: CSS-based hiding using `display: none` properly removes content from the accessibility tree, ensuring screen readers and other assistive technologies handle hidden content correctly.

This approach aligns with the principle of configuring robust systems once that content managers can use confidently every day.

## Responsive Design for Content Managers

One approach to responsive design uses CSS media queries to conditionally apply styles based on screen characteristics. A common approach uses viewport width breakpoints that correspond to typical device categories:

- **Mobile**: Up to 768px width
- **Tablet**: 769px to 1024px width
- **Desktop**: 1025px and above

### Defining Consistent Breakpoints

Define your breakpoints once using CSS custom properties to maintain consistency across your entire project:

<AposCodeBlock>

```css
:root {
  --breakpoint-mobile-max: 768px;
  --breakpoint-tablet-min: 769px;
  --breakpoint-tablet-max: 1024px;
  --breakpoint-desktop-min: 1025px;
}
```
  <template v-slot:caption>
    ui/src/scss/variables/_breakpoints.scss
  </template>
</AposCodeBlock>

These variables ensure all your responsive CSS uses identical breakpoint values, preventing inconsistencies that confuse editors and users.

> [!TIP]
> **Pro Extension Integration**: If you're using the [ApostropheCMS Palette extension](https://apostrophecms.com/extensions/palette-extension), you can make these breakpoint values editable by content managers. Add fields to your Palette configuration with `selector: ':root'` and for example, `property: '--breakpoint-mobile-max'` to allow site-wide breakpoint adjustments without code changes.

## Recommended Implementation Pattern

### Schema Configuration

Provide editors with intuitive device-based visibility controls using clear, non-technical language:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Hero Banner'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'myProject:heroTitle',
        required: true
      },
      _image: {
        type: 'relationship',
        label: 'myProject:heroImage'
      },
      // Responsive visibility controls
      hideOnMobile: {
        type: 'boolean',
        label: 'myProject:hideOnMobile',
        help: 'myProject:hideOnMobileHelp'
      },
      hideOnTablet: {
        type: 'boolean',
        label: 'myProject:hideOnTablet',
        help: 'myProject:hideOnTabletHelp'
      },
      hideOnDesktop: {
        type: 'boolean',
        label: 'myProject:hideOnDesktop',
        help: 'myProject:hideOnDesktopHelp'
      }
    },
    group: {
      basics: {
        label: 'myProject:basics',
        fields: ['title', '_image']
      }
      visibility: {
        label: 'myProject:deviceVisibility',
        fields: ['hideOnMobile', 'hideOnTablet', 'hideOnDesktop']
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/hero-banner-widget/index.js
  </template>
</AposCodeBlock>

### Translation Strings

Always use translation strings for user-facing text to support internationalization:

<AposCodeBlock>

```json
{
  "heroTitle": "Hero text",
  "heroImage": "Background image",
  "hideOnMobile": "Hide on mobile devices",
  "hideOnMobileHelp": "Widget will not display on phones and small screens (under 768px)",
  "hideOnTablet": "Hide on tablets",
  "hideOnTabletHelp": "Widget will not display on tablet-sized screens (769px - 1024px)",
  "hideOnDesktop": "Hide on desktop",
  "hideOnDesktopHelp": "Widget will not display on desktop computers and large screens (1025px and above)",
  "deviceVisibility": "Device Visibility"
}
```
  <template v-slot:caption>
    modules/hero-banner-widget/i18n/myProject/en.json
  </template>
</AposCodeBlock>

### Template Implementation

Generate responsive CSS classes based on editor selections, keeping the template clean and semantic:

<AposCodeBlock>

```nunjucks
{% set responsiveClasses = [] %}
{% if data.widget.hideOnMobile %}
  {% set responsiveClasses = (responsiveClasses.push('hide-mobile'), responsiveClasses) %}
{% endif %}
{% if data.widget.hideOnTablet %}
  {% set responsiveClasses = (responsiveClasses.push('hide-tablet'), responsiveClasses) %}
{% endif %}
{% if data.widget.hideOnDesktop %}
  {% set responsiveClasses = (responsiveClasses.push('hide-desktop'), responsiveClasses) %}
{% endif %}

<section class="hero-banner {{ responsiveClasses | join(' ') }}"
  <div class="hero-banner__content">
    <h1 class="hero-banner__title">{{ data.widget.title }}</h1>
    {% if data.widget._image %}
      <div class="hero-banner__image">
        <img 
          src="{{ apos.attachment.url(data.widget._image) }}" 
          srcset="{{ apos.attachment.srcset(data.widget._image) }}" 
          sizes="(max-width: 768px) 100vw, 50vw"
          alt="{{ data.widget._image.alt | escape }}"
        />
      </div>
    {% endif %}
  </div>
</section>
```
  <template v-slot:caption>
    modules/hero-banner/views/widget.html
  </template>
</AposCodeBlock>

### CSS Implementation

Define your responsive visibility classes using the CSS variables established earlier:

<AposCodeBlock>

```scss
// Import your breakpoint variables
@import '../variables/breakpoints';

// Responsive visibility utilities using consistent breakpoints
@media screen and (max-width: var(--breakpoint-mobile-max)) {
  .hide-mobile {
    display: none !important;
  }
}

@media screen and (min-width: var(--breakpoint-tablet-min)) and (max-width: var(--breakpoint-tablet-max)) {
  .hide-tablet {
    display: none !important;
  }
}

@media screen and (min-width: var(--breakpoint-desktop-min)) {
  .hide-desktop {
    display: none !important;
  }
}
```
  <template v-slot:caption>
    ui/src/scss/utilities/_responsive-visibility.scss
  </template>
</AposCodeBlock>

> [!IMPORTANT]
> Using `!important` in utility classes like these is acceptable and sometimes necessary. These classes represent explicit editor intent to hide content, and should override any other display properties that might conflict.

## Advanced: Container-Based Responsive Design

> [!NOTE]
> **Advanced Layouts vs. Editorial Control**: Modern CSS techniques like container queries, CSS Grid, and Flexbox can create responsive layouts that adapt automatically without breakpoints. While these approaches often provide better technical solutions, they can reduce editorial control by making layout behavior "automatic" rather than configurable. When editors need explicit control over widget visibility across devices, the breakpoint-based approach outlined above provides clear, predictable options that editors can understand and control. For layouts where automatic responsive behavior is desired, consider using intrinsic CSS techniques that eliminate the need for visibility controls entirely.

## Accessibility Considerations

### Screen Reader Compatibility

Hidden content should be properly excluded from screen readers. The `display: none` approach correctly removes content from the accessibility tree, unlike `visibility: hidden` or `opacity: 0` which can still be announced by assistive technology.

### Alternative Content Patterns

Consider providing alternative content for different screen sizes rather than simply hiding:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Adaptive Content'
  },
  fields: {
    add: {
      desktopContent: {
        type: 'area',
        label: 'Desktop Content',
        options: {
          widgets: ['@apostrophecms/rich-text', 'image-gallery']
        }
      },
      mobileContent: {
        type: 'area', 
        label: 'Mobile Content',
        options: {
          widgets: ['@apostrophecms/rich-text', 'simple-image']
        }
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/adaptive-content/index.js
  </template>
</AposCodeBlock>

## Performance Considerations

### CSS Organization

Group all responsive visibility utilities in a single file to minimize redundancy and improve caching:

<AposCodeBlock>

```scss
// Import responsive utilities early in your main stylesheet
@import 'utilities/responsive-visibility';

// This ensures the utilities load before component styles
// that might conflict with the visibility rules
```
  <template v-slot:caption>
    ui/src/scss/index.scss
  </template>
</AposCodeBlock>

### Avoiding Inline Styles

Avoid generating responsive CSS as inline styles in widget templates. This creates performance problems and prevents effective caching:

```nunjucks
{# ❌ DON'T: Inline responsive styles #}
<div style="@media screen and (max-width: 768px) { display: none; }">
  
{# ✅ DO: Use CSS classes #}
<div class="hide-mobile">
```

## Framework Integration

### Tailwind CSS

If your project uses Tailwind CSS, leverage its responsive utilities instead of custom classes:

<AposCodeBlock>

```nunjucks
{% set responsiveClasses = [] %}
{% if data.widget.hideOnMobile %}
  {% set responsiveClasses = (responsiveClasses.push('hidden md:block'), responsiveClasses) %}
{% endif %}
{% if data.widget.hideOnTablet %}
  {% set responsiveClasses = (responsiveClasses.push('md:hidden lg:block'), responsiveClasses) %}
{% endif %}
{% if data.widget.hideOnDesktop %}
  {% set responsiveClasses = (responsiveClasses.push('lg:hidden'), responsiveClasses) %}
{% endif %}

<section class="hero-banner {{ responsiveClasses | join(' ') }}">
  <!-- widget content -->
</section>
```
  <template v-slot:caption>
    modules/hero-banner/views/widget.html (Tailwind version)
  </template>
</AposCodeBlock>

### Bootstrap

For Bootstrap projects, use its responsive display utilities:

<AposCodeBlock>

```nunjucks
{% set responsiveClasses = [] %}
{% if data.widget.hideOnMobile %}
  {% set responsiveClasses = (responsiveClasses.push('d-none d-md-block'), responsiveClasses) %}
{% endif %}
{% if data.widget.hideOnTablet %}
  {% set responsiveClasses = (responsiveClasses.push('d-md-none d-lg-block'), responsiveClasses) %}
{% endif %}
{% if data.widget.hideOnDesktop %}
  {% set responsiveClasses = (responsiveClasses.push('d-lg-none'), responsiveClasses) %}
{% endif %}

<section class="hero-banner {{ responsiveClasses | join(' ') }}">
  <!-- widget content -->
</section>
```
  <template v-slot:caption>
    modules/hero-banner/views/widget.html (Bootstrap version)
  </template>
</AposCodeBlock>

## Common Pitfalls to Avoid

### Technical Language in Editor Interface

```javascript
// ❌ DON'T: Use technical terms
breakpoint: {
  type: 'select',
  label: 'Media Query Breakpoint',
  choices: [
    { label: 'max-width: 768px', value: '768' },
    { label: 'min-width: 1024px', value: '1024' }
  ]
}

// ✅ DO: Use clear, device-based language
hideOnMobile: {
  type: 'boolean',
  label: 'Hide on mobile devices',
  help: 'Widget will not display on phones and small screens'
}
```

### Complex Conditional Logic

```javascript
// ❌ DON'T: Force editors to understand relationships
visibility: {
  type: 'select',
  label: 'Visibility Rules',
  choices: [
    { label: 'Mobile only (hide > 768px)', value: 'mobile-only' },
    { label: 'Desktop only (hide < 1024px)', value: 'desktop-only' }
  ]
}

// ✅ DO: Use independent, clear options
hideOnMobile: { type: 'boolean', label: 'Hide on mobile' },
hideOnDesktop: { type: 'boolean', label: 'Hide on desktop' }
```

### Inconsistent Breakpoints

Maintain consistent breakpoint definitions across your entire project by using the CSS custom properties established earlier:

<AposCodeBlock>

```scss
// ❌ DON'T: Hardcode different breakpoints
@media screen and (max-width: 768px) { /* some widgets */ }
@media screen and (max-width: 767px) { /* other widgets */ }

// ✅ DO: Use consistent variables  
@media screen and (max-width: var(--breakpoint-mobile-max)) {
  .hide-mobile { display: none !important; }
}
```
  <template v-slot:caption>
    ui/src/scss/utilities/_responsive-visibility.scss
  </template>
</AposCodeBlock>

## Modern CSS Considerations

While viewport-width breakpoints remain the most editor-friendly approach for general widget visibility, modern CSS offers additional responsive techniques for specific use cases:

**Resolution-based visibility** for detailed graphics:
```css
/* Hide complex charts on low-resolution displays */
@media (max-resolution: 1dppx) {
  .hide-low-resolution { display: none; }
}
```

**User preference-based visibility** for accessibility:
```css
/* Hide animation-heavy widgets for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hide-reduced-motion { display: none; }
}
```

**Intrinsic responsive design** using modern layout properties like `flex`, `grid`, `clamp()`, and `min()` often eliminates the need for breakpoint-based hiding entirely. However, when explicit editor control over widget visibility is needed, the breakpoint approach provides the clearest interface for content managers.

For most ApostropheCMS projects, start with the viewport-based approach outlined above, then consider these advanced techniques for widgets with specific requirements like data visualizations, animations, or high-detail graphics.

## Conclusion

Thoughtful responsive visibility controls transform the content editing experience from frustrating compromises to empowering design choices. By using device-based language, maintaining consistent breakpoints, and generating clean CSS, you give editors the tools they need to create optimal experiences across all screen sizes.

Remember that responsive design is about more than hiding content—it's about crafting intentional experiences for each device context. The best implementations give editors clear control while maintaining excellent performance and accessibility.

---

**Related Resources:**
- [CSS Media Queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries)
- [CSS Container Queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)
- [Help and Placeholder Text Best Practices](/tutorials/snippet/help-placeholder-text-best-practices.html)