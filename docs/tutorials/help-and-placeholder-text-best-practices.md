---
title: "Help and Placeholder Text Best Practices in ApostropheCMS"
detailHeading: "Tutorial"
url: "/tutorials/snippet/help-placeholder-text-best-practices.html"
content: "Learn how to create intuitive schema fields with effective help text, placeholders, and tooltips that improve content creation workflows in ApostropheCMS. This guide covers internationalization, accessibility, and practical examples to enhance editor experience."
tags:
  topic: best practices
  type: tutorial
  effort: beginner
---
# Help and Placeholder Text Best Practices in ApostropheCMS

## Why This Matters & Core Principles

The content editing experience is shaped not just by the fields you create, but also by the guidance you provide alongside them. Well-crafted help text, placeholders, and tooltips significantly reduce confusion, minimize errors, and increase content manager confidence. Developers often overlook these details, but they're crucial for day-to-day content management.

When implementing field guidance in your ApostropheCMS project, prioritize:
- **Clarity**: Use concise, straightforward language that avoids technical jargon
- **Consistency**: Maintain a uniform style and tone across all help elements
- **Context**: Provide guidance that anticipates common questions in each specific situation
- **Localization**: Design all text to support multiple languages via translation strings
- **Accessibility**: Ensure guidance is available to all users including those with assistive technologies

<!-- VIDEO: Field Help Text Best Practices Tutorial -->

## Understanding Field Guidance Components

ApostropheCMS provides several ways to guide content editors through their work:

1. **Help text**: Explanatory text below a field label that provides context or instructions
2. **Placeholder text**: Hint text inside selected empty schema fields that suggests the expected input
3. **Field labels**: The primary identifier for each field (always required)

Each component serves a specific purpose in guiding editors through content creation.

## Implementing Effective Help Text

Help text appears directly below the field label, providing context about a field's purpose or usage guidelines. This is the primary method for delivering guidance to content editors.

### Basic Implementation

Always use translation strings for help text to support localization:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      metaDescription: {
        type: 'string',
        label: 'myproject:metaDescription',
        help: 'myproject:metaDescriptionHelp',
        textarea: true,
        max: 160
      }
    }
  }
};
```
<template v-slot:caption>
  modules/article/index.js
</template>
</AposCodeBlock>

Then define your translated strings in a localization file:

<AposCodeBlock>

```json
{
  "metaDescription": "Meta Description",
  "metaDescriptionHelp": "A brief summary (max 160 characters) describing the page content for search engines. This text may appear in search results."
}
```
<template v-slot:caption>
  modules/myproject/i18n/en/myproject.json
</template>
</AposCodeBlock>

### Using HTML in Help Text

For more complex guidance that requires formatting, ApostropheCMS provides the `htmlHelp` option. This allows you to include HTML markup in your help text. You should only include either `help` or `htmlHelp`, not both:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      imageAltText: {
        type: 'string',
        label: 'myproject:imageAltText',
        htmlHelp: 'myproject:imageAltTextHtmlHelp'
      }
    }
  }
};
```
<template v-slot:caption>
  modules/article-image/index.js
</template>
</AposCodeBlock>

With corresponding translation strings:

<AposCodeBlock>

```json
{
  "imageAltText": "Alt Text",
  "imageAltTextHtmlHelp": "<p>Good alt text should:</p><ul><li>Be specific and descriptive</li><li>Convey the image's purpose</li><li>Be under 125 characters</li><li>Not start with 'Image of' or 'Picture of'</li></ul>"
}
```
<template v-slot:caption>
  modules/myproject/i18n/en/myproject.json
</template>
</AposCodeBlock>

Some effective uses for `htmlHelp`:
- Providing step-by-step instructions
- Displaying formatted lists of best practices or requirements
- Including multiple paragraphs of guidance for complex fields
- Highlighting important warnings or recommendations

### Best Practices for Help Text

1. **Keep it concise**: Aim for 1-2 short sentences that provide immediate clarity
2. **Include technical constraints**: Mention character limits, formatting requirements, or other constraints
3. **Explain the purpose**: State why this field matters and how it will be used
4. **Avoid technical jargon**: Use terminology familiar to your content editors
5. **Use active voice**: "Enter your headline" is clearer than "Headline should be entered"

> [!TIP]
> When a field has both character limits and guidance, combine them in the help text rather than relying solely on the UI character counter: "Brief description for social sharing (5-10 words recommended, 30 words maximum)."

## Using Placeholder Text Effectively

Placeholder text appears inside empty fields, suggesting the type of content expected. It disappears when the user begins typing. 

> [!NOTE]
> Placeholders are only supported for specific field types: email, float, integer, string, and url.

