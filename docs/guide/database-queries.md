---
sidebarDepth: 2
---

# Querying the database

When designing custom modules or customizing existing modules, it can quickly become necessary to fetch data that Apostrophe does not automatically make available. We might want to display a random image in a page banner or a few dynamically-chosen articles related to the page a visitor is on. Apostrophe has an API designed to help developers get as creative as they need to be.

One goal of the Apostrophe querying API is to facilitate common and advance requests to the MongoDB database *without* requiring developers to know advanced MongoDB syntax. Understanding that low-level syntax will be helpful at times, but advanced knowledge should not be necessary.

As a final note, this guide will focus on working with content documents (e.g., pages and pieces). Querying database collections for things like the cache or long-running jobs will be covered elsewhere.

::: note
We use the terms "query" and "query builders" here. For developers with advanced Apostrophe 2 experience, these are generally the same as the A2 concepts of "cursors" and "cursor filters."
:::

## `find()`-ing data

The page module (`@apostrophecms/page`) and all modules that *extend* the piece type module (`@apostrophecms/piece-type`), the two big "doc type" categories, have access to **a `find()` method** that initializes a data query. Any query using a doc type module's `find` method will be limited to that module type. This means that we can know that calling `self.find()` in a `product` piece module will only return "products".

The `find` method takes up to three arguments:

| Argument | Required | Description |
| -------- | -------- | ----------- |
| `req` | TRUE | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `criteria` | FALSE | A [MongoDB criteria object](https://docs.mongodb.com/manual/tutorial/query-documents/). It is often as simple as properties that match schema field names assigned to the desired value. |
| `options` | FALSE | The options object is converted to matching [query builders](#using-query-builders). It is often easier to add query builders in the method-syntax described below. |

In the following example, we are writing the function that powers an [async template component](/guide/async-components.md). This hypothentical component would be passed the product `_id` property where it is shown as `productId`.

<AposCodeBlock>
  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-type',
    // ...
    components(self) {
      return {
        // Returning the five most recently created products.
        async latest(req, data) {
          // 👇 Setting up our query criteria.
          const criteria = {
            _id: { $ne: data.productId }
          };

          // 👇 The `find` method starting the query.
          const products = await self.find(req, criteria)
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

          return { products };
        }
      };
    }
  };
  ```
  <template v-slot:caption>
    modules/product/index.js
  </template>
</AposCodeBlock>

**What is happening here?**

```javascript
async latest(req, data) {
  ...
}
```

Component functions are provided a request object, `req`, usually from a website visitor visiting a page that uses the component. The function also receives `data`, which is a data object a developer included when using the component in a template. (See the [async component guide](/guide/async-components.md)] for more on that feature.)

```javascript
const criteria = {
  _id: { $ne: data.productId }
};
```

We are going to get the most recently added products, but it wouldn't help visitors to see the product they're already looking at in this group. Here we create a `criteria` object that uses the MongoDB query syntax to look for documents whose `_id` property is not equal to (`$ne`) the ID of the active product.

```javascript
await self.find(req, criteria)
```

We are in the `product` module, so by calling the `find` method from `self` (which is the `product` module itself), our results are automatically limited to products. That's why our `criteria` object does not need to include that limitation, which would otherwise look like `type: 'product'`.

We pass in the `req` object we received from the component function parameters and the criteria object. In this case we are not including a third object for `options`.

::: note
It's important to understand that the `find` method is not the end of the process. It is only the beginning, setting up a query that may be refined and then needs to be executed by a separate method. There is more on that below, but for now make sure to understand that simply running `self.find()` by itself will not return any documents.
:::

```javascript
  .sort({ createdAt: -1 })
  .limit(5)
```

These are **query builders**. Let's look at what query builders are before we identify what is happening in this example.

### Using query builders

Query builders are additional instructions added to the data query. These special methods may receive arguments, but many apply an effect without any arguments. They can be chained on a query, meaning that we can add multiple builders onto a query and each one will build on the rules established before it.

Examples of query builders include:
- `.limit(10)`: This limits the number of results that the query will return to the number we pass it.
- `.sort({ name: 1 })`: This builder sorts query results based on a document property value. This one sorts by the `name` property in ascending order.
- `.search('search term')`: This accepts a string and looks for documents that have that string in their registered searchable words.
- `.relationships(false)`: This builder accepts `false` or an array of relationship field names to avoid or limit relationship data loading onto the request response (saving some processing when it's not needed).

As we can see here, query builders apply a wide variety of effects. See the [query builder reference page](/reference/query-builders.md) for a full list of query builders and how to use them.

Let's take another look at the builders in the example above.

```javascript
self.find(req, criteria)
  .sort({ createdAt: -1 })
  .limit(5)
```

This example is using two query builders, `sort` and `limit`. As described above, `sort({ createdAt: -1})` sorts the queried documents in descending order on their `createdAt` properties (most recent first). `limit(5)` then ensures the request will return no more than five documents.

::: note
Many aspects of querying the database are the same for both page and piece queries. One thing that is different are certain query builders that only apply to requests by the page module. These builders do things like update how results should include "child" or "ancestor" pages from the page hierarchy.

There is [a section for these builders](/reference/query-builders.md#page-document-query-builders) in the reference page. There is a similar section with a builder that only works on *image* piece queries as well.
:::

#### Projections: Reducing returned document data

One very useful query builder is `.project()`. We often know what specific data properties we want from a query and it is rarely *every single property*. By applying a query projection we reduce density of the data returned, making the response lighter, faster, and easier work with during development.

```
query
  .project({
    title: 1,
    _author: 1,
    publishedAt: 1
  })
```

The `project` builder is one that uses a MongoDB syntax. The object passed as an argument should include schema field names for the document type we're querying with each set to `1`. This tells the database that we only want these fields in each document we get back.

The `_id` property is always included no matter what projection is used.

::: note
In Apostrophe 2 this builder was named `projection`.
:::

#### Paginating query results

There are a few query builders that can work together to "paginate" query results. Sometimes that is better than receiving an unknown large number of results all at once.

```javascript
query
  .perPage(20)
  .page(2)
```

This example tells the query that its results should be returned in a group of no more than 20 (`.perPage(20)`) and that we want the second group of results based on the active sort order (`.page(2)`). These builders are used in the Apostrophe REST APIs and can be very helpful when dealing with large amounts of content. They use two other builders internally (`limit` and `skip`), but can be easier to use for common situations.

#### Adding your own query builders

We're not limited to the query builders that come in Apostrophe core. It may help to create a builder that applies certain criteria and other builders that we might otherwise have to write repeatedly across a code base.

We can do this with the `queries()` customization function in the module configuration API. See the [module configuration API reference](/reference/module-api/module-overview.md#queries-self-query) for more information.

### Getting the results with query methods
- query methods
  - toArray
  - toObject
  - toChoices
  - toDistinct
  - toCount
- update() to update a piece
- insert() to insert a piece
  - difference for pages
- The server events each triggers
- fetching pieces from a different module
- acting on mixed doc types with `self.apos.docs` methods
- query utilities
  - clone()
  - toMongo()