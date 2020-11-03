---
title: "What's New in Apostrophe 3"
---

# What's New in Apostrophe 3

> Also see [coming soon](coming-soon) for features that haven't made it into A3 yet, but are planned for the final release.

## 100% RESTful Headless APIs 
While A2 had custom APIs and a separate `apostrophe-headless` module, A3 is powered by RESTful APIs from the ground up.

## New Editing Experience
Powered by Vue, the new editing experience is much faster than in A2. We've completely overhauled the design and UX with superior editor interactions.

## Improved Module Architecture
A2 developers told us it was hard to learn where to put their code. So in A3, we have a clearer layout for modules. Each module has a clearly defined home for methods, event handlers, Nunjucks helpers, async components, query builders and more.

## All `async/await`, No Callbacks

Callback-driven code has been completely eliminated from the core of Apostrophe, and all of the JavaScript APIs return promises so you can `await` them.

## Async Components & Lazy Loading
A2 developers often asked why they couldn't fetch content from the database from inside a template. Now you can. The async component pattern delivers this feature without cluttering your templates with complex JavaScript code. Load what you need when you need it.

## Unopinionated Front End
A2 shipped with jQuery, lodash, momentjs and more. Later, we added the lean option to remove these things. A3 takes this one step further: there are no frontend libraries at all sent to logged-out users, except for a very small vanilla JavaScript helper library for core tasks like communicating with Apostrophe and displaying our video widget. The new library is under 10K when delivered with gzip encoding.