### Implementation Example

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      ctaButtonText: {
        type: 'string',
        label: 'myproject:ctaButtonText',
        help: 'myproject:ctaButtonTextHelp',
        placeholder: 'myproject:ctaButtonTextPlaceholder'
      }
    }
  }
};
```
<template v-slot:caption>
  modules/call-to-action/index.js
</template>
</AposCodeBlock>

With corresponding translation strings:

<AposCodeBlock>

```json
{
  "ctaButtonText": "Button Text",
  "ctaButtonTextHelp": "The text displayed on the action button.",
  "ctaButtonTextPlaceholder": "Learn More"
}
```
<template v-slot:caption>
  modules/myproject/i18n/en/myproject.json
</template>
</AposCodeBlock>

### When to Use Placeholder Text

Placeholder text works best in these scenarios:
- **Showing format examples**: Phone numbers, dates, product codes
- **Suggesting common values**: "Learn More", "Subscribe", "Download"
- **Illustrating syntax**: How hashtags or other special formatting should look

### Placeholders and Accessibility

While placeholders can be helpful, they have accessibility limitations:
- They disappear when typing begins
- They may have insufficient color contrast
- Screen readers handle them inconsistently

**For this reason, never use placeholders as the only way to convey essential information.** Always include critical guidance in the help text or label.

## Implementing Tooltips

Tooltips provide additional information that appears on hover or focus, typically triggered by a small icon next to a field label.

### Basic Implementation

ApostropheCMS automatically creates a tooltip when you provide both `help` text and an `htmlHelp` property:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      imageAltText: {
        type: 'string',
        label: 'myproject:imageAltText',
        help: 'myproject:imageAltTextHelp',
        htmlHelp: 'myproject:imageAltTextHtmlHelp'
      }
    }
  }
};
```
<template v-slot:caption>
  modules/article-image/index.js
</template>
</AposCodeBlock>

When both properties are provided, the `help` text appears below the field as usual, while the `htmlHelp` content is accessible via a tooltip icon that appears next to the field label.

With corresponding translation strings:

<AposCodeBlock>

```json
{
  "imageAltText": "Alt Text",
  "imageAltTextHelp": "Describe the image for screen readers and SEO.",
  "imageAltTextHtmlHelp": "<p>Good alt text should:</p><ul><li>Be specific and descriptive</li><li>Convey the image's purpose</li><li>Be under 125 characters</li><li>Not start with 'Image of' or 'Picture of'</li></ul>"
}
```
<template v-slot:caption>
  modules/myproject/i18n/en/myproject.json
</template>
</AposCodeBlock>

> [!IMPORTANT]
> Only use HTML in the `htmlHelp` property. The `help` property should contain plain text only. This separation ensures accessibility and proper formatting.

### When to Use Tooltips

Use tooltips for:
- **Detailed examples** that would clutter the main help text
- **Additional context** that only some editors might need
- **Step-by-step instructions** for complex tasks
- **Complex formatting rules** with multiple bullet points

### Accessibility Considerations for Tooltips

Tooltips must be accessible to all users:
- Ensure they can be accessed via keyboard (not just mouse hover)
- Make sure the tooltip content is readable by screen readers
- Maintain sufficient color contrast
- Avoid overly long tooltip content that might be difficult to read quickly

## Field Label Best Practices

Although labels are required for all fields, their quality significantly impacts the editing experience:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      // Less helpful label
      img: {
        type: 'attachment',
        label: 'myproject:image'
      },
      
      // More helpful label
      heroImage: {
        type: 'attachment',
        label: 'myproject:heroImage',
        help: 'myproject:heroImageHelp'
      }
    }
  }
};
```
<template v-slot:caption>
  modules/homepage/index.js
</template>
</AposCodeBlock>

### Field Label Guidelines

1. **Be specific**: Use precise terms that indicate the field's purpose ("Hero Image" vs. "Image")
2. **Maintain consistency**: Use the same terminology across similar fields
3. **Avoid technical terms**: Write labels from the content editor's perspective
4. **Keep it concise**: Aim for 1-3 words that clearly identify the field
5. **Use sentence case**: Capitalize the first word only, unless using proper nouns

## Comprehensive Examples

Let's explore some well-crafted fields that make excellent use of help text, placeholders, and tooltips:

### Example 1: SEO Fields

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      metaTitle: {
        type: 'string',
        label: 'myproject:seoTitle',
        help: 'myproject:seoTitleHelp',
        placeholder: 'myproject:seoTitlePlaceholder',
        htmlHelp: 'myproject:seoTitleHtmlHelp',
        max: 60
      },
      metaDescription: {
        type: 'string',
        label: 'myproject:seoDescription',
        help: 'myproject:seoDescriptionHelp',
        placeholder: 'myproject:seoDescriptionPlaceholder',
        textarea: true,
        max: 160
      }
    }
  }
};
```
<template v-slot:caption>
  modules/seo-fields/index.js
</template>
</AposCodeBlock>

Translation strings:

<AposCodeBlock>

```json
{
  "seoTitle": "SEO Title",
  "seoTitleHelp": "The page title shown in search results (max 60 characters).",
  "seoTitlePlaceholder": "Product Name | Your Brand",
  "seoTitleHtmlHelp": "<p>Best practices for SEO titles:</p><ul><li>Include primary keyword near the beginning</li><li>Make each page title unique</li><li>Keep length under 60 characters</li><li>Include your brand name</li></ul>",
  
  "seoDescription": "SEO Description",
  "seoDescriptionHelp": "A compelling summary that appears in search results (max 160 characters).",
  "seoDescriptionPlaceholder": "Discover our award-winning product that helps you accomplish your goals faster and with less effort."
}
```
<template v-slot:caption>
  modules/myproject/i18n/en/myproject.json
