# Contribution guide

Hello! ApostropheCMS and its open-source ecosystem depend on contributions from the developer community to improve and evolve. The same goes for the Apostrophe documentation.

As you get started keep our [Code of Conduct](https://github.com/apostrophecms/apostrophe/blob/main/CODE_OF_CONDUCT.md) in mind. Put briefly, we need everyone to keep interactions in the Apostrophe Discord, Github threads, or discussions respectful and positive regardless of the identities and/or experiences of those involved.

## How you can help

### Submit PRs for text and code fixes

Even with fancy spell checking IDE plugins, mistakes happen. If you've found spelling mistakes, confusing wording, or typos in code examples, go ahead and submit a pull request fixing them. [The documentation repository is on Github](https://github.com/apostrophecms/a3-docs/) to easily clone and PR.

If there is a bug in example code and you are not sure what the fix is, [open a Github issue](https://github.com/apostrophecms/a3-docs/issues) to let the team know about it.

### Tell us what needs more or better documentation

If you're new to Apostrophe, this would be the biggest help of all. Does the documentation hint at a feature but you need more information? Do you know a feature exists but can't find it anywhere in the documentation? [Please check the Github isssues](https://github.com/apostrophecms/a3-docs/issues) and create an issue asking about the topic if one doesn't already exist.

### Suggest new guides, tutorials, and code recipes

As the ApostropheCMS documentation fills out the core team will be adding sections with short tutorials to accomplish common tasks that are more specific than the feature guides. These will include things like creating widgets that list pieces and configuring services to send emails from the app. [Let us know what you would like to see](https://github.com/apostrophecms/a3-docs/issues).

The core team will get to as many as possible. Some may be better as blog posts or videos, but regardless your ideas will help guide the topics and priorities for documentation.

### Translation?

For now, the Apostrophe documentation is only in English. Beginning translation is in the plans and we definitely will need help doing that. If you are interested in helping translate documentation (not a small job, we know), please reach out to us in [Discord](http://chat.apostrophecms.com) or at [help@apostrophecms.com](mailto:help@apostrophecms.com).

## Documentation writing guide

This writing guide is meant to help maintain consistency in style and structure in the docs. If you are drafting a section of documentation please review this to help make review easier for everyone.

::: info
Some grammar style notes here apply primarily to American English, but can be applied to other languages as well depending on the case.
:::

### "We" are learning together here

Use the second person plural in guides. So instead of saying, "you need to activate the module," it would be "*we* need to activate the module." It might feel odd at first, but it is done so readers feel more like someone is guiding them as a peer rather than instructing them like a teacher.

In reference sections we mostly write in the third person about the APIs, not instructing readers. There are some exceptions where it may be clearer to use the second person "you" than to force the passive voice simply to avoid it.

### Titles

**Page titles and section headings should be written in sentence case.** Most words should be lowercase other than the first word, proper nouns, and other [specific cases](https://apastyle.apa.org/style-grammar-guidelines/capitalization/sentence-case).

Good:
> **How to install Apostrophe on your computer**

Not good:
> **How to Install Apostrophe on Your Computer**

**In most cases, punctuation should not be used at the end of titles.** If the title is a question, exclamation, or quote, it would end in a question mark, exclamation point, or quotation mark, respectively.

### "Levels," "types," and other wording

- **When used as a compound adjective, "project-level" and similar terms should be hyphenated** (e.g., "project-level code"). When referring directly to that layer of work (work done in a project codebase), "project level" is not hyphenated (e.g., "add the file at project level"). English is weird. Generally avoid the latter usage.
- **"Content type" is not hyphenated.**
- **"Front end" and "back end" are not hyphenated.** The dev world will never stop debating this. We have... for now.

#### Layers of a module
  - **"section"**: Refer to top-level properties in module configuration as "sections." For example, `fields` is a section.
  - **"settings"**: Nested module properties that are required, but not top-level (thus "nested"), are "settings." `fields.add`, `fields.group` are "settings."
  - **"options"**: When *not required*, these nested module properties are called "options." Most of these properties are inside the `options` object.

### Text formatting

- The first time a major concept is mentioned in a guide about that concept it should be **bolded**. So we should not bold "page" in the guide about pieces, but we should bold "piece" and "piece type."

### Code style

#### Identify the file for code blocks

Most code in Apostrophe projects belong in particular files. Even if an example is hypothetical (e.g., a `cat` content type) there is a standard file structure. Identifying a file path can help developers know where to put the example code.

When adding code blocks that represent parts of a file, include the location of that file at the beginning of the code block. It should be added in a comment of that file type's style (e.g., `//` for JavaScript, `{# #}` for Nunjucks) and and be relative to the project root.

Nunjucks template example:

``` nunjucks
{# views/layout.html #}
```

JavaScript file example:

```javascript
// modules/@apostrophecms/admin-bar/index.js
```

#### REST APIs

**REST API request types should be written as code:**

Good:
> Make a `GET` request.

Not good:
> Make a GET request.

#### Highlighting lines of code in blocks

For a fun and, more importantly, clear way to identify key lines of code in code blocks, use finger pointing emojis in comment lines.

Example:

```javascript
module.exports = {
  // 👆 Everything inside this is our module configuration.
  extend: '@apostrophecms/piece-type', // 👈 This means we're in a piece type.
  // 👇 Here's where we configure schema fields.
  fields: {
    add: {
      // ...
    }
  }
}
```

**Just don't do it that much.** You will normally not have more than one per code block, if any. In small code blocks it is probably not necessary and could feel excessive. It is more useful in large code blocks that include extra lines of code for added context.

```javascript
add: {
  main: {
    label: 'Main column',
    type: 'area',
    options: {
      max: 1, // 👈 Limits the area to a single image widget.
      widgets: {
        '@apostrophecms/image': {}
      }
    }
  }
}
```

### Screenshots

**Use an 800px by 600px screen size** if you are using a screenshot that represents most of a desktop browser window or the entire window. It should display the user interface well without being so large that the detail is hard to see. A consistent size will give readers a consistent feel and polished impression across examples.
