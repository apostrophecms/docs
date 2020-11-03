---
title: "Coming Soon"
---

# Features Coming Before the 3.0 Final Release

These features are not in alpha 1, but it's important to us that you know they are coming before the final release of 3.0:

## New Permissions System 
A new, simplified permissions system is on its way. However, **for alpha 1, all logged-in users are treated as admins.** Again, that's just for alpha 1.

## Edit Mode, Workflow and Publication
In A2, if you're not using the `apostrophe-workflow` module, your changes can become visible as you type them. In Alpha 1, this is also true in A3, but in the final release there will be an explicit "edit mode" and a clear way to save your draft. In addition you'll be able to expressly "publish" your work when it is ready to be seen, or submit it to someone else for approval. We'll also be bringing a new "editing canvas" that improves the user experience of editing in other ways.

## Clearer Contexts for On-Page Editing
In A2 and A3 alpha 1, you can edit a global footer or a piece that was pulled into the page by a widget right on the page. But that content doesn't really "live" there. This feature generates more confusion than the feature is worth. In A3 final, we will instead offer affordances to help users get to the right place to edit that "foreign" content.

## Version History
In the final release of A3 you'll be able to access the publication history of any document and roll back to a previously published version if needed.

## API keys and bearer tokens for REST APIs
While A3 already includes [REST APIs](/rest-apis) for all page and piece types, these are currently best for read-only access to public information, or for use by frontend applications built right into an Apostrophe site, such as Apostrophe's own admin UI. This is because write access is currently only available after logging into Apostrophe and receiving a session cookie, while many client applications prefer to use an api key or bearer token. These options will be added before 3.0 final.

## Areas won't always be in every dialog box
Right now, all editable areas appear in every dialog box, for instance "page settings" or the piece editor. In A3 final you'll have the option to disable this for those that should only be editable on the page.

## Internationalization
The final release of A3 will ship with optional internationalization both for static text and for dynamic content. We have learned many UX lessons from `apostrophe-workflow` and are simplifying this experience.

## Image Cropping & Focal Points
Standard in 2.x, these features are still in the works for 3.x.

## Polymorphic Relationships
Formally "Polymorphic joins," a popular feature added late in the 2.x series, will reappear in 3.x before the final release.

## And More 
We have a rich ecosystem of plug-in modules for A2, and  those modules will be ported to A3 as appropriate.
