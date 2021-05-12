# Async components

Writing template files is how we turn data into HTML to display in browsers (or any number of other interfaces). When the data we are using comes directly from [standard fields](/reference/field-types), normal templates already have it ready to use. But what if the data we want to display needs to be freshly queried from the database or fetched from a third-party source?

**Async components** offer a great way to use data from asynchronous requests in templates. They also make it easy to *reuse* that template code. For developers familiar with the previous major version of Apostrophe, this replaces some clunkier and less clear ways to use async data in templates.

## Using async components in templates

In the template, an async component looks like this:

```django
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

```js
// modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  components(self) {
    return {
      // Async component functions here...
    };
  }
};
```

Each component function takes two arguments:

| Argument | Description |
| ------- | ------- |
| `req` | The request object from the originating template context. |
| `data` | Data passed into the component where the component is used. (`{ max: 3 }` in the example above) |

**The function should return an object** that will be passed into its template as `data`. It is not required that the object specifically return an object, but that is a best practice that makes using the returned data clearer in the template partial.

For example, this component function in a `product` module requests products from the database in reverse chronological order and limits the number of products using `data.max`, if available. We then pass that to the template on the `products` property of our new data object.

```js
// modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  components(self) {
    return {
      async newest(req, data) {
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

The database request is asynchronous (as you can tell since it is an `async` function and uses `await` while making the request). This is the kind of thing that would otherwise cause trouble for a template.

Since the name of the component function is `newest`, our template partial for it will be in the `product` module as `newest.html`.

```django
{# modules/product/views/newest.html #}
<h2>Newest products</h2>
<ul>
  {% for product in data.products %}
    <li><a href="{{ product._url }}">{{ product.title }}</li>
  {% endfor %}
</ul>
```

`data.products` in this template is the information we returned in the component function. From there, this is a normal template. The resulting markup is rendered along with the original template that used the `{% component %}` tag.

::: note
Async components have many uses. One of the most common is to provide reuse in different contexts. For instance, the home page may always use the `newest` component at a fixed point in the page template. A products widget might also use it to show the newest products anywhere editors want to show the information.

Inside Apostrophe, async components are used to implement the new `{% area %}` tag.
:::
