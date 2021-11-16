# Custom batch operations

Apostrophe piece type modules have access to a batch operation system in the user interface. This allows editors to take an action, such as archiving, on many pieces at once. By default, all piece types have batch operation UI for archiving pieces and restoring pieces from the archive, for example.

![An article piece manager modal with arrow pointing at the archive button at top left](/images/archive-button.png)

We can add additional custom batch operations using [the provided module API](/reference/module-api/module-overview.md#batchoperations). Let's look at how we would add a batch operation that resets piece field values to the configured defaults. This involves two major steps:

1. Configuring the batch operation itself
2. Adding the API route that powers the batch operation

## Configuring the batch operation

Batch operations are a ["cascading" configuration](/reference/module-api/module-overview.md#cascading-settings), so they use `add` and, optionally, `group` sub-properties to inherit existing batch operations properly. Here is an example of what the "Reset" batch operation configuration might look like. We'll then walk through each piece of this.

<AposCodeBlock>
  ```javascript
  module.export = {
    batchOperations: {
      add: {
        reset: {
          label: 'Reset',
          icon: 'recycle-icon',
          messages: {
            progress: 'Resetting {{ type }}...',
            completed: 'Reset {{ count }} {{ type }}.'
          },
          if: {
            archived: false
          },
          modalOptions: {
            title: 'Reset {{ type }}',
            description: 'Are you sure you want to reset {{ count }} {{ type }}?',
            confirmationButton: 'Yes, reset the selected content'
          }
        },
      }
    },
    icons: {
      'recycle-icon': 'Recycle'
    },
  };
  ```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

Our new batch operation, `reset`, is in the `add` object, telling Apostrophe that this is a new operation to add to the module. It then has a number of configuration properties:

```javascript
label: 'Reset',
```

`label` defines its legible label. The label is used for accessibility when this is an *ungrouped* operation and is used as the primarily interface label when the operation is *grouped*. We should always include a label.

```javascript
icon: 'recycle-icon',
```

The `icon` setting is the primary visible interface when the operation is not in an operation group (see below for more on that). Note that this icon is [configured in the `icons` module setting](/reference/module-api/module-overview.md#icons) in the example.

```javascript
messages: {
  progress: 'Resetting {{ type }}...',
  completed: 'Reset {{ count }} {{ type }}.'
},
```

The `messages` object properties are used in notifications that appear to tell the editor what is happening behind the scenes. The `progress` message appears when the operation begins and the `completed` messages appears when it is done.

They both can use the `type` interpolation key, which Apostrophe replaces with the piece type label. The `completed` message can also include a `count` interpolation key, which is replaced by the number of pieces that were updated.

```javascript
if: {
  archived: false
},
```

`if` is an optional property that allows you to define filter conditions when the option is available. In this case, the "Reset" operation is only available when the `archived` filter is `false` (the editor is not looking at archived pieces). This might be because archived pieces should be left as they are and not reset to their defaults. This property works similar to [conditional schema fields](/guide/conditional-fields.md), but in this case the conditions are for manager filters, not fields.

```javascript
modalOptions: {
  title: 'Reset {{ type }}',
  description: 'Are you sure you want to reset {{ count }} {{ type }}?',
  confirmationButton: 'Yes, reset the selected content'
}
```

The `modalOptions` object configures the confirmation modal that appears when an editor initiates a batch operation. This confirmation step helps to prevent accidental changes to possibly hundreds of pieces. If this is not included, the batch operation's `label` is used for the title, there is no description, and the standard confirmation button label is used (e.g., "Yes, continue.").

With these configuration, we should immediately see a button for the "Reset" operation in the article piece manager.

![The article piece manager, now with a button using the recycle symbol](/images/batch-operation-recycle-button.png)

## Adding the API route

Right now if we clicked that new button and confirmed to continue nothing would happen except for an error notification saying something like "Batch operation Reset failed." Since the batch operation is called `reset`, the manager is going to look for an API route at `/v1/api/article/reset` (the piece type's base API path, plus `/reset`). We need to add that route to the piece type.

Batch operation route handlers will usually have a few steps in common, so we can look at those elements in the example below.

<AposCodeBlock>
  ```javascript
  module.export = {
    // `batchOperations` and other module settings...
    apiRoutes(self) {
      return {
        post: {
          reset(req) {
            // Make sure there is an `_ids` array provided.
            if (!Array.isArray(req.body._ids)) {
              throw self.apos.error('invalid');
            }

            // Ensure that the req object and IDs are using the same locale
            // and mode.
            req.body._ids = req.body._ids.map(_id => {
              return self.inferIdLocaleAndMode(req, _id);
            });

            // Run the batch operation as a "job," passing the iterator function
            // as an argument to actually make the changes.
            return self.apos.modules['@apostrophecms/job'].runBatch(
              req,
              self.apos.launder.ids(req.body._ids),
              resetter,
              {
                action: 'reset'
              }
            );

            // The iterator function that updates each individual piece.
            async function resetter (req, id) {
              const piece = await self.findOneForEditing(req, { _id: id });

              if (!piece) {
                throw self.apos.error('notfound');
              }

              // 🪄 Do the work of resetting piece field values.

              await self.update(req, piece);
            }
          }
        }
      };
    }
  };
  ```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

Let's look at the pieces of this route, focusing on the parts that are likely to be common among most batch operations.

```javascript
apiRoutes(self) {
  return {
    post: {
      reset(req) {
        // ...
      }
    }
  };
}
```

We're adding our route to the [`apiRoutes` customization function](/reference/module-api/module-overview.md#apiroutes-self) as a `POST` route since the route will need to receive requests with a `body` object.

```javascript
if (!Array.isArray(req.body._ids)) {
  throw self.apos.error('invalid');
}
```

The Apostrophe user interface should take care of this for you, but it is always a good idea to include a check to make sure that the body of the reqest includes an `_ids` array.

```javascript
req.body._ids = req.body._ids.map(_id => {
  return self.inferIdLocaleAndMode(req, _id);
});
```

This step may not be obvious, but since Apostrophe documents have versions in various locales, as well as both "live" and "draft" modes, it's important to use the `self.inferIdLocaleAndMode()` method on the IDs in most cases. In this context it is primarily used to update the `req` object to match the document IDs.

```javascript
  return self.apos.modules['@apostrophecms/job'].runBatch(
    req,
    self.apos.launder.ids(req.body._ids),
    resetter,
    {
      action: 'reset'
    }
  );
  ```

  This is more or less the last part (though we'll also need to take a look at that `resetter` iterator). The job module, `@apostrophecms/job`, has methods to process long-running jobs, including `runBatch` for batch operations. `runBatch` takes the following arguments:
  - the `req` object
  - an array of IDs, `req.body._ids`, used to find database documents to update (we're running it through a method that ensures they are ID-like)
  - an iterator function (more on that below)
  - an options object, which we always use to include to define the `action` name for client-side event handlers

```javascript
async function resetter (req, id) {
  const piece = await self.findOneForEditing(req, { _id: id });

  if (!piece) {
    throw self.apos.error('notfound');
  }

  // 🪄 Do the work of resetting piece field values here...

  await self.update(req, piece);
}
```

Finally, the iterator, `resetter` in this example, will receive the request object and a single document ID. This is where we as developers need to do the work of updating each selected piece. Our example here finds the piece, throws an error if not found, then eventually uses the `update` method to update the piece document. The magic `🪄` comment is where we would add the additional functionality to actually reset values.

With that API route added, when we restart the website and run the batch operation again we should see our notifications indicating that it completed successfully.

![The articles manager modal with two notifications indicating that the batch operation completed successfully](/images/batch-operation-complete.png)