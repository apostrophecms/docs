# Writing Migrations

Migrations in ApostropheCMS allow you to make targeted changes to your database, ensuring that your data stays in sync with the evolving structure of your code. If your goal is to ensure a newly-added field in the schema will be present in the database for existing documents with its default value (as specified by def, or the fallback def of the field type such as the empty string for string fields), then you do not need to write a migration. As of version 4.x, this is automatic. However, if you need to transform the existing content of the database in another way, such as renaming or removing a property or transforming a number to a string, then migrations are the right tool for you. In this guide, we will walk through how to write migrations to add or remove properties from existing pieces and widgets.

## Adding migrations

In ApostropheCMS, migrations are added using the [`add(name, fn)` method](/reference/modules/migration.md#add-name-fn) of the `@apostrophecms/migration` module. One common place to add these is within the `init(self)` initialization function of your module. Each migration requires a unique name and is only run **once**. ApostropheCMS tracks which migrations have already been executed, ensuring they won’t run again across restarts or deployments.

While the migration function can be added as an anonymous function as the second argument to the `add()`method, they can also be defined in the `methods(self)` customization function of the module. This can provide for a cleaner `init(self)` function, but is a matter of preference.

Example adding the migration to `init(self)`:

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/piece-type',
  async init(self) {
    self.migration.add('add-copyright-notice', async () => {
      return self.apos.migration.eachDoc({
        type: 'article'
      }, async (doc) => {
        if (doc.copyright === undefined) {
          await self.apos.doc.db.updateOne({
            _id: doc._id
          }, {
            $set: { copyright: '©2024 ApostropheCMS. All rights reserved.' }
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
    self.apos.migration.add('add-copyright-notice', self.addCopyrightNotice);
  }
  methods(self) {
    return {
      async addCopyrightNotice() {
        await self.apos.migration.eachDoc({
          type: 'article'
        }, async (doc) => {
          if (doc.copyright === undefined) {
            await self.apos.doc.db.updateOne({
              _id: doc._id
            }, {
              $set: { copyright: '©2024 ApostropheCMS. All rights reserved.' }
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

For both of these examples we are looping through all documents to find the `article` piece types. Then we are using the document `_id` and the Apostrophe database helper method `updateOne` to run the MongoDB operation `$set` that will either create or update the value of the `copyright` field for that piece. We will go through additional examples in detail below.

### Running Migrations in Production

Although migrations currently do run automatically in both development and production, it is best practice to run the `@apostrophecms/migration:migrate` task in production before launching the newest version of the application to serve requests. At a future time, an option to disable Apostrophe's check for needed migrations on ordinary invocations in production may be offered as an optimization.

```bash
node app @apostrophecms/migration:migrate
```

## Adding or Modifying a Property in Existing Documents

When a property of all instances of a document type needs to be changed, transformed or added in a way more complicated than setting `def` at the time it is first added to the code, you can use the [`eachDoc`](/reference/modules/migration.md#async-eachdoc-criteria-limit-iterator) helper provided by the migration module. This method efficiently queries documents in your collection and allows you to update them with only the necessary changes. The `eachDoc` helper takes three parameters.

The first is the `criteria` object. This object is in the same format as a [MongoDB `find` operation query](https://www.mongodb.com/docs/v4.4/reference/method/db.collection.find/). It takes any properties that will be in your document, for example `type`, which will find documents of that type. You need to pass at least one `criteria` property.

The second is `limit` and is optional. It allows you to pass an integer that specifies how many documents to process in parallel. If no integer is passed as the second argument it is 1 by default.

The third criteria is the `iterator` function that should be performed on every document found. It receives the document as an argument. You can use most MongoDB methods here, but typically it uses the [`updateOne` method](https://www.mongodb.com/docs/drivers/csharp/current/usage-examples/updateOne/) to modify the document being passed to the iterator.

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
        await self.apos.migration.eachDoc({
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
- Finally, we use the [`$set` operator](https://www.mongodb.com/docs/manual/reference/operator/update/set/) to add the `featured` property without modifying any other fields.

::: info
Note: In this example we are checking if the `featured` property is missing before using `$set`. This will prevent overwriting any existing values in the database. This might not be the behavior you intend. You might want all `featured` schema fields to have a value of false as a default. In this case, just skip the check and the `$set` operation will either create the featured field or change the value to `false` if it already exists.
:::

## Removing a Property from Existing Documents

If you need to remove a property, you can use `$unset`. Note that this is going to remove that data from the database and it can't be recovered. You can opt to simply remove the field from the document schema until you are certain the information it contains can be deleted. Here’s an example that removes a `temporaryNote` property from all `default` page types:

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
        await self.apos.migration.eachDoc({
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

- In this example, [`$unset`](https://www.mongodb.com/docs/manual/reference/operator/update/unset/) is used to remove the `temporaryNote` property from the document. Note that the value of the property in `$unset` doesn't matter, you could also elect to pass `null`.
- The rest of this example is essentially like the `$set` example above.

## Adding a Missing Property to Existing Widgets

Similar to updating pieces and pages, you can use the `eachWidget` helper to add or remove properties from any widget. This is useful when updating the schema of a widget across all pages or pieces. This works whether the widget is within a top-level `area` or has been nested in an `object` field, `array` field, or even in an `area` of another widget.

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
        await self.apos.migration.eachWidget({},
          async (doc, widget, dotPath) => {
          if (widget.type !== '@apostrophecms/image') {
            return;
          }
          if (widget.alignment === undefined) {
            await self.apos.doc.db.updateOne({
              _id: doc._id,
            }, {
              $set: {
                [`${dotPath}.alignment`]: 'center'
              }
            });
          }
        });
      }
    }
  }
};
```

- The `eachWidget` method iterates over **every** widget in **every** area in **every** document. For this reason, you should check the `widget.type` to make sure you are only altering the desired widgets.
- In our `criteria` argument we are passing an empty object, indicating that every document should be checked. You can narrow this focus if you only want the widgets on a certain document type changed. For example, passing `type: 'product'` would only change widgets that are in a product piece-type.
- In the iterator, we first confirm that the widget is an image widget by checking the `widget.type`. If it is an image, we then check if the `alignment` property is present. If the `alignment` property is missing, we use `$set` to add it.

The `iterator` in an `eachWidget` method gets three arguments. In addition to the document, `doc`, where the widget is found, it also receives the `widget` object that will be modified and the `dotPath`. The `dotPath` argument represents the location of the current widget within the document's structure, using a "dot notation" format. It allows you to trace exactly where the widget is nested within its parent area, such as `main.content.0`, where `main` is the area, `content` is the widget array, and `0` is the first widget in that array. This simplifies the process of pointing the MongoDB operation at the correct widget within a document.

## Removing a Property from Existing Widgets

Here’s how you can remove a property from widgets using `$unset`. Again, this is an irreversible operation, so you may want to simply remove a schema field. In this case, we are removing the `border` property from all `video` widgets:

```js
module.exports = {
  extend: '@apostrophe/widget-type',
  init(self) {
    self.apos.migration.add('remove-vid-border', self.removeVidBorder);
  }
  methods(self) {
    return {
      async removeVidBorder(self) {
        await self.apos.migration.eachWidget({},
          async (doc, widget, dotpath) => {
            if (widget.type !== '@apostrophecms/video') {
              return;
            }
            if (widget.border !== undefined) {
              await self.apos.doc.db.updateOne({
                _id: doc._id
              }, {
                $unset: { `${dotPath}.border`: '' }
              });
            }
        });
      }
    }
  }
};
```

- The `eachWidget` method iterates over all document returning each widget found.
- We check that the widget is the type we want to alter, else we return early.
- We use `$unset` to remove the `border` property from the widget if it exists.

## Additional Migrations
While the examples above use `eachDoc` and `eachWidget` to iterate over and modify documents, you're welcome to use any MongoDB APIs you're familiar with to perform migrations. For instance, if your migration needs are simple and easily expressed through MongoDB's query capabilities, methods like `updateMany` can be more efficient than iterating over every document individually.

For example, the first migration using `eachDoc` could easily be performed by an `updateMany`:

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
   async init(self) {
    self.apos.migration.add('change-featured-flag', self.changeFeaturedFlag);
  }
  methods(self) {
    return {
      async changeFeaturedFlag(req) {
        await self.apos.doc.db.updateMany(
          {
            type: 'article',
            featured: { $exists: false }
          },
          {
            $set: { featured: false }
          }
        );
      }
    }
  }
};
```
<template v-slot:caption>
  /modules/product/index.js
</template>

</AposCodeBlock>

In this case we are finding all the article piece-type documents that don't currently have a `featured` field. It then uses `$set` to create the field.