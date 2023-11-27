# Creating rich-text-widget extensions

The ApostropheCMS `rich-text-widget` is powered by [Tiptap](https://tiptap.dev), a headless wrapper for the [ProseMirror](https://prosemirror.net/) toolkit for building rich-text WYSIWYG editors. Both of these frameworks offer a wide array of ready-made extensions to enhance their capabilities and also offer a rich API to further customize their behavior. In this series of tutorials, we'll explore both how to integrate existing Tiptap extensions, in addition to developing custom extensions to enhance functionality in ApostropheCMS projects.

You can choose to build out each of these extensions from scratch or install the [`rich-text-example-extensions`](https://github.com/apostrophecms/rich-text-example-extensions) repository in your project. The code from this repository can also be cloned locally or examined on the GitHub site. To install use `npm install @apostrophecms/rich-text-example-extensions` in the root of your project. Next, modify your `app.js` to include the bundle and any modules you wish to try.

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

The first tutorial in this series will demonstrate how to add a pre-existing extension for either Tiptap or ProseMirror to your ApostropheCMS project. While this tutorial will get you started quickly, it won't demonstrate how to add an additional button to the toolbar or the insert menu. So, it is mainly useful for text replacement