---
prev:
  text: 'Database Queries'
  link: 'guide/database-queries.md'
next:
  text: 'Accessing the database directly'
  link: 'guide/database-access.md'
---
# Inserting and updating in server-side code

Apostrophe provides module methods for inserting and updating content documents in the database. These methods should be the primary tools for developers doing server-side data operations since they [emit events](/guide/server-events.md) that the CMS uses to keep all database collections updated and in sync. We will look at methods for both pieces and pages, which are similar but have some important differences.

::: info
Remember that the Apostrophe REST APIs for [pieces](/reference/api/pieces.md) and [pages](/reference/api/pages.md) are usually the best option when triggering content updates from the browser. Those API endpoints take advantage of the methods below while adding logic important to use in browsers.
:::

## Updating content documents

When we have an existing piece document that to update, we use the `update()` method on the related piece type module. The `update` method takes the following arguments:

| Argument | Required | Description |
| -------- | -------- | ----------- |
| `req` | TRUE | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
| `piece` | TRUE | The document object that will *replace* the existing database document. |
| `options` | FALSE | An options object, currently only used for internal draft state management. |

For example, if we had a dog adoption website that used an external API, we may want to update `dog` pieces periodically with adoption status. This may be using a command line task that is run regularly by a cron job.

<AposCodeBlock>

  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-type',
    // ...
    methods (self) {
      return {
        // The hypothetical method is run once for each dog we're following from
        // the API. A separate method would add any new dogs.
        async updateDogStatus(req, dogId, status) {
          const dogDocument = await self.find(req, {
            dogId
          }).toObject();
  
          if (!dogDocument) {
            return null;
          };
  
          // We update the `status` property.
          dogDocument.status = status;
  
          const updateResult = await self.update(req, dogDocument);
  
          return updateResult;
        }
      };
    }
  };
  ```
  
  <template v-slot:caption>
    modules/dog/index.js
  </template>
</AposCodeBlock>

**What is happening here?**

```javascript
async updateDogStatus(req, dogId, status) {
  const dogDocument = await self.find(req, {
    dogId
  }).toObject();
  ...
}
```

Our method received the active request object, the API's identifier for a dog, and the dog's availability status (probably a string value). We then request the *full* database document. See the [database querying guide](/guide/database-queries.md) for more on this.

```javascript
if (!dogDocument) {
  return null;
};
```

If the identified dog isn't in our database yet, we would return a `null` value and the update task's function could insert the dog instead.

```javascript
// We update the `status` property.
dogDocument.status = status;

const updatedDraft = await self.update(req, dogDocument);

return updatedDraft;
```

We update the document property that tracks the dog's adoption status on the data object and use `self.update` to replace the previous document state with our update (with `await` as it is asynchronous). We finally return the result, which will be the updated document object.

Note that using the provided `req` object like this works only if the `req` object is from a user with *at least* "contributor" permissions for the `dog` piece type. **If we wanted to bypass that permission check**, or if we ever wanted to allow anonymous site visitors to insert or update content, we would pass `{ permissions: false }` as a third options argument to `self.update()`. That obviously raises security issues we would need to consider carefully.

::: info
All content documents have multiple versions, including "draft" and "published" versions. The `update()` methods only updates the "draft" copy, allowing editors to still review before publishing. If we *did* want to publish here as well, we would want to run the publishing method:

```javascript
await self.publish(req, updatedDraft);
```

**What if we are updating a document from a different doc type module?**

In the example above, `self` refers to the `dog` piece type module since that is where the method is registered. If we wanted to run the `update` method from a separate module we would replace `self` with a specific reference to the `dog` module: **`self.apos.modules.dog`**.
:::

### Updating page documents

Updating pages works the same way as pieces with the same arguments to the `update` method. There are a few things to keep in mind when working on pages, however.

**We typically call the page `update` method from the main page module: `self.apos.page.update()`.** Since pages can change their `type` property (unlike pieces) they share a single `update` method from the `@apostrophecms/page` module. `self.update()` on individual page type modules is simply a wrapper around that method.

**`update()` is not the way to move pages within the [page tree](/guide/pages.md#connecting-pages-with-page-tree-navigation).** The `@apostrophecms/page` module has [a dedicated `move()` method](/reference/modules/page.md#async-move-req-pageid-targetid-position) for that purpose. The [REST API information about page tree placement](/reference/api/pages.md#post-api-v1-apostrophecms-page) has additional information.

## Inserting a new piece

Inserting a new piece works very similarly to updating an existing one. The `self.insert` method takes the same arguments: `self.insert(req, piece, options)`. The big difference, of course, is that there is no existing document to find, update, and resubmit.

Instead, use the `self.newInstance()` method to get a fresh document object of the proper document type. That method uses the doc type's [field schema](/guide/content-schema.md) to generate the essential document properties with any default values. We can then add any initial data to that essentially blank document object.

<AposCodeBlock>

  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-type',
    // ...
    methods (self) {
      async addNewDog(req, initialInfo) {
        // Generate a blank dog data object.
        let newDog = self.newInstance();
        // Add our initial information to the object.
        newDog = {
          ...newDog,
          ...initialInfo
        };
        // Insert the dog with the asynchronous `self.insert` method
        const insertResult = await self.insert(req, newDog);

        return insertResult;
      }
    }
  };
  ```
  <template v-slot:caption>
    modules/dog/index.js
  </template>
</AposCodeBlock>

## Inserting pages

As mentioned above, pages have a position within the page tree. The `insert` method for pages therefore requires additional arguments to place a new page in that hierarchy properly. Also [as described above](#updating-page-documents) we normally call the insert method directly from the `@apostrophecms/page` module, aliased in server-side code as `self.apos.page`.

The arguments for the `self.apos.page.insert()` method are:

| Argument | Required | Description |
| -------- | -------- | ----------- |
| `req` | TRUE | The associated request object. Using a provided `req` object is important for maintaining user role permissions. |
|`_targetId` | TRUE | The `_id` of an existing page to use as a target when inserting the new page. `_home` and `_archive` are optional conveniences for the home page and [archived section](/reference/api/pages.md#moving-pages-to-the-archive), respectively. |
|`_position` | TRUE | A numeric value will represent the zero-based child index under the `_targetId` page. `before`, `after`, `firstChild`, or `lastChild` values set the position within the page tree for the new page in relation to the target page (see `_targetId`). `before` and `after` insert the new page as a sibling of the target. `firstChild` and `lastChild` insert the new page as a child of the target. |
| `page` | TRUE | The page document object. |
| `options` | FALSE | An options object, primarily used for internal draft state management. |

As with pieces, this process will normally begin by generating an empty page document with the `newInstance()` method, which should be done using a specific page type module.


<AposCodeBlock>

  ```javascript
  let newPage = self.newInstance();

  newPage = {
    ...newPage,
    ...initialInfo
  };

  await self.apos.page.insert(req, '_home', 'lastChild', newPage);
  ```
  <template v-slot:caption>
    modules/special-page/index.js
  </template>
</AposCodeBlock>

::: info
With very few exceptions, the `_id` property is an automatically generated, randomized, and (always) unique property. It is also special in that it can never change for a given document.
:::
