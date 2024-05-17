---
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/page-type`

<AposRefExtends :module="$frontmatter.extends" />

This module serves as the cornerstone for creating page types in Apostrophe. It allows developers to define multiple page types, each with their own configuration methods, schema fields, and template(s). This module extends the schema fields provided by the `@apostrophecms/doc-type` module with the `type` field and introduces the `orphan` field (labeled `visibility`), which controls page visibility in the navigation. Any newly created page type needs to be added to the `app.js` file, but also to the `types` array in the options of the [`@apostrophecms/page` module](/reference/modules/page.html). The object for each page type should have a `name` property that takes the module name and a `label` property that is used to populate the choices of page types presented to the content manager when they create a new page.

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    types: [
      {
        name: '@apostrophecms/home-page',
        label: 'Home'
      },
      {
        name: 'default-page',
        label: 'Default'
      },
      {
        name: 'article-page',
        label: 'Article Index'
      }
    ],
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>

</AposCodeBlock>

The `page-type` module can expose multiple views, but by default serves the template located at `<module-name>/views/page.html`. Additional views can be exposed using the `dispatch()` method.

## Featured Methods:
The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/tree/main/modules/%40apostrophecms/page-type) for all the methods that belong to this module.

### `dispatchAll()`
The `dispatchAll()` method is a utility method for registering multiple `dispatch()` routes. It is invoked during project start-up by the `init` method of this module, so it provides a convenient method for managing and consolidating routing logic.

<AposCodeBlock>

```javascript
dispatchAll() {
  self.dispatch('/', req => self.setTemplate(req, 'index'));
  self.dispatch('/:slug', req => self.setTemplate(req, 'show'));
}
```

</AposCodeBlock>

### `dispatch(pattern, ...middleware, handler)`
The `dispatch()` method provides a way to add Express-style routing for ApostropheCMS pages. This method allows you to define custom behavior for URLs that extend beyond the basic page slug, matching specified URL patterns. For example, this method is used in the `@apostrophecms/piece-page-type` to redirect from the `index.html` template to the `show.html` template when the URL matches the pattern `/:slug`. The `pattern` argument takes a string that can contain a mix of static and dynamic values. The dynamic values, or parameters, are proceeded with a `:` and will match any string passed in that position of the URL string. For instance, in the pattern `/user/:userId`, `:userId` is a dynamic segment that will match any string in its place. When a user accesses a URL like `/user/123`, the `req` userId parameter will be set to `123`.

A `pattern` can have multiple dynamic segments. For example, consider an online learning platform where users can access multiple courses and each course has multiple lessons and quizes. You could set up a dispatch route of `/course/:courseId/lessons/:lessonId` to be able to deliver a specified template for individual lessons and another route `/course/:courseId/quizzes/:quizId` to deliver the quiz template.

This method takes an optional `middleware` argument that can take any number of middleware functions. These functions are executed in the order they are provided, prior to the final handler. Middleware in this context can be used for a variety of purposes, such as authentication checks, logging, request data manipulation, error handling, or any other preparatory work that needs to occur before the request reaches the final handler. If any middleware function explicitly returns `false`, then no further middleware will be run and the final handler will also not be run.

The final `handler` argument handles any URL matching the pattern and receives the `req` object. In most cases, this is used to set the template that is rendered using `setTemplate(req, '<template-name>')`, where the template name is the name of the file to be used from the `modules/custom-module/views` folder minus the `.html` extension. The handler method must be an async function, and it will be awaited.

The `dispatch()` and `dispatchAll()` methods can be effectively used to create dynamic routes, potentially based on data retrieved from an API. For instance, you can fetch a list of available routes from an API at startup and dynamically register them using dispatch.

```javascript
methods(self) {
  return {
    dispatchAll() {
      // Route for listing all products
      self.dispatch('/', async (req) => {
        try {
          // Fetch product data from an external API using another method
          const products = await self.fetchApiData();
          // Add fetched products to the request object for use in the template
          req.data.products = products;
          // Render the product index template
          return self.setTemplate(req, 'productIndex');
        } catch (error) {
          // Log the error and render an error page in case of failure
          console.error('Error fetching products:', error);
          // render the 'views/errorTemplate.html' template
          return self.setTemplate(req, 'errorTemplate');
        }
      });

      // Route for specific product details
      self.dispatch('/:product', async (req) => {
        try {
          // Fetching details for a specific product using its slug from the URL
          const response = await fetch(`https://apiEndpoint/${req.params.product}`);
          // Check if API response is successful
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }
          const data = await response.json();
          // Adding product details to the request object
          req.data.product = req.params.product;
          req.data.details = data.message;
          // Render the product details template
          return self.setTemplate(req, 'productDetails');
        } catch (error) {
          // Log the error and render an error page in case of failure
          console.error('Error fetching product details:', error);
          return self.setTemplate(req, 'errorTemplate');
        }
      });
    }
  }
}

```
In this example, your custom module would have a `modules/custom-module/views/productIndex.html` template that would be used to display all of the products returned from the API when a user navigates to `https://your-site.com/your-product-page/`. This template would create dynamic links using a loop over the `data.products` object. For example, <span v-pre>`<a href="{{data.page._url}}/{{product}}">{{ product }}</a>`</span>. When clicked, this would then trigger the `/:product` dispatch route and render the template located at `modules/custom-module/views/productDetails.html`. The specific product name and details would be available through `data.product` and `data.details` in the template.