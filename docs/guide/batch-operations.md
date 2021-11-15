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
  modules.export = {
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

