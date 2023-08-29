---
prev:
  text: 'Template data'
  link: 'guide/template-data.md'
next:
  text: 'Template fragments'
  link: 'guide/fragments.md'
---
# Template filters

## Nunjucks supplied filters

The Nunjucks templating language comes with several [built-in filters](https://mozilla.github.io/nunjucks/templating.html#filters). These filters apply functions to template data before outputting content to the page. They are called with a pipe operator `|` and can take arguments.

<AposCodeBlock>

``` nunjucks
<h1>{{ data.page.headline | replace("foo", "bar" ) | upper }}</h1>
```
</AposCodeBlock>

In this example, a hypothetical page headline will be retrieved from the page data and then piped to the 'replace' filter, along with two arguments. This filter will scan the incoming data and replace any instances of ‘foo’ with 'bar'. The output of this filter will then pass the result to the upper function, which will return the input as an uppercase string before being output to the page.

::: info

The order of filters can be significant, as they are applied sequentially to the input data.

:::

## Apostrophe supplied filters

Several custom filters and filter sets (multiple, sequential filters) are used in Apostrophe templating. Rather than remembering each filter and the correct order, apostrophe exposes them automatically to the templates. In addition, Apostrophe also adds multiple "helper functions" which do not use the `| foo` filter syntax. The most common of these are described in the [alphabetical filter reference](/guide/template-filters.html#alphabetical-apostrophe-filter-reference).

## Custom template filters

If you have special template needs you can also construct custom filters for use in Nunjucks templates. They can be added by passing the filter name and function to the template module `addFilter(name, function)` method. Multiple filters can be added by passing an object to this same method, where each key is the name of the filter and the value is the function.

By way of example, we'll create a link where the URL is included as part of the label, but without the protocol.

<AposCodeBlock>

```javascript
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
<template v-slot:caption>
  lib/modules/link-widgets/index.js
</template>
</AposCodeBlock>

Within the `methods`, we create a function `stripHttp()` that takes a string from the template. It performs a RegExp replace to strip the protocol before returning the string.

In `init()`, we pass our function to the template module using `self.apos.template.addFilter({})`. This method takes the name of the filter that will be used in the template as property - in this case `stripHttp` - and our new function as a value.

To use this new filter you would simply pipe your data to the filter from within the template.

<AposCodeBlock>

  ``` nunjucks
  <section data-link-widget>
    <a href="{{ data.widget.url }}">{{ data.widget.label }}: {{ data.widget.url | stripHttp }}</a>
  </section>
  ```
  <template v-slot:caption>
    lib/modules/link-widgets/views/widget.html
  </template>
</AposCodeBlock>

## Alphabetical Apostrophe filter reference

### `| build(url, path, data...)`

This filter can add path and query string parameters to the passed URL. This is very useful for adding filters to the current URL, respecting other filters already present, without complicated logic.
The method in the `url` module requires that the URL be passed in as the first argument. However, when using this as a filter in Nunjucks, the data before the pipe will be sent as the first argument. This parameter accepts a URL that can include query parameters and anchor tags.

The `path` parameter accepts an array but is optional. If present, it allows the addition of additional path elements to the URL. The array strings are not added directly to the URL but are substituted with values from the `data` object. So, with a `path` array of `['one', 'two']` and a `data` object of `{ one: 'first', two: 'second'}` the URL `https://example.com` would be modified to `https://example.com/first/second`. The path elements will be added in the order they appear in the `path` array.

The `data` parameter can accept multiple, comma-separated objects. The objects will be considered sequentially, so if duplicate keys are passed, the value will be assigned from the last passed object. As outlined for `path`, these objects can be key:value pairs that add new path elements. If the key does not match any element in the `path` array, it will be added to the URL as a query parameter. Continuing with the example URL from above, passing a `data` object of `{ id: 1010 }` would result in a filtered URL of `https://example.com?id=1010`. If the query parameter already exists in the URL, the value will be changed to the value in the `data` object. Passing values of `null`, `undefined`, or an empty string will remove the query parameter.

If the `data` object contains a key that matches a string in the `path` array and has an invalid path value, e.g. `null`, or is not slug safe, all path processing will stop. Any additional `data` key:value pairs will be added as query parameters even if they match a `path` array value.

Since passing a parameter of the same name as an existing query parameter will replace the value, building an array property for a query requires MongoDB-style operators. If an array doesn’t already exist, the `$addToSet` operator will create it and add a value. Otherwise, it will simply add the value.

`{ colors: { $addToSet: ‘blue’ } }`

To remove values from an existing array use the `$pull` operator:

`{ colors: { $pull: ‘blue’ } }`

### `| clonePermanent`

Given JavaScript data, this filter recursively strips out any properties whose names begin with a `_`, except `_id`. This is used to avoid pushing large related documents into the DOM, keeping markup size down. This filter is usually followed by either the `json` or `jsonAttribute` filters.

### `| css`

Converts a string from other formats, such as underscore or camelCase to a kebab-case CSS identifier. For instance, `fooBar` becomes `foo-bar`.

### `| date(format)`

Turns a JavaScript Date object into a string, as specified by `format`. For formatting options, see the documentation of the `dayjs` npm module.

### `| json`

Turns JavaScript data into a JSON string, **correctly escaped for safe use inside a** `script` **tag in the middle of an HTML document.** Note that it is **not** safe to use the Nunjucks `dump` filter in this way. This filter is not for attributes; see `jsonAttribute`.

### `| jsonAttribute(options)`

Given JavaScript data, this filter escapes it correctly to be the value of a `data-` attribute of an element in the page. It does not add the `"` quote characters around the attribute itself, but it does escape any `"` characters in the JSON string.

`options` may be omitted. If `options.single` is truthy, single-quotes are escaped instead, and you must use `'` (single quotes) to quote the attribute. This saves space and is more readable in "view page source."

**If this filter is applied to anything other than an object or array**, the value is converted to a string and output literally, without quotes. This is done for compatibility with jQuery's `data` method, which only parses JSON when it sees `{}` or `[]` syntax, and otherwise returns the value directly as a string. If you don't like this, only pass objects to this filter.

### `| merge(object2, object3...)`

When applied to an object, this filter "merges in" the properties of any additional objects given to it as arguments. Note that this is not a recursive merge. If two objects contain the same property, the last object wins.

### `| nlbr`

Converts newlines found in a string into `<br />` tags. The incoming string is escaped from any HTML markup. After converting the newlines into breaks, the string is passed through the `|safe` filter before returning it.

### `| nlp`

Breaks a string into `<p>...</p>` elements, based on newlines. Like the `| nlbr` filter, the incoming string is escaped and passed back as safe.

### `| query`

Turns an object into a query string. This filter uses the stringify method of the npm (‘qs’ package)[https://www.npmjs.com/package/qs]. See also `build`.

### `| safe`

The `| safe` filter marks any passed value as safe for direct output on the page. This filter is built into Nunjucks but merits special mention. Data passed from Apostrophe into templates is automatically escaped. Thus, there is no need for the `| escape` (aliased as `| e`) filter. However, if you want to bypass this behavior, you must pass any data through the `| safe` filter. This should be used with caution as this could allow the Editor to pass HTML breaking code onto the page.

### `| striptags`

Strips HTML tags from a string, leaving only the content inside the tags.
