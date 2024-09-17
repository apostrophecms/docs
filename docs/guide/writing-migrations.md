# Writing Migrations

Migrations in ApostropheCMS allow you to make targeted changes to your database, ensuring that your data stays in sync with the evolving structure of your code. They are particularly useful when new code deployments introduce changes to the underlying data model or schema, such as adding new fields, removing deprecated properties, or correcting inconsistencies in existing content. In this guide, we will walk through how to write migrations to add or remove properties from existing pieces and widgets.

## Adding migrations

In ApostropheCMS, migrations are added using the `add(name, fn)` method of the `@apostrophecms/migration` module. One common place to add these are within the `init(self)` initialization function of your module. Each migration requires a unique name and is only run **once**. ApostropheCMS tracks which migrations have already been executed, ensuring they won’t run again across restarts or deployments.

While the migration function can be added as an anonymous function as the second argument to the `add()`method, they can also be defined in the `methods(self)` customization function of the module. This can provide for a cleaner `init(self)` function, but is a matter of preference.

Example adding the migration to `init(self)`

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/piece-type',
  async init(self) {
    // Adding a migration named 'add-featured-to-articles'
    self.migration.add('add-featured-to-articles', async () => {
      return self.apos.migration.eachDoc({
        type: 'article'
      }, async (doc) => {
        if (doc.featured === undefined) {
          await self.apos.doc.db.updateOne({
            _id: doc._id
          }, {
            $set: { featured: false }
          });
        }
      });
    });
  }
};
```
<template v-slot:caption>
  /modules/product/index.js
</template>

</AposCodeBlock>

Example using `methods(self)`:

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/piece-type',
  async init(self) {
    self.apos.migration.add('add-product-description', self.addProductDescription);
  }
  methods(self) {
    return {
      async addProductDescription() {
        await self.apos.migration.eachDoc({
          type: 'product'
        }, async (doc) => {
          if (doc.description === undefined) {
            await self.apos.doc.db.updateOne({
              _id: doc._id
            }, {
              $set: { description: 'No description available' }
            });
          }
        });
      };
    }
  }
};
```
<template v-slot:caption>
  /modules/product/index.js
</template>

</AposCodeBlock>

For both of these examples we are looping through all documents to find the `product` piece types. Then we are using the document `_id` and the Apostrophe database helper method `updateOne` to run the MongoDB operation `$set` that will either create or update the value of the `description` field for that piece.

### Running Migrations in Production

In production environments, migrations are **not** automatically executed on every startup. This prevents accidental re-running of migrations in stable environments. Instead, migrations must be triggered manually by running a task.

To apply pending migrations in a production environment, run:

```bash
node app @apostrophecms/migration:run
```

This ensures that any new migrations are executed in a controlled manner, which is particularly useful in environments where uptime and stability are critical.

## Adding or Modifying a Property in Existing Documents

When a new property needs to be added to all instances of a document type, you can use the `eachDoc` helper provided by the migration module. This method efficiently queries documents in your collection and allows you to update them with only the necessary changes.

Here is an example migration that adds a `featured` boolean property to all `article` pieces, defaulting to `false`:

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/piece-type',
   async init(self) {
    self.apos.migration.add('change-featured-flag', self.changeFeaturedFlag);
  }
  methods(self) {
    return {
      async changeFeaturedFlag(self) {
        return self.apos.migration.eachDoc({
          type: 'article'
        }, async (doc) => {
          if (doc.featured === undefined) {
            await self.apos.doc.db.updateOne({
              _id: doc._id
            }, {
              $set: { featured: false }
            });
          }
        });
      }
    }
  }
};
```
<template v-slot:caption>
  /modules/article/index.js
</template>

</AposCodeBlock>

In this example:

- The `eachDoc` method iterates over all documents, finding those with the `type` of `article`.
- For each found document, we check if the `featured` property is missing.
- We use the shorthand `self.apos.doc.db` to access the `aposDocs` collection of our database.
- The [`updateOne`](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/modify/) helper operation allows us to modify the document by passing in the document `_id`.
- Finally, we use []`$set` operator](https://www.mongodb.com/docs/manual/reference/operator/update/set/) to add the `featured` property without modifying any other fields.

::: info
Note: In this example we are checking if the `featured` property is missing before using `$set`. This will prevent overwriting any existing values in the database. This might not be the behavior you intend. You might want all `featured` schema fields set to false. In this case, just skip the check and the `$set` operation will either create the featured field or change the value to `false` if it already exists.
:::

### Removing a Property from Existing Documents

If you need to remove a property, you can use `$unset`. Here’s an example that removes a `temporaryNote` property from all `default` page types:

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/page-type',
  init(self) {
    self.apos.migration.add('remove-note', self.removeNote);
  },
  methods(self) {
    return {
      async removeNote(self) {
        return self.apos.migration.eachDoc({
          type: 'default-page'
        }, async (doc) => {
          if (doc.temporaryNote !== undefined) {
            await self.apos.doc.db.updateOne({
              _id: doc._id
            }, {
              $unset: { temporaryNote: '' }
            });
          }
        });
      }
    }
  }
};
```
<template v-slot:caption>
  /modules/article/index.js
</template>

</AposCodeBlock>

- In this example, `$unset` is used to remove the `temporaryNote` property from the document. Note that the value of the property in `$unset` doesn't matter, you could also elect to pass `null`.

## Adding a Missing Property to Existing Widgets

Similar to updating pieces and pages, you can use the `eachWidget` helper to add or remove properties from widgets of a specific type. This is useful when updating the schema of a widget across all pages or pieces.

Here is an example migration that adds an `alignment` property to all `image` widgets, defaulting to `center`:

```js
module.exports = {
  extend: '@apostrophe/widget-type',
  init(self) {
    self.apos.migration.add('align-images', self.alignImages);
  }
  methods(self) {
    return {
      async alignImages(self) {
        return self.apos.migration.eachWidget({
          type: 'image'
        }, async (widget, doc, fieldName) => {
          if (widget.alignment === undefined) {
            await self.apos.doc.db.updateOne({
              _id: doc._id,
              [fieldName + '._id']: widget._id
            }, {
              $set: { [fieldName + '.$.alignment']: 'center' }
            });
          }
        });
      }
    }
  }
};
```

- The `eachWidget` method iterates over every widget in every area in every document.
- In our first `criteria` argument we pass a type of `image` to return all instances of `image` widgets.
- We check if the `alignment` property exists, and if not, we use `$set` to add it.

### Removing a Property from Existing Widgets

Here’s how you can remove a property from widgets using `$unset`. In this case, we are removing the `border` property from all `video` widgets:

```js
module.exports = {
  async migrate(self) {
    return self.apos.migration.eachWidget({
      type: 'video'
    }, async (widget, doc, fieldName) => {
      if (widget.border !== undefined) {
        await self.apos.doc.db.updateOne({
          _id: doc._id,
          [fieldName + '._id']: widget._id
        }, {
          $unset: { [fieldName + '.$.border']: '' }
        });
      }
    });
  }
};
```

- The `eachWidget` method iterates over all instances of `video` widgets.
- We use `$unset` to remove the `border` property from the widget.

## Summary

Migrations in ApostropheCMS allow you to make precise changes to your content without touching unnecessary fields, minimizing the risk of conflicts or race conditions. By using MongoDB's `$set` and `$unset` operations alongside `migration.eachDoc` and `migration.eachWidget`, you can add or remove properties from both pieces and widgets in a safe and efficient manner.

For more information, refer to the [migration module reference](https://docs.apostrophecms.org/reference/modules/migration.html).