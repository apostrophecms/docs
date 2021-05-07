---
title: "Front end code"
---

# Front end code: CSS and Javascript

ApostropheCMS approaches CSS and client-side Javascript by trying to taking care of as much of the hard parts as possible. To that end, developers main job is to **put their CSS and client-side Javascript into `ui/public` directories**. Apostrophe will then:
  - Concatenate all CSS and JS in `ui/public` directories
  - Deliver the code to browsers in one CSS and one Javascript file, either:
    - with the editing UI if the browser is logged in, or
    - without the editing UI if logged out

## Placing client-side code

CSS and Javascript files need to be placed in **any module's `ui/public` directory**. You can put client-side code in a single module directory (e.g., after running your own build process) or across many modules.

For example, if we had a global CSS file, `site.css`, we might create an `assets` module for this purpose and place it at:

```
modules/assets/ui/public/site.css
```

You could instead add code for an individual widget type as shown in the [custom widget guide](/guide/areas-and-widgets/custom-widgets.md#client-side-javascript-for-widgets). That example's Javascript code was placed at:

```
modules/collapse-widget/ui/public/collapser.js
```

Regardless of the file's name, it will be included in the complete file. Apostrophe will concatenate CSS together in one file and Javascript together in another file.

::: tip
If you have your own build process using something like webpack or Gulp you will likely end up with a single Javascript file and and single CSS file. For the sake of code organization, it can help to output those files into a generic module such as `modules/assets` rather than one of the piece type or page type directories.

In this case, the `assets` module may not have any additional code and even may not have an `index.js` file (though it certainly could). As long as it is instantiated in `apps.js`, the client-side assets will be found.
:::

Client side code will be recompiled **when the app starts up** or if **the build task runs**. Tools like [nodemon](https://www.npmjs.com/package/nodemon) are helpful to watch for code changes and restart the app for automatic recompiling. The CLI command to run the build task manually is `node app @apostrophecms/asset:build`.

## Ordering the output files

If you spread the client-side code across modules it will be concatenated in the order they are instantiated in `app.js`. For example, let's say you have Javascripts files in `modules/sing-widget/ui/public` and `modules/dance-widget/ui/public`.

The `sing-widget` sings:

```javascript
// `modules/sing-widget/ui/public/singing.js
console.log('🧑‍🎤🎶');
```

And the `dance-widget` dances:

```javascript
// `modules/dance-widget/ui/public/dancing.js
console.log('🕺🏻💃🏽');
```

If your modules configuration in `app.js` includes this:

```javascript
// app.js
'sing-widget': {},
'dance-widget': {},
```

The output will **sing** before it **dances**. If the modules are instantiated in the opposite order:

```javascript
// app.js
'dance-widget': {},
'sing-widget': {},
```

the output will **dance** before it **sings**.

::: note The Boilerplate
The [Apostrophe 3 boilerplate](https://github.com/apostrophecms/a3-boilerplate/) follows our recommended strategy:
1. use webpack to build your assets
2. push the end result to A3's asset pipeline

**Here is how development works using our boilerplate project**:

-  The `dev` npm script in `package.json` runs project-level a webpack build, which compiles `src/index.js` according to the rules in `webpack.config.js`.
-  `src/index.scss` (written in [Sass](https://sass-lang.com/)) is imported by `src/index.js`, allowing the browser to load one file for both CSS and JS.
-  At the end of the build, the bundled assets are written to `modules/asset/ui/public/sites.js`.
- Any `.js` files in the `ui/public` folder of any module are automatically included in the frontend build.
- Whenever code changes are made, `nodemon` automatically restarts this cycle and refresh the browser after a successful restart.

None of those specifics are required for Apostrophe. You can follow whatever organizing pattern works best for you or your organization.
:::

## Front end helper methods

Apostrophe provides a small library of front-end utility methods to support implementing client-side Javascript. These can be useful in widget players, for example. [General utility methods](#general-utility-methods) area available on `apos.util` and [HTTP request methods](#http-request-methods) are available on `apos.http`.

### General utility methods

These are all available in the browser on `apos.util`, e.g., `apos.util.addClass(el, 'is-active')`. They include wrappers for common browser APIs, classic DOM traversal methods, and Apostrophe-specific utilities.

| Method | What is it? |
| -------- | ----------- |
| [`addClass`](#addclass-el-classname) | Add a class to a DOM element, if missing. |
| [`assign`](#assign-target-src1-src2) | Assigns properties from one or more source objects to a target object. |
| [`attachmentUrl`](#attachmenturl-fileobj-options) | Get the file URL for an Apostrophe attachment object. |
| [`closest`](#closest-el-selector) | Returns the closest ancestor element that matches the selector. |
| [`emit`](#emit-el-name-data) | Emit a custom browser event on a DOM element. |
| [`getCookie`](#getcookie-name) | Get the value of a browser cookie. |
| [`onReadyAndRefresh`](#onreadyandrefresh-fn) | Runs the function passed in when Apostrophe refreshes page content during editing.
| [`removeClass`](#removeclass-el-classname) | Remove a class from a DOM element, if present. |
| [`sameSite`](#samesite-uri) | Returns `true` if the URI pass in matches the same website as the current page. |

#### `addClass(el, className)`

Add a class to a DOM element, if missing. Often used with [`removeClass`](#removeclass-el-classname). Supports browsers without the matching native method.

| Argument | What is it? |
| -------- | ----------- |
| `el` | a DOM element |
| `className` | a string to be added to the `class` attribute |

```javascript
const myElement = document.querySelector('[data-my-element]');

apos.util.addClass(myElement, 'is-active');
```

#### `assign(target, src1, src2, ...`

Assigns properties from one or more source objects to a target object. Uses [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) when available. Supports browsers without the matching native method.

| Argument | What is it? |
| -------- | ----------- |
| `target` | an object on which to add source object properties |
| `src1`, `src2`, etc. | one or more source objects whose properties should copy to the target object |

```javascript
const options = {
  name: 'balloon',
  color: 'blue'
};

apos.util.assign(options, {
  color: 'red',
  language: 'French'
});

console.log(options)
// {
//   name: 'balloon',
//   color: 'red',
//   language: 'French'
// }
```

#### `attachmentUrl(fileObj, options)`

Get the file URL for an Apostrophe attachment object. Optionally pass an options object to get a specific version of the file. File (non-image) attachment objects include a single `_url` property already, so this is primarily used for retrieving specific versions of an image.

| Argument | What is it? |
| -------- | ----------- |
| `fileObj` | an attachment object, such as from an attachment field value or using a template helper method to parse an [image widget](/guide/core-widgets.md#image-widget) value |
| `options` | image options to apply for the resulting URL |

| Options | What is it? |
| -------- | ----------- |
| `crop` | an object of image cropping coordinates with `left`, `top` and `width` properties (usually populated from the cropping UI and included on the image object) |
| `size` | an image size name to retrieve, such as one of the [standard image file variations](/guide/core-widgets.md#specifying-the-fallback-size) |

```javascript
// Getting an image attachment object after stashing the stringified object
// on a `data-image` attribute in the template
const imageObj = document.querySelector('[data-thumbnail]').dataset.image;

const smallImage = apos.util.attachmentUrl(imageObj, {
  size: 'one-third'
});
```

#### `closest(el, selector)`

Returns the closest ancestor element that matches the selector. The element itself is considered the closest possible match. Supports browsers without the matching native method.

| Argument | What is it? |
| -------- | ----------- |
| `el` | a DOM element |
| `selector` | a string to use as a CSS selector to match |

```javascript
const menuToggle = document.querySelector('[data-toggle]');

const menu = apos.util.closest(myElement, '[data-menu]');
```

#### `emit(el, name, data)`

Emit a custom browser event on a DOM element. Optionally include a `data` object to include on the event. For event listeners, use the standard browser [`addEventListener` method](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

| Argument | What is it? |
| -------- | ----------- |
| `el` | a DOM element |
| `name` | a string to use as the event name |
| `data` | (optional) an object containing data to include on the event object |

```javascript
const myElement = document.querySelector('[data-my-element]');

apos.util.emit(myElement, 'openChat', {
  url: window.location
});
```

#### `getCookie(name)`

Get the value of a browser cookie.

| Argument | What is it? |
| -------- | ----------- |
| `name` | The name of a browser cookie |

```javascript
apos.util.getCookie('cookiename');
```

#### `onReadyAndRefresh(fn)`

Runs the function passed in when Apostrophe refreshes page content during editing. When logged out it will run the function on initial page load. This is not necessary in [widget players](/guide/custom-widgets.md#client-side-javascript-for-widgets).

| Argument | What is it? |
| -------- | ----------- |
| `fn` | a function that should run when page content is ready |

```javascript
const loadNewsletterForm = function () {
  // Code that loads a sign-up form...
}

apos.util.onReadyAndRefresh(loadNewsletterForm);
```

#### `removeClass(el, className)`

Remove a class from a DOM element, if present. Often used with [`addClass`](#addclass-el-classname). Supports browsers without the matching native method.

| Argument | What is it? |
| -------- | ----------- |
| `el` | a DOM element |
| `className` | a string to be added to the `class` attribute |

```javascript
const myElement = document.querySelector('[data-my-element]');

apos.util.removeClass(myElement, 'is-hidden');
```

#### `sameSite(uri)`

Returns `true` if the URI pass in matches the same website (same host and port) as the current page. This is used some HTTP utility methods.

| Argument | What is it? |
| -------- | ----------- |
| `uri` | a valid URI |

```javascript
const targetUrl = 'https://some-website.rocks/api/gems'
const siteMatches = apos.util.sameSite(targetUrl);
```

::: note
There is also a `runPlayers` method on `apos.util`. That is run for us using `apos.util.onReadyAndRefresh` and runs all registered widget players. It is unlikely that it will need to be run in project-level code.
:::

### HTTP request methods