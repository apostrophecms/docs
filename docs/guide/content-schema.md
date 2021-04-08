# Content schemas

The content field schema is another key concept in Apostrophe. The "schema" simply refers to the content fields for a particular page, piece, or widget type. In addition to setting fields for the user interface, it supports data validation.

Our blog post module's schema might look something like this:

```javascript
// modules/blog-post/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  fields: {
    add: {
      authorName: {
        label: 'Author name',
        type: 'string'
      },
      body: {
        label: 'Blog post body',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {}
          }
        }
      }
    },
    group: {
      blogFields: [ 'authorName', 'body' ]
    }
  }
};
```

Content schemas are configured in the `fields` setting. In this case, `fields` has two subsections: `add`, where fields are added to the schema, and `group`, which organizes the fields for the user interface.

Each property in the `add` object is a field you are including in the schema. Each property in `group` is a section of the interface, set to an array of fields to include in that section.

See the reference documentation on [the `fields` setting](/reference/module-api/module-overview.md#fields) and [individual field types](/reference/field-types/) for more information.

## Conditional fields

Schema fields may be conditional on the value of other fields in the same schema. The conditions are added in an **`if` setting** on a field. The conditions must be an object with keys matching the names of other fields in the same schema. The condition values must match the sibling field values *exactly* to pass.

::: note
Because strict equivalence is required for conditions, fields used in conditions must have values that are strings, numbers, or booleans. This is subject to change.
:::


In the following case, if the `seenMovie` field is set to `true`, the rating field will be displayed.

```javascript
// A field schema's `add` configuration
add: {
  seenMovie: {
    label: 'Have you seen this movie?',
    type: 'boolean'
  },
  rating: {
    label: 'Rate the movie from 1-5',
    type: 'integer',
    min: 1,
    max: 5,
    if: {
      seenMovie: true
    }
  }
}
```

The `if` setting may contain more than one condition. In the next example, `seenMovie` must be `true` *and* `relationship` must be `'none'` for the rating field to appear.

```javascript
// A field schema's `add` configuration
add: {
  seenMovie: {
    label: 'Have you seen this movie?',
    type: 'boolean'
  },
  relationship: {
    label: 'What is your relationship to the filmmakers?',
    type: 'select',
    choices: [
      {
        label: 'Family',
        value: 'family'
      },
      {
        label: 'Friend',
        value: 'friend'
      },
      {
        label: 'None',
        value: 'none'
      }
    ]
  },
  rating: {
    label: 'Rate the movie from 1-5',
    type: 'integer',
    min: 1,
    max: 5,
    if: {
      seenMovie: true,
      relationship: 'none'
    }
  }
}
```


## Using existing field groups

Fields that a piece type inherits will likely already be in field groups. This includes the default fields `title`, `slug`, and `visibility`. You can add new fields into these groups and rearrange them if needed. There are a few things to keep in mind as you do.

### It's fairly simple to see what the existing groups are

 Working with inherited fields and field groups can be difficult when you don't know what they are. You can make it easier by logging them in your terminal from the module's [initialization function](/reference/module-api/module-overview.md#initialization-function).

```javascript
// modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  init (self) {
    console.log(self.fieldsGroups);

    // Output:
    // {
    //   basics: { label: 'Basics', fields: [ 'title' ] },
    //   utility: { fields: [ 'slug' ] },
    //   permissions: { label: 'Permissions', fields: [ 'visibility' ], last: true }
    // }
  }
};
```

The `init` function runs once on start up and has access to the module as an argument. By the time it runs, the field groups have been compiled into an object named `fieldsGroups`. If you haven't added any fields yet you can log this to see what you are working with.

::: note
You will see a `trash` field in the log output. The interface does not show this as a normal field, but it is registered as one to support editing via the REST API.
:::

### Reusing an inherited group's name will ungroup its original fields

For example, `title` is in the default "Basics" group. If you add a `basics` group in your field configuration and do not include `title` in its `fields` array, it will no longer be in any group. Fields that are not part of any group will appear in an "Ungrouped" tab in the interface.

As in the example above, you could include `title` with the "Basics" group along with new fields.

```js
// modules/product/index.js
module.exports = {
  // ...
  fields: {
    add: {
      // ...
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'price', 'description', 'image' ]
      }
    }
  }
};
```

### You don't need a `basics` group

There is nothing special about "Basics." It is a default group name, but if you place all of the fields from that group (or any inherited group) in a new one the group will no longer appear in the UI.

`utility` _is_ a special group. It places fields in the right column of the content editor interface. You are allowed to add fields to that group and move existing fields.

![The utility field group](/images/fields-utility-highlight.jpg)