</template>
</AposCodeBlock>

### Example 2: Rich Text Field with Specific Instructions

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      productDescription: {
        type: 'area',
        label: 'myproject:productDescription',
        help: 'myproject:productDescriptionHelp',
        htmlHelp: 'myproject:productDescriptionHtmlHelp',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: [
                'styles',
                'bold',
                'italic',
                'link',
                'bulletList',
                'orderedList'
              ]
            }
          }
        }
      }
    }
  }
};
```
<template v-slot:caption>
  modules/product/index.js
</template>
</AposCodeBlock>

Translation strings:

<AposCodeBlock>

```json
{
  "productDescription": "Product Description",
  "productDescriptionHelp": "Detailed product information including features and benefits.",
  "productDescriptionHtmlHelp": "<p>Effective product descriptions should:</p><ul><li>Lead with key benefits</li><li>Include all essential features</li><li>Use short paragraphs and bullet points</li><li>Address common customer questions</li><li>Include dimensions and specifications</li></ul>"
}
```
<template v-slot:caption>
  modules/myproject/i18n/en/myproject.json
</template>
</AposCodeBlock>

## Conditional Help Text for Complex Fields

For fields with complex behavior based on different scenarios, consider using conditional help text that changes based on the current context:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      redirectType: {
        type: 'select',
        label: 'myproject:redirectType',
        help: 'myproject:redirectTypeHelp',
        choices: [
          {
            label: 'myproject:redirectTypeInternal',
            value: 'internal'
          },
          {
            label: 'myproject:redirectTypeExternal',
            value: 'external'
          }
        ]
      },
      redirectUrl: {
        type: 'string',
        label: 'myproject:redirectUrl',
        htmlHelp: 'myproject:redirectUrlHtmlHelp',
        if: {
          redirectType: 'external'
        }
      },
      internalPage: {
        type: 'relationship',
        label: 'myproject:internalPage',
        help: 'myproject:internalPageHelp',
        withType: '@apostrophecms/page',
        if: {
          redirectType: 'internal'
        }
      }
    }
  }
};
```
<template v-slot:caption>
  modules/redirect-page/index.js
</template>
</AposCodeBlock>

This example uses the `if` option to show different fields based on the selected redirect type, each with its own specific guidance.

## Localization Best Practices

### Namespace Your Translation Strings

Always use a custom namespace prefix for your translation strings to avoid conflicts with core ApostropheCMS strings:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      authorBio: {
        type: 'string',
        label: 'myproject:authorBio',
        help: 'myproject:authorBioHelp',
        textarea: true
      }
    }
  }
};
```
<template v-slot:caption>
  modules/author/index.js
</template>
</AposCodeBlock>

### Organize Translation Files Logically

Group related translations in themed files to make maintenance easier:

<AposCodeBlock>

```
modules/
  myproject/
    i18n/
      en/
        general.json      // Common UI elements
        seo.json          // SEO-related field labels and help
        media.json        // Image and file upload guidance
        product.json      // Product-specific field text
```
</AposCodeBlock>

### Keep Translation Keys Consistent

Use a consistent naming pattern for related translations:

<AposCodeBlock>

```json
{
  "authorName": "Author Name",
  "authorNameHelp": "Full name of the content author.",
  "authorNamePlaceholder": "Jane Smith",
  
  "authorTitle": "Author Title",
  "authorTitleHelp": "Professional title or position.",
  "authorTitlePlaceholder": "Senior Editor"
}
```
<template v-slot:caption>
  modules/myproject/i18n/en/author.json
</template>
</AposCodeBlock>

## Testing Your Guidance

Regularly test your field guidance by asking these questions:
1. Would a new content editor understand what to enter in this field based on the provided guidance?
2. Is all critical information available even if placeholder text isn't visible?
3. Is the guidance accessible to users of assistive technologies?
4. Does the help text and other guidance remain clear when translated to other languages?

> [!TIP]
> Consider conducting brief usability sessions where new or potential content editors attempt to create content without prior training. Their questions and hesitations can reveal where additional guidance is needed.

## Conclusion

Thoughtful implementation of help text, placeholders, and tooltips transforms the content editing experience from confusing to intuitive. By following these best practices, you create an environment where content managers can work confidently and efficiently.

Well-crafted field guidance reduces training time, prevents errors, and ultimately leads to higher quality content on your site. Remember that small improvements to frequently used interfaces can significantly impact overall satisfaction with your CMS implementation.

---

**Related Resources:**
- [ApostropheCMS 4.x Schema Field Types](/reference/field-types/index.md)
- [ApostropheCMS Localization Guide](/guide/localization/static.html)
- [Best Practices for Admin Bar Setup](/tutorials/snippet/admin-bar-best-practices.html)
- [Admin-bar Customization in Our Tutorial Project](/tutorials/admin-ui.md)