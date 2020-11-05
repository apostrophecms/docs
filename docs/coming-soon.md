---
title: "Coming Soon"
---

# Coming Before the 3.0 Stable Release

The following features are not in our `3.0.0-alpha.1` release, but we promise, they're coming very soon. We'll be releasing these on a rolling basis as we continue our path to a stable release in Q1 2021.

### New Permissions System
A new, simplified permissions system is on its way. However, **for `3.0.0-alpha.1`, all logged-in users are treated as admins.** Again, that's just for this first alpha release.

### Edit Mode, Drafts and Publishing
In A2, if you're not using [apostrophe-workflow](https://github.com/apostrophecms/apostrophe-workflow), your changes are saved as you author them. This remains true in `3.0.0-alpha.1`, but in the stable release there will be an explicit "Edit Mode", and a clear way to create draft documents. In addition you'll be able to expressly "Publish" your work when it is ready to be seen or submit it to someone else for approval. We'll also be bringing a new "Editing Canvas" that improves the user experience of editing in other ways.

### Clearer Contexts for On-Page Editing
In `3.0.0-alpha.1`, you can edit a global footer or a piece that was pulled into the page by a widget right on the page. But that content doesn't really "live" there. This feature generates more confusion than the feature is worth. In another pre-stable release we will instead offer affordances to help users get to the right place to edit "foreign" content.

### Table editing in Tiptap

In `3.0.0-alpha.1`, our rich text editor does not yet support tables, but there is excellent support for tables in Tiptap, and we will be adding this to A3.

### Version History
In the stable release of A3 you'll be able to access the publication history of any document and roll back to a previously published version if needed.

### API keys & Bearer Tokens for REST APIs
While A3 already includes [REST APIs](/rest-apis.md) for all page and piece types, these are currently best for read-only access to public information, or for use by frontend applications built right into an Apostrophe site, such as Apostrophe's own admin UI. This is because write access is currently only available after logging into Apostrophe and receiving a session cookie, while many client applications prefer to use an API key or bearer token. These options will be added before our stable release.

### In-Context Only Areas
Right now, all editable Areas appear in every dialog box. In our stable release, you'll have the option to disable this for content you only want editable on the page.

### Internationalization
The stable release of A3 will ship with optional internationalization both for static text and for dynamic content. We have learned many UX lessons from `apostrophe-workflow` and are simplifying this experience.

### Image Cropping & Focal Points
Standard in 2.x, these features are still in the works for 3.x.

### Polymorphic Relationships
Formally "Polymorphic joins," a popular feature added late in the 2.x series, will reappear in 3.x before the stable release.

### And More
We have a rich ecosystem of plug-in modules for A2, and  those modules will be ported to A3 as appropriate.
