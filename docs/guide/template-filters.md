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
If you have special template needs you can also construct custom filters for use in Nunjucks templates. They can be added by passing the filter name and function to the template module `addFilter(name, function)` method. Multiple filters can be added by passing an object to this same method where each key is the name of the filter and the value is the function.

By way of example, we'll create a link where the URL is included as part of the label, but without the protocol.

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
Within the `methods` we create a function `stripHttp()` that takes a string from the template. It then returns that same string after performing a RegExp replace to strip the protocol.

In `init()`, we pass our function to the template module using `self.apos.template.addFilter({})`. This method takes the name of the filter that will be used in the template as a property - in this case `stripHttp` - and our new function as a value.

To use this new filter you would simply pipe your data to the filter from within the template.

```markup
// lib/modules/link-widgets/views/widget.html
<section data-link-widget>
  <a href="{{ data.widget.url }}">{{ data.widget.label }}: {{ data.widget.url | stripHttp }}</a>
</section>
```

## Alphabetical Apostrophe filter reference

### `build(url, path, data)`

Given a URL , this filter can add both path and query string parameters. This is very useful for adding filters to the current URL, respecting other filters already present, without complicated logic.

The method in the `url` module requires that the URL be passed in as the first argument. However when using this as a filter in Nunjucks, the data before the pipe will be sent as the first argument. This parameter accepts a URL that can include query parameters and anchor tags.

The `path` parameter accepts an array, but is optional. If present, it allows addition of additional path elements to the URL. The array strings are not added directly to the URL, but are substituted with values from the data object. So, with a `path` array of `['one', 'two']` and a `data` object of `{ one: 'first', two: 'second'}` the URL `https://example.com` would be modified to `https://example.com/first/second`. The path elements will be added in the order they appear in the `path` array.

The `data` parameter accepts an object. As outlined for `path`, these can be key:value pairs that add new path elements. If the key does not match any element in the `path` array, it will be added to the URL as a query parameter. Continuing with the example URL from above, passing a `data` object of `{ id : 1010 }` would result in a filtered URL of `https://example.com?id=1010`. If the query parameter already exists in the URL, the value will be changed to the value in the `data` object. Passing values of `null`,`undefined` or an empty string will remove the query parameter.

If the `data` object contains a key that matches a string in the `path` array and has an invalid path value, e.g. `null`, or is not slug safe all path processing will stop and any additional `data` key:value pairs will be added as query parameters even if they match with a `path` array value.

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
