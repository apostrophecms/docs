---
title: "Building Nested Widgets"
detailHeading: "Tutorial"
url: "/tutorials/building-nested-widgets.html"
content: "Learn how to effectively structure nested widgets in ApostropheCMS to create intuitive content authoring experiences. This guide covers when to use nesting, how to structure widget hierarchies, and best practices for content manager workflows."
tags:
  topic: best practices
  type: tutorial
  effort: beginner
---
# Building Nested Widgets in ApostropheCMS

## Why This Matters & Core Principles

Widget nesting allows you to create sophisticated, reusable content structures while maintaining an intuitive editing experience for content managers. When implemented thoughtfully, nested widgets reduce complexity for editors by grouping related functionality and providing clear content hierarchies.

However, poorly planned nesting can create confusing interfaces that frustrate content managers. The key is understanding when nesting adds value versus when it creates unnecessary complexity.

**Core principles for effective widget nesting:**
- **Logical grouping**: Nest widgets that naturally belong together conceptually
- **Layout separation**: Use container widgets to handle layout concerns while keeping content widgets focused on content
- **Reduced cognitive load**: Use nesting to simplify choices, not complicate them
- **Clear hierarchy**: Maintain obvious parent-child relationships
- **Purposeful organization**: Each level of nesting should serve a specific editorial need

## Understanding Widget Nesting in ApostropheCMS

Widget nesting occurs when one widget contains an `area` field that can hold other widgets. This creates parent-child relationships that can be several levels deep.

```javascript
// Example: A section widget that contains other widgets
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'myproject:contentSection',
    icon: 'view-dashboard-icon'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'myproject:sectionTitle',
        required: true
      },
      backgroundColor: {
        type: 'select',
        label: 'myproject:backgroundColor',
        choices: [
          { label: 'myproject:lightBackground', value: 'light' },
          { label: 'myproject:darkBackground', value: 'dark' },
          { label: 'myproject:brandBackground', value: 'brand' }
        ]
      },
      content: {
        type: 'area',
        label: 'myproject:sectionContent',
        options: {
          widgets: {
            'text-block': {},
            'image-gallery': {},
            'call-to-action': {},
            // Notice: no section widget here to prevent infinite nesting
          }
        }
      }
    }
  }
};
```

This `content-section` widget acts as a container that provides styling and structure while allowing flexible content inside.

## Effective Use Cases for Widget Nesting

### 1. Layout and Styling Containers

**Use Case**: Create reusable layout patterns with consistent styling options.

```javascript
// Two-column layout widget that contains flexible content
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'myproject:twoColumnLayout',
    icon: 'view-column-icon'
  },
  fields: {
    add: {
      columnRatio: {
        type: 'select',
        label: 'myproject:columnRatio',
        choices: [
          { label: 'myproject:equalColumns', value: '50-50' },
          { label: 'myproject:leftWider', value: '60-40' },
          { label: 'myproject:rightWider', value: '40-60' }
        ],
        def: '50-50'
      },
      leftColumn: {
        type: 'area',
        label: 'myproject:leftColumn',
        options: {
          widgets: {
            'text-block': {},
            'image': {},
            'call-to-action': {}
          }
        }
      },
      rightColumn: {
        type: 'area',
        label: 'myproject:rightColumn',
        options: {
          widgets: {
            'text-block': {},
            'image': {},
            'call-to-action': {}
          }
        }
      }
    }
  }
};
```

**Why this works**: Content managers understand the concept of columns and can focus on content rather than layout implementation.

### 2. Complex Content Blocks with Multiple Components

**Use Case**: Create sophisticated content blocks like testimonials with multiple related elements.

```javascript
// Testimonial widget with nested quote and author information
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'myproject:testimonialSection',
    icon: 'format-quote-close-icon'
  },
  fields: {
    add: {
      heading: {
        type: 'string',
        label: 'myproject:sectionHeading'
      },
      testimonials: {
        type: 'area',
        label: 'myproject:testimonials',
        options: {
          widgets: {
            'single-testimonial': {},
            'testimonial-carousel': {}
          },
          max: 1 // Only allow one testimonial display widget
        }
      },
      callToAction: {
        type: 'area',
        label: 'myproject:followUpAction',
        options: {
          widgets: {
            'call-to-action': {},
            'contact-form': {}
          },
          max: 1
        }
      }
    }
  }
};
```

**Why this works**: Groups related elements (heading, testimonials, follow-up action) while allowing flexibility in how testimonials are displayed.

### 3. Conditional Content Structures

**Use Case**: Create widgets that adapt their available options based on content type or user selections.

```javascript
// Hero widget with different content areas based on style selection
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'myproject:heroSection',
    icon: 'image-size-select-large-icon'
  },
  fields: {
    add: {
      heroStyle: {
        type: 'select',
        label: 'myproject:heroStyle',
        choices: [
          { label: 'myproject:imageHero', value: 'image' },
          { label: 'myproject:videoHero', value: 'video' },
          { label: 'myproject:contentOnly', value: 'content' }
        ]
      },
      imageContent: {
        type: 'area',
        label: 'myproject:heroImage',
        if: { heroStyle: 'image' },
        options: {
          widgets: {
            'hero-image': {}
          },
          max: 1
        }
      },
      videoContent: {
        type: 'area',
        label: 'myproject:heroVideo', 
        if: { heroStyle: 'video' },
        options: {
          widgets: {
            'hero-video': {}
          },
          max: 1
        }
      },
      textOverlay: {
        type: 'area',
        label: 'myproject:textOverlay',
        help: 'myproject:overlayHelp', // "Add text that appears over the background"
        if: { 
          $or: [
            { heroStyle: 'image' },
            { heroStyle: 'video' }
          ]
        },
        options: {
          widgets: {
            'hero-text': {},
            'call-to-action': {}
          },
          max: 2
        }
      },
      contentOnlyArea: {
        type: 'area',
        label: 'myproject:heroContent',
        if: { heroStyle: 'content' },
        options: {
          widgets: {
            'text-block': {},
            'call-to-action': {}
          }
        }
      }
    }
  }
};
```

