---
title: "Help and Placeholder Text Best Practices in ApostropheCMS"
detailHeading: "Tutorial"
url: "/tutorials/help-and-placeholder-text-best-practices.html"
content: "Learn how to create intuitive schema fields with effective help text, placeholders, and tooltips that improve content creation workflows in ApostropheCMS. This guide covers internationalization, accessibility, and practical examples to enhance editor experience."
tags:
  topic: best practices
  type: tutorial
  effort: beginner
---
# Help and Placeholder Text Best Practices in ApostropheCMS

::: tip Howdy! 👋🏻
This tutorial is available in textual and video forms. Watch the video and use this page to copy code into your project, or continue reading if you prefer. Of course, you can also do both!
:::

<iframe width="560" height="315" src="https://www.youtube.com/embed/Zuj-_UDMzNU?si=Bw1DoQ-2knJSfLZW" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Why This Matters & Core Principles

Ever had a content editor ask, “What does this field mean?” You’re not alone.

In ApostropheCMS, how you label fields — and the help you give editors through placeholders and help text — directly shapes their experience. Clear, consistent field guidance doesn’t just reduce errors and support accessibility; it builds trust and confidence for anyone using the CMS.

This short guide shows you how to write helpful labels, implement localized help text, and use placeholders where appropriate — so your projects are easier to use and faster to train people on.

When implementing field guidance in your ApostropheCMS project, prioritize:
- **Clarity**: Use concise, straightforward language that avoids technical jargon
- **Consistency**: Maintain a uniform style and tone across all help elements
- **Context**: Provide guidance that anticipates common questions in each specific situation
- **Localization**: Design all text to support multiple languages via translation strings
- **Accessibility**: Ensure guidance is available to all users including those with assistive technologies

<!-- VIDEO: Field Help Text Best Practices Tutorial -->

## Types of Field Guidance in ApostropheCMS

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

### Best Practices for Writing Help Text

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

## Field Label Writing Tips

Although labels are required for all fields, their quality significantly impacts the editing experience:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      // Less helpful label
      img: {
        type: 'attachment',
        label: 'Image'
      },
      // More helpful label
      heroImage: {
        type: 'attachment',
        label: 'Hero image',
        help: 'Large banner image displayed prominently at the top of the page. Recommended size: 1920x1080 pixels for best quality across devices.'
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/home-page/index.js
  </template>
</AposCodeBlock>

### Field Label Guidelines

1. **Be specific**: Use precise terms that indicate the field's purpose ("Hero image" vs. "Image")
2. **Maintain consistency**: Use the same terminology across similar fields
3. **Avoid technical terms**: Write labels from the content editor's perspective
4. **Keep it concise**: Aim for 1-3 words that clearly identify the field
5. **Use sentence case**: Capitalize the first word only, unless using proper nouns

## Conclusion

Thoughtful implementation of help text, placeholders, and labels transforms the content editing experience from confusing to intuitive. This reduces training time, prevents errors, and ultimately leads to higher quality content on your site. Remember that small improvements to frequently used interfaces can significantly impact overall satisfaction with your CMS implementation.

---

**Related Resources:**
- [ApostropheCMS schema field types](/reference/field-types/index.md)
- [ApostropheCMS localization namespacing](/guide/localization/static.html#using-namespaces)