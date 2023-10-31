---
prev:
  text: 'Content fields'
  link: 'guide/content-schema.md'
next:
  text: 'Connecting content with relationships'
  link: 'guide/relationships.md'
---

# Displaying conditional fields

When defining a field schema, you may make the display of fields conditional on other field values using the `if` setting. Until the `if` setting conditions are met, the field will be hidden from the content creator. Simple conditions are passed as an object with keys *matching the names of other fields in the same schema*. The condition values must match the sibling field values *exactly* to pass.

::: info
Because strict equivalence is required for conditions, fields used in conditions must have values that are strings, numbers, or booleans.
:::

In the following case, if the `seenMovie` field is set to `true`, the rating field will be displayed.

```javascript
// A field schema's `add` configuration
add: {
  // 👇 This boolean field must be set to `true` in the editor interface
  seenMovie: {
    label: 'Have you seen this movie?',
    type: 'boolean'
  },
  rating: {
    label: 'Rate the movie from 1-5',
    type: 'integer',
    min: 1,
    max: 5,
    // 👇 Here is our condition definition
    if: {
      seenMovie: true
    }
  }
}
```
## Nested Conditional Fields

You can also create a hierarchy of conditional fields where child field visibility depends on a parent field. While the display of this parent field, in turn, is influenced by the value of another field in the schema. The child fields will remain hidden until both the parent field conditional display criteria is satisfied and the value of the parent field fulfills the child field conditional.

## Complex conditions

In addition to simple field names, the conditional object can take the name of a method as a key. The sibling field value will be compared using strict equivalence to the value returned from the method. Like simple conditional fields, the returned value should be a string, number, boolean, or any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

This conditional method can either be defined in the `methods` section of the same module as the conditional field, or another module by prefixing the method with the name of defining module followed by a colon. In either case, the method name must have parentheses appended to the end.

::: info
The property here is a string, not the actual method, so you can't pass arguments back to the method within the parentheses.
:::

The method will receive values of `(req, {docId})`, where the `docId` is `null` if the document is being created for the first time. Otherwise, the `docId` will contain the `_id` for a piece/page, or if the method is being called from a widget, the `_id` of the document where the widget is being added. The call is a server-side, asynchronous method, just like that supported for dynamic selection choices. It only occurs when the editor modal is first opened. This is unlike simple conditional fields which continuously poll other schema fields in the same module. Any changes that occur while the editor is open will not alter the original value returned from the call until the modal is closed. Additionally, the returned value is cached on the first call, so if multiple fields depend on the same method, that method will only be called once.

<AposCodeBlock>

``` javascript
module.exports = {
  fields: {
    add: {
      selectSponsors: {
        label: 'Select a project sponsor',
        type: 'select',
        // populate choices dynamically
        choices: 'sponsorNames',
        if: {
          // `()` are mandatory, method defined in the `article` module
          'isSponsored()': true
        }
      },
      grantName: {
        label: 'Select a grant',
        type: 'select',
        choices: 'grantNames',
        if: {
          // method defined in `modules/grant/index.js`
          'grant:multipleFundingSources()': 'multiple'
        }
      }
    }
    // remainder of fields omitted for brevity
  },
  methods(self) {
    return {
      async isSponsored(req, { docId }) {
        // code to check sponsorship, potentially to outside API
        const response = await fetch(url, {options});
        const grantData = await response.json();
        if (grantData.sponsored === true) {
          // show the field
          return true;
        };
        // don't show the field
        return false;
      }
    };
  }
};

```

<template v-slot:caption>
modules/article/index.js
</template>
</AposCodeBlock>

## Multiple required conditions

**The `if` setting may contain more than one condition.** When there is more than one, all conditions must be met before the field will be active. These conditions can be a mix of comparisons to other schema fields within the same modal, and calls to a method.

In the next example, `seenMovie` must be `true` *and* `votingOpen()` must be `true` for the rating field to appear.

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
    // 👇 Two conditions that both must be met
    if: {
      seenMovie: true,
      'votingStillOpen()': true
    }
  }
}
```
## Conditional field requirement

In addition to conditionally displaying a field, you can also conditionally mark a field as `required: true` based on the value of another field using the `requiredIf` setting. Like `if`, this property takes an object with keys *matching the names of other fields in the same schema*. The condition values must match the sibling field values *exactly* to pass.

Also like the `if` setting, the `requiredIf` can take complex conditionals with a mix of comparisons to other schema fields within the same modal, and calls to a method. All conditions must be met before the field will be active.

You can have both an `if` and `requiredIf` with different conditions on the same field. If the conditions for the `if` are not met, the `requiredIf` will be ignored.

## Special conditional operators

| Conditional operator | Value type | Description |
| -------------------- | ---------- | ----------- |
| [`$or`](#or) | Array | The `$or` condition passes if any of the array conditions pass |

### `$or`

Condition rules may be independent of one another. Add separate condition rules in an array of object using the key `$or` to show the field if any of the condition groups pass. A mixture of simple equivalence and method calls can be used.

In this example, the rating field will display if *either* `seenMovie` or `uninformedOpinion` is true, if `contributorLevel` is 'intermediate' or 'expert', or if a call to the `featuredMovie()` method returns `true`.

```javascript
// A field schema's `add` configuration
add: {
  seenMovie: {
    label: 'Have you seen this movie?',
    type: 'boolean'
  },
  uninformedOpinion: {
    label: 'Do you have an uninformed opinion about the movie?',
    type: 'boolean'
  },
  contributorLevel: {
    label: 'How many movies have you previously rated in total?',
    type: 'select',
    choices: [
      {
        label: '<100',
        value: 'beginner'
      },
      {
        label: '100-500',
        value: 'novice'
      },
      {
        label: '501-1000',
        value: 'intermediate'
      },
      {
        label: '>1000',
        value: 'expert'
      }
    ]
  },
  rating: {
    label: 'Rate the movie from 1-5',
    type: 'integer',
    min: 1,
    max: 5,
    // 👇 Including multiple independent conditions.
    if: {
      $or: [
        { seenMovie: true },
        { uninformedOpinion: true },
        { contributorLevel: 'intermediate' },
        { contributorLevel: 'expert' },
        { 'featuredMovie()': true }
      ]
    }
  }
}
```
The exact same structure can be used to regulate whether a field is required, substituting `requiredIf` in place of `if` in the code above.

Additional conditional options will be added in the future.