> [!NOTE]
> **Template handling**: With conditional area fields, your template needs to check which areas have content and render them appropriately. You'll typically use template conditionals that mirror your schema conditionals - checking the `heroStyle` value to determine whether to render the `imageContent`, `videoContent`, or `contentOnlyArea` fields.

**Why this works**: Reduces interface complexity by showing only relevant widget options while maintaining flexibility.

## Anti-Patterns to Avoid

### 1. Excessive Nesting Depth
> [!WARNING]
> Avoid structures like: Page → Section → Subsection → Content Block → Text Widget
> 
> This creates a confusing editing experience where content managers lose track of where they are in the hierarchy.

**Solution**: Flatten the structure by combining related functionality into single widgets.

### 2. Circular or Infinite Nesting

**Problem**: Allowing widgets to contain themselves creates potential for infinite nesting.

**Example of what NOT to do:**

<AposCodeBlock>

```javascript
export default {
  // ... section widget config
  fields: {
    add: {
      content: {
        type: 'area',
        options: {
          widgets: {
            'content-section': {}, // This widget can contain itself!
            'text-block': {}
          }
        }
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/content-section-widget/index.js
  </template>
</AposCodeBlock>

> [!CAUTION]
> This allows editors to create sections within sections within sections indefinitely, leading to confusion and potential performance issues.

**Solution**: Carefully control which widgets can appear in nested areas.

### 3. Nesting for Technical Convenience Rather than Editorial Logic

**Problem**: Creating nested structures that make sense technically but confuse content managers.

> [!WARNING]
> **Red flag**: If you're creating a "layout wrapper" widget that doesn't add clear editorial value, reconsider the approach.

**Ask yourself**: 
- Does this nesting level help content managers understand their content better?
- Would a content manager naturally think of their content this way?
- Does this reduce or increase the number of decisions they need to make?

**Solution**: Only nest when it serves a clear editorial purpose that content managers understand.
## Best Practices for Implementation

### 1. Establish Clear Widget Categories

Organize your widgets into logical categories to make nesting decisions easier:

```javascript
// Example widget organization strategy
const widgetCategories = {
  // Container widgets - can hold other widgets
  containers: [
    'content-section',
    'column-layout', 
    'hero-section'
  ],
  
  // Content widgets - focused on specific content types
  content: [
    'text-block',
    'image-gallery', 
    'testimonial',
    'call-to-action'
  ],
  
  // Utility widgets - specific functionality
  utility: [
    'contact-form',
    'social-share',
    'breadcrumbs'  
  ]
};
```

**Rule**: Container widgets should generally only contain content and utility widgets, not other containers.

### 2. Use Meaningful Labels and Help Text

```javascript
export default {
  fields: {
    add: {
      mainContent: {
        type: 'area',
        label: 'myproject:primaryContent',
        help: 'myproject:primaryContentHelp', // "Add the main content for this section"
        options: {
          widgets: {
            'text-block': {},
            'image': {}
          }
        }
      },
      sidebar: {
        type: 'area', 
        label: 'myproject:sidebarContent',
        help: 'myproject:sidebarContentHelp', // "Optional: Add complementary content"
        options: {
          widgets: {
            'call-to-action': {},
            'contact-info': {}
          }
        }
      }
    }
  }
};
```

### 3. Set Appropriate Limits

Control the complexity by setting reasonable limits on nested content:

```javascript
export default {
  fields: {
    add: {
      content: {
        type: 'area',
        options: {
          widgets: {
            'text-block': {},
            'image': {}
          },
          max: 5, // Prevent overwhelming amount of content
          min: 1  // Ensure section has content
        }
      }
    }
  }
};
```

### 4. Consider Mobile Editing Experience

Nested widgets can be particularly challenging on mobile devices:

```javascript
// Consider limiting complexity for better mobile editing
export default {
  fields: {
    add: {
      content: {
        type: 'area',
        options: {
          widgets: {
            'text-block': {},
            'image': {}
            // Avoid complex nested widgets that are hard to edit on mobile
          }
        }
      }
    }
  }
};
```

## Conclusion

Effective widget nesting in ApostropheCMS requires balancing flexibility with simplicity. When implemented thoughtfully, nested widgets create intuitive content authoring experiences that mirror how content managers naturally think about page structure. The key is always prioritizing editorial clarity over technical convenience.

Remember that every level of nesting adds cognitive load for content managers. Make sure each level serves a clear purpose and provides genuine value to the content creation process.

---

**Related Resources:**
- [Areas and Widgets Guide](/guide/areas-and-widgets.html)
- [Area Field Configuration Reference](/reference/field-types/area.html)