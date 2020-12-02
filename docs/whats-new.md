---
title: "New in A3"
---

# A Brand New Apostrophe

Apostrophe 3 introduces a number of new features for developers and content-editors. Its been re-engineered from the ground-up to provide a best-in-class experience for organizations large and small.

### 100% RESTful Headless APIs 
While A2 had custom APIs and a separate `apostrophe-headless` module, A3 is powered by RESTful APIs from the ground up.

### New Editing Experience
Powered by [Vue](https://vuejs.org/), the new editing experience is much faster than in A2. We've completely overhauled the design and UX with superior editor interactions.

### New Rich Text Editor
A3 uses the [tiptap](https://tiptap.dev/) rich text editor, a modern Vue-based editor powered by [ProseMirror](https://prosemirror.net/). ProseMirror is a rich text editing framework embraced by many companies, notably including The New York Times.

### Improved Module Architecture
A2 developers told us it was hard to learn how to structure their code. So in A3, we have a clearer layout for modules. Each module has a clearly defined home for methods, event handlers, Nunjucks helpers, async components, query builders and more.

### All `async/await`, No Callbacks

Callback-driven code has been completely eliminated from the core of Apostrophe, and all of the JavaScript APIs return promises, so you can `await` them.

### Async Components & Lazy Loading
A2 developers often asked why they couldn't fetch content from the database from inside a template. Now you can. The async component pattern delivers this feature without cluttering your templates with complex JavaScript. Load what you need, when you need it.

### Unopinionated Front End
A2 shipped with jQuery, lodash, momentjs and more. Later, we added the lean option to remove these things. A3 takes this one step further: there are no frontend libraries at all sent to logged-out users, except for a very small vanilla JavaScript helper library for core tasks like communicating with Apostrophe and displaying our video widget. The new library is under 10K gzipped.

::: tip Note
Also see [coming soon](coming-soon.md) for features that haven't made it into A3 yet, but are planned for the final release in Q1 of 2021.
:::

# What's New in 3.0.0-alpha.2

Alpha 2 added the following:

### API Keys and Bearer Tokens

For better write access during headless app development, we have added support for [api keys and bearer tokens](rest-apis.md) in our REST APIs. Now your native apps, PWAs and so on can write to A3 as easily as they can read from it.

### Edit Mode

When you log in, Apostrophe now starts out in "preview mode." Click "Edit" to enter "edit mode." You can toggle back and forth at any time to see your content without any Apostrophe editing UI.

### Undo / Redo

3.0.0-alpha.2 adds Undo and Redo buttons at the top of the page. Although you can undo text edits with them, these are best used to undo big changes like adding or removing a widget.

::: tip Note
The standard keyboard shortcuts for Undo and Redo are still available for smaller changes inside the text editor.
:::

### Foreign Documents

Starting with 3.0.0-alpha.2 users don't edit "foreign" documents, such as a blog post in a widget or a shared global footer on all pages, directly on the page they happen to be looking at. Instead, blog post content can only be edited on the "show page" for that particular post or in the "pieces editor" dialog box for that post. And global content can only be edited in the "global settings" dialog box.

However, users who try to click on this content to edit it "out of context" do receive an invitation to navigate to the appropriate page or dialog box.

These changes make it clearer to users what the real impact of their edits will be. And they will improve the UX of the forthcoming experience for publishing drafts in A3.
