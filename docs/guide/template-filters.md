# Template Filters

## Nunjucks supplied filters
The Nunjucks templating language comes with several [built-in filters](https://mozilla.github.io/nunjucks/templating.html#filters). These filters apply functions to template data before outputting content to the page. They are called with a pipe operator `|` and can take arguments.
```markup
<h1>{{ data.page.headline | replace("foo", "bar" ) | upper }}</h1>
```
In this example, a hypothetical page headline will be retrieved from the page data and then piped to the 'replace' filter, along with two arguments. This filter will scan the incoming data and replace any instances of 'foo' with 'bar'. The output of this filter will then pass the result to the upper function, which will return the input as an uppercase string before being output to the page.

>Note: The order of filters can be important, as they are applied sequentially to the input data.

## Apostrophe supplied filters
There are several custom filters and filter sets (multiple, sequential filters) used in Apostrophe templating. Rather than have to remember each filter and the correct order, apostrophe exposes them automatically to the templates. In addition, Apostrophe also adds multiple "helper functions" which do not use the `| foo` filter syntax. These are documented with the modules that provide them. Several of the more common of these are within the documentation for the [util module](/reference/modules/util.html#template-helpers).

## Custom template filters
If you have special template needs you can also construct custom filters for use in Nunjucks templates. By way of example, we'll create a link where the URL is included as part of the label

```javascript
// lib/modules/link-widgets/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Link to a Page'
  },
  fields: {
    add: {
      url: {
        type: 'url',
        label: 'URL',
        required: true
      },
      label: {
        type: 'string',
        label: 'Label',
        required: true
      }
    },
    group: {
      links: {
        label: 'Links',
        fields: [ 'url', 'label' ]
      }
    }
  },
  init(self) {
    self.apos.template.addFilter({
      stripHttp: self.stripHttp
    });
  },
  methods(self) {
    return {
      stripHttp(s) {
        return s.replace(/^(https?:|)\/\//, '');
      }
    };
  }
};
```
To use this filter you would simply pipe your data to the filter.

```markup
// lib/modules/link-widgets/views/widget.html
<section data-link-widget>
  <h2>{{ data.widget.label }}: {{ data.widget.url | stripHttp }}</h2>
</section>
```

## Alphabetical Apostrophe filter reference

### `| build(obj...)`

Given a URL and one or more objects, this filter adds query string parameters for each of the properties in the objects. If objects affect the same parameter, the last object wins. If a parameter is set to `null` or the empty string it is removed from the URL altogether. This is very useful for adding filters to the current URL, respecting other filters already present, without complicated logic.

The `build` filter has additional features which you can read about in the comments of the `index.js` file of the url module.

### `| clonePermanent`

Given JavaScript data, this filter recursively strips out any properties whose names beginning with a `_`, except `_id`. This is used to avoid pushing large joined documents into the DOM.

### `| css`

Converts a string to a hyphenated CSS identifier. For instance, `fooBar` becomes `foo-bar`.

### `| date(format)`

Turns a JavaScript Date object into a string, as specified by `format`. For formatting options, see [the documentation of the `momentjs` npm module](https://momentjs.com/docs/#/displaying/format/).

### `| json`

Turns JavaScript data into a JSON string, **correctly escaped for safe use inside a** `script` **tag in the middle of an HTML document.** Note that it is **not** safe to use the Nunjucks `dump` filter in this way. This filter is not for attributes, see `jsonAttribute`.

### `| jsonAttribute(options)`

Given JavaScript data, this filter escapes it correctly to be the value of a `data-` attribute of an element in the page. It does not add the `"` quote characters, but it does escape any `"` characters in the JSON string.

`options` may be omitted. If `options.single` is truthy, single-quotes are escaped instead, and you must use `'` \(single quotes\) to quote the attribute. This saves space and is more readable in "view page source."

**If this filter is applied to anything other than an object or array,** the value is converted to a string and output literally, without quotes. This is done for compatibility with jQuery's `data` method, which only parses JSON when it sees `{}` or `[]` syntax, and otherwise returns the value directly as a string. If you don't like this, only pass objects to this filter.

### `| merge(object2, object3...)`

When applied to an object, this filter "merges in" the properties of any additional objects given to it as arguments, using the lodash `assign` method. Note that this is not a recursive merge. If two objects contain the same property, the last object wins.

### `| nlbr`

Converts newlines found in a string into `<br />` tags.

### `| nlp`

Breaks a string into `<p>...</p>` elements, based on newlines.

### `| query`

Turns an object into a query string. See also `build`.

### `| striptags`

Strips HTML tags from a string, leaving only the content inside the tags.
