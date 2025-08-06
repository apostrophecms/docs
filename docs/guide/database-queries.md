# Querying the database

When designing custom modules or customizing existing modules, it can quickly become necessary to fetch data that Apostrophe does not automatically make available. We might want to display a random image in a page banner or a few dynamically-chosen articles related to the page a visitor is on. Apostrophe has an API designed to help developers get as creative as they need to be.

One goal of the Apostrophe content query API is to facilitate common and advanced requests to the MongoDB database *without* requiring developers to know advanced MongoDB syntax. Understanding that low-level syntax will be helpful at times, but advanced knowledge should not be necessary.

This API also provides a layer of security. Queries made through Apostrophe (that maintain the original `req` request), will only return content the active website user is allowed to see.

::: info
We use the terms "query" and "query builders" here. For developers with advanced Apostrophe 2 experience, these are generally the same as the A2 concepts of "cursors" and "cursor filters."
:::

## Initiating the database query

The page module (`@apostrophecms/page`) and all modules that *extend* the piece type module (`@apostrophecms/piece-type`), the two big "doc type" categories, have access to **a `find()` method** that initiates a database query. Any query using a doc type module's `find` method will be limited to that module type. This means that we can know that calling `self.find()` in a `product` piece module will only return products.

The `find` method takes up to three arguments:

