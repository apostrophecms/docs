---
prev:
  text: 'Template fragments'
  link: 'guide/fragments.md'
next:
  text: 'User and User Roles'
  link: '/guide/users.md'
---
# Async components

Writing template files is how we turn data into HTML to display in browsers (or any number of other interfaces). When the data we are using comes directly from [standard document or widget fields](/reference/field-types/index), normal templates already have it ready to use. But what if the data we want to display needs to be freshly queried from the database or fetched from a third-party source?

**Async components** offer a great way to use data from asynchronous requests in templates. They also make it easy to *reuse* that template code. For developers familiar with the previous major version of Apostrophe, this replaces some clunkier and less clear ways to use async data in templates.

## Using async components in templates

In the template, an async component looks like this:

``` njk
{% component 'product:newest' with { max: 3 } %}
```

- The `{% component %}` tag indicates that we are working with an async component.
- `'product:newest'` tells the template two things:
  1. The component is defined in the `product` module.
  2. Its name is `newest`, which is used as the component function name as well as its template partial filename.
- `with { max: 3 }` is an options object that will be passed to the component function. It's not required, but can allow for varied use in different contexts.

With that one line, the template rendering will know to find the component definition, execute the component function asynchronously, and render the appropriate template partial. That's a lot of benefit for one line of template code.

Let's see how we define these components.

## Defining async components

There are two parts to creating an async component. First, we need to write a component function in a module. Second, we add a template that uses the data returned by the function.

Async component functions are defined in a module's `components` customization function. Add a `components` function to a module that takes `self` (representing the module itself) as an argument. It must return an object containing the individual component functions.

<AposCodeBlock>

``` js
module.exports = {
  extend: '@apostrophecms/piece-type',
  components(self) {
    return {
      // Async component functions here...
    };
  }
};
```
  <template v-slot:caption>
    modules/product/index.js
  </template>
</AposCodeBlock>


Each component function takes two arguments:

| Argument | Description |
| ------- | ------- |
| `req` | The request object from the originating template context. |
| `data` | Data passed into the component where the component is used. (`{ max: 3 }` in the example above) |

**The function should return an object** that will be passed into its template as `data`. This best practice makes using the returned data consistent with other template data and thus clearer in the template partial.

For example, this component function in a `product` module requests products from the database in reverse chronological order and limits the number of products using `data.max`, if available. We then pass that to the template on the `products` property of our new data object.

<AposCodeBlock>

``` js
module.exports = {
  extend: '@apostrophecms/piece-type',
  components(self) {
    return {
      async newest(req, data) {
        // Using the `find` method with query builders
        const products = await self.find(req).sort({
          createdAt: -1
        }).limit(data.max || 5).toArray();

        return {
          products
        };
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/product/index.js
  </template>
</AposCodeBlock>

The database request is asynchronous (as you can tell since it is an `async` function and uses `await` while making the request). This is the kind of thing that would otherwise cause trouble for a template.

Since the name of the component function is `newest`, our template partial for it will be in the `product` module as `newest.html`.

<AposCodeBlock>

``` njk
<h2>Newest products</h2>
<ul>
  {% for product in data.products %}
    <li><a href="{{ product._url }}">{{ product.title }}</li>
  {% endfor %}
</ul>
```
  <template v-slot:caption>
    modules/product/views/newest.html
  </template>
</AposCodeBlock>

`data.products` in this template is the information we returned in the component function. From there, this is a normal template. The resulting markup is rendered along with the original template that used the `{% component %}` tag.

::: info
Async components have many uses. One of the most common is to support reuse in different contexts. For instance, the home page may always use the `newest` component at a fixed point in the page template. A products widget might also use it to show the newest products anywhere editors want to show the information.

Inside Apostrophe, async components are used to implement the `{% area %}` tag.
:::

::: warning
Standard Nunjucks template macros cannot run asyncronous code, including async components. The Apostrophe template [fragment](fragments.md) feature *can* run async code and is a general purpose replacement for macros in Apostrophe 3.
:::
