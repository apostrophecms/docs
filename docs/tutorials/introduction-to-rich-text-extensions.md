# Creating rich-text-widget extensions

The ApostropheCMS `rich-text-widget` is powered by [Tiptap](https://tiptap.dev), a headless wrapper for the [ProseMirror](https://prosemirror.net/) toolkit for building rich-text WYSIWYG editors. Both of these frameworks offer a wide array of ready-made extensions to enhance their capabilities and also offer a rich API to further customize their behavior. In this article, we'll explore how to both integrate existing Tiptap extensions and develop custom ones to enhance functionality in ApostropheCMS projects.

Rather than starting from scratch, we are going to use the [`rich-text-example-extensions`](https://github.com/apostrophecms/rich-text-example-extensions) repository. The code from this repository can be cloned locally or examined on the GitHub site. You can also install this extension into an Apostrophe project to see the functionality. To install use `npm install @apostrophecms/rich-text-example-extensions` in the root of your project. Next, modify your `app.js` to include the bundle and any modules you wish to try.

<AposCodeBlock>

```javascript
require('apostrophe')({
  shortName: 'my-project',
  // Activate the bundle
  bundles: [ '@apostrophecms/rich-text-example-extensions' ],
  modules: {
    // The typography module
    '@apostrophecms/typography': {},
    // The smilies module
    '@apostrophecms/smilies': {},
    // The character count module
    '@apostrophecms/characterCount': {}
  }
});
```

<template v-slot:caption>
  app.js
</template>
</AposCodeBlock>



