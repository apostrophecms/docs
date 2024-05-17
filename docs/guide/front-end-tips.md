<!-- # Front end best practices -->
<!-- ☝️ Broader title once other examples are added. -->

# Client-side JavaScript tips

## Register JS to keep up with in-context editing events

Since Apostrophe features in-context editing, the main content area that editors manage **frequently refreshes following changes**. That is necessary to make sure editors are working with the most accurate state of the page. It also means that we need to reapply any event listeners we attach to that part of the DOM after it refreshes.

::: info
**What section are we talking about?** If you inspect an Apostrophe page's markup you will see a `div` tag with the `data-apos-refreshable` data attribute. That's the short answer. Anything inside that `div` will refresh following in-context changes, editor modal submissions, and other data changes. There is not much outside of this section: mostly Apostrophe UI, the `head` tag, and generated `script` tags. So any event listeners (or other DOM interactions) on the `body` tag or in the `head` probably only need to be done once. Any others need to be reapplied.
:::

Apostrophe has a utility method to make this easy. [`apos.util.onReady()`](front-end-helpers.md#onready-fn) is in the browser and takes a function as its argument. Every time the page content refreshes the function is run. It's like a [widget player](/guide/custom-widgets.md#client-side-javascript-for-widgets) for the whole page. As such, it is not necessary (and might cause trouble) within a widget player, since the player already does this job.

::: warning
No matter [what module the JS file is in](/guide/front-end-assets.md#placing-client-side-code), the code will run on each page. It's always best to use conditionals to prevent code from running where it is not needed. Look for a relevant DOM element, for example, and only execute the full code when that is present.
:::

```javascript
// modules/assets/ui/src/index.js
export default () = {
  if (document.querySelector('[data-party-toggle]')) {
    apos.util.onReady(() => {
      const partyToggle = document.querySelector('[data-party-toggle]');

      partyToggle.addEventListener('click', engagePartyMode);

      function engagePartyMode () {
        // Party.
      }
    });
  }
}
```
