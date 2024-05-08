# Creating custom extensions for Rich Text widgets

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

The [first tutorial](/tutorials/using-tiptap-extensions.html) in this series will demonstrate how to add a pre-existing extension for either Tiptap or ProseMirror to your ApostropheCMS project.  While Apostrophe includes more than 30 Tiptap extensions, there are still more that you can add to enhance your content creator's experience. For example, the official Tiptap [`mention` extension](https://tiptap.dev/api/nodes/mention) that has its own UI element and wouldn't rely and adding a button to the toolbar. This tutorial will also touch on how you can extend the `getBrowserData()` method to add configuration options to your custom extensions and modules.

The [second tutorial](/tutorials/creating-a-text-replacement-extension.html) will show you how to create your own extension to allow content creators to add emojis by typing a colon and the emoji name, for example, `:smiley ` will auto-convert to '😃'. While this example may be useful to you as-is, it provides a good template for creating a text replacement extension customized for your purposes, whether you want to automate content formatting, insert specialized symbols, implement auto-completion, or develop unique content transformations. This tutorial will also introduce key Tiptap components, including `Extension`, a constructor function for creating new extensions; `AddInputRules`, a utility for incorporating input rules into extensions; and `textInputRule`, a specific type of input rule for defining how text input is handled and transformed. These concepts are essential for crafting a variety of text-related behaviors.

The [third tutorial](/tutorials/rich-text-extension-deep-dive.md) delves deeper into customizing the ApostropheCMS rich-text-widget by teaching you how to add buttons to the toolbar and insert menu for triggering extension functionality. In this tutorial, we'll build an extension that not only offers valuable statistics about the number of characters and words in the editor but also implements a character limit feature to illustrate how to use the Tiptap `transaction` object and ProseMirror API. Additionally, this tutorial will explore more advanced Tiptap components like `addCommands()` and `addProseMirrorPlugins`, plus how to handle text being pasted into the editor. Overall, this extension will provide a good stepping-stone for the construction of more complex rich-text-widget extensions.