| Argument | Required | Description |
| -------- | -------- | ----------- |
| `req` | TRUE | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `criteria` | FALSE | A [MongoDB criteria object](https://docs.mongodb.com/manual/tutorial/query-documents/). It is often as simple as properties that match schema field names assigned to the desired value. |
| `options` | FALSE | The options object is converted to matching [query builders](#using-query-builders). It is often easier to add query builders in the fluent interface described below. |

In the following example, we are writing the function that powers an [async template component](/guide/async-components.md). This hypothetical component would be passed the product `_id` property where it is shown as `productId`.

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

::: info
For context, this is what it would look like to invoke this async component in a product show page template:

<AposCodeBlock>

  ``` nunjucks
  {% component 'product:latest' with { productId: data.piece._id } %}
  ```
  <template v-slot:caption>
    modules/product-page/views/show.html
  </template>
</AposCodeBlock>

:::

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

::: info
It's important to understand that the `find` method is not the end of the process. It is only the beginning, setting up a query that may be refined and then needs to be executed by a separate method. There is more on that below, but for now make sure to understand that simply running `self.find()` by itself will not return any documents.
:::

```javascript
  .sort({ createdAt: -1 })
  .limit(5)
```

These are **query builders**. Let's look at what query builders are before we identify what is happening in this example.

## Using query builders

Query builders are additional instructions added to the database query. These special methods may receive arguments, but many apply an effect without any arguments. They can be chained on a query, meaning that we can add multiple builders onto a query and each one will build on the rules established before it.

Examples of query builders include:
- `.limit(10)`: This limits the number of results that the query will return to the number we pass it.
- `.sort({ name: 1 })`: This builder sorts query results based on a document property value. This one sorts by the `name` property in ascending order.
- `.search('search term')`: This accepts a string and looks for documents that have that string in Apostrophe's full-text index.
- `.relationships(false)`: This builder accepts `false` or an array of relationship field names to avoid or limit relationship data loading onto the request response (saving some processing when it's not needed).
- `.areas(false)`: Similarly, this builder accepts `false` to prevent fetching relationships and doing similar work for any widgets nested in the documents, which can also help with performance where that information is unnecessary. You can also specify an array of specific area names whose widgets should be fully loaded.

As we can see here, query builders apply a wide variety of effects. See the [query builder reference page](/reference/query-builders.md) for a full list of query builders and how to use them.

Let's take another look at the builders in the example above.

```javascript
self.find(req, criteria)
  .sort({ createdAt: -1 })
  .limit(5)
```

This example is using two query builders, `sort` and `limit`. As described above, `sort({ createdAt: -1})` sorts the queried documents in descending order on their `createdAt` properties (most recent first). `limit(5)` then ensures the request will return no more than five documents.

::: info
Many aspects of querying the database are the same for both page and piece queries. One thing that is different are certain query builders that only apply to requests by the page module. These builders do things like update how results should include "child" or "ancestor" pages from the page hierarchy.

There is [a section for these builders](/reference/query-builders.md#page-document-query-builders) in the reference page. There is a similar section with a builder that only works on *image* piece queries as well.
:::

### Projections: Reducing returned document data

One very useful query builder is `.project()`. We often know what specific data properties we want from a query and it is rarely *every single property*. By applying a query projection we reduce density of the data returned, making the response lighter, faster, and easier work with during development.

```
query
  .project({
    title: 1,
    _url: 1,
    _author: 1,
    publishedAt: 1
  })
```

The `project` builder is one that uses a MongoDB syntax. The object passed as an argument should include schema field names for the document type we're querying with each set to `1` or `true`. This tells the database that we only want these fields in each document we get back. In addition to simple fields, Apostrophe enhances `project` to handle relationship fields and the special property `_url`.

The `_id` property is always included no matter what projection is used.

::: info
In Apostrophe 2 this builder was named `projection`.
:::

### Paginating query results

There are a few query builders that can work together to "paginate" query results. Sometimes that is better than receiving an unknown large number of results all at once.

```javascript
query
  .perPage(20)
  .page(2)
```

This example tells the query that its results should be returned in a group of no more than 20 (`.perPage(20)`) and that we want the second group of results based on the active sort order (`.page(2)`). These builders are used in the Apostrophe REST APIs and can be very helpful when dealing with large amounts of content. They use two other builders internally (`limit` and `skip`), but can be easier to use for common situations.

### Schema field builders

Apostrophe automatically creates query builders for most [schema fields](/guide/content-schema.md) configured on piece and page types. Passing a value into a schema field builder refines the query to fetch documents that have the provided value in the matching field.

For example, we might have a select field on a `product` piece type to identify a particular category:

<AposCodeBlock>

  ```javascript
  module.exports = {
    fields: {
      add: {
        //...
        category: {
          type: 'select',
          label: 'Product Line',
          choices: [
            { value: 'professional', label: 'Professional' },
            { value: 'hobbyist', label: 'Hobby' },
            { value: 'athletic', label: 'Athletic' }
          ]
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/product-page/views/show.html
  </template>
</AposCodeBlock>

We can query products matching a particular category:

```javascript
query.category('athletic')
```

The following field types get this query builder treatment:

- `string`
- `slug`
- `boolean`
- `checkboxes`
- `select`
- `radio`
- `integer`
- `float`
- `url`
- `date`
- `relationship`

`relationship` fields get special treatment with four query builders for each field. If the field name is `_products`, then:

- `._products(product._id)` matches only documents related to the product with the provided `_id`. You can also pass an array of product IDs, in which case documents related to *at least one* of those products will match.
- `.products(product.slug)` (no leading `_`) is similar, but supports matching by the `slug` property. You can also pass an array of product slugs, in which case only documents related to *at least one* of those products will match.
- `._productsAnd([ _id1, _id2, _id3...])` matches only documents related to *all* of the specified product IDs (one relation is not enough).
- `.productsAnd([ slug1, slug2, slug3...])` (no leading  `_`) matches only documents related to *all* of the specified product slugs (one relation is not enough).

`_id` properties are useful since they will never change, but slugs can be more readable (for humans) and are more typically used in URLs.

### Adding your own query builders

We're not limited to the query builders that come in Apostrophe core. It may help to create a builder that applies certain criteria and other builders that we might otherwise have to write repeatedly across a code base.

We can do this with the `queries()` customization function in the module configuration API. See the [module configuration API reference](/reference/module-api/module-overview.md#queries-self-query) for more information.

## Finishing with query methods

Initiating a query with `find()` and adding query builders are how we set up our data request. To get results we can use, the query ends with a **query method**. The query method takes the criteria and refinement we set up and adds logic that tells the database how we want our information back.

The simplest and most commonly used query methods are **`toArray`** and **`toObject`**. They either return an array of document results or a single document result, respectively.

### `toArray`
Our query example from above uses `toArray()`. Let's look at that again.

```javascript
const products = await self.find(req, criteria)
  .sort({ createdAt: -1 })
  .limit(5)
  .toArray();
```

As we've covered already, this code sets up the initial query with criteria (`self.find`) and adds builders with additional instructions (`sort` and `limit`). The final thing it does is run `toArray()` on the query. This is telling the database, "take all the instructions we provided and give us back an array of results based on those instructions. Please." So, at the end of this, `products` will be an array of up to five document objects.

::: info
See that in our example we use `await` before `self.find`, indicating that this is running an asynchronous operation. It is worth noting that `toArray()` is the only asynchronous part of the code since that's the part that actually talks to the database.

It is totally fine to set up queries synchronously (without `await`) and then execute the query in a separate step later.

```javascript
const query = self.find(req, criteria)
  .sort({ createdAt: -1 })
  .limit(5);

const products = await query.toArray();
```
:::

### `toObject`

`toObject` is very similar to `toArray`, but it only returns one result as an object. In fact, `toObject` is basically the same as setting a `limit(1)` builder on the query then taking the single object out of the returned array. Using `toObject` simply makes it easier to write queries when we only want one result. For example, we may already know the unique `_id` of the document we want from the database.

```javascript
const productId = 'ckcqi1ye1005mof3rdgtlln0b:en:published';

const product = await self.find(req, { _id: productId })
  .toObject();
```

### `toCount`

The `toCount` query method is the easiest and quickest way to simply get the number of documents that match a query. The `toCount` query method will ignore any `page`, `skip` and `limit` query builders in order to get the total number.

If the query is using a `perPage` query builder it will also populate `totalPages` on the query, which can be retrieved with `query.get('totalPages')`.

```javascript
const productsCount = await self.find(req, criteria)
  .toCount();
```

### `toDistinct`

`toDistinct` allows us to retrieve the unique values for a particular document property from the documents that match query. For example, using `query.toDistinct('category')` will return an array with all the `category` property values across documents, with each category only appearing once in the array.

```javascript
const shoeColors = await self.find(req, { type: 'shoe' })
  .toDistinct('color');
```

### `toChoices`

The `toChoices` query method builds on `toDistinct` by returning each choice as an object with `label` and `value` properties. This can be useful when populating a select or other input field with options for a doc type property. For example, this is used for the document manager modal filter UI in Apostrophe.

`toChoices` accepts an options object as an optional second argument. Setting `counts: true` in that options object will include a `count` property on each returned choice indicating how many documents match that choice.

```javascript
const teamOffices = await self.find(req, { type: 'team' })
  .toChoices('office', { counts: true });
```

## Query across modules

The `find()` method in doc type modules is easy to use within each module as `self.find`. However this assumes we're looking for only content that is governed by the module where the method is called. There are two main ways to write these database queries from one module and get content managed by a separate module.

### Using another module's `find` method

The `self` object available in any Apostrophe module's customization functions can access other doc types on the `self.apos.modules` object. For example, if I'm working in the `article` module and want to query `author` pieces, I can access the `author` module with this:

```javascript
self.apos.modules.author
```

`self.apos.modules.author` is the same as `self` would be if we were operating within the `author` module. Therefore we can query author pieces directly by using that module's `find` method.

```javascript
const activeAuthors = self.apos.modules.author.find(req, { active: true })
  .toArray();
```

If a doc type module has been [assigned an alias](/reference/module-api/module-options.md#alias), then the doc type module will be directly on `self.apos`. For example, the `@apostrophecms/page` module is available as `self.apos.page` because `'page'` is its alias option value.

### Querying multiple doc types

As mentioned earlier, doc type modules' `find` methods will automatically restrict results to that document type. Sometimes we may want to fetch documents that match a query regardless of what doc type they are (e.g., all content tagged with a certain term). Or we may use a querying function across contexts and we don't know what doc type we will be looking for.

There is a module that governs all content documents: `@apostrophecms/doc`, which is aliased as `'doc'`. Its `find` method works the same as any individual doc type's, but it is not restricted to any one document type. We can then use it to look for a particular type with the `type` property or pass it criteria and get documents of multiple types in the results.

```javascript
const featuredContent = self.apos.doc.find(req, { featured: true })
  .toArray();


const featuredByType = self.apos.doc.find(req, {
  featured: true,
  type: selectedType // A hypothetical option a user selected.
})
  .toArray();
```

Using `self.apos.doc.find` has limitations, however. Significantly, pieces will not return with `_url` properties. We would have to run additional queries to the individual piece type module `find` methods once we knew what types we had. That is one reason why using `self.find()` from doc type modules is better when possible.

## Where in my code can I make database queries?

You can make database queries in async components (as shown above), routes
(such as in an [`apiRoutes`](../reference/module-api/module-overview.md#apiroutes-self) function), [server event handlers](./server-events.md),
middleware and in pretty much any async function in your server-side code.
However, you should avoid making database queries:

* In the `init()` function of a module, because schemas of other related
types might not yet be finalized, leading to errors in relationship queries.
* In an `apostrophe:modulesRegistered` server event handler, for the same reason.

If you wish to make queries in your module at the time the process
starts up (not on every request), writing a
`@apostrophecms/doc:beforeReplicate` server event handler is the safest
choice. If you are trying to make a query on every page request,
you should write an async component, or write an `@apostrophecms/page:beforeSend`
server event handler which will receive `(req)` as its first argument, giving
you a way to attach the query results to `req.data` for use in the template.
