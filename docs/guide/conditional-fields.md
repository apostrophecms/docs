---
permalink: '/guide/conditional-fields'
---

# Conditional fields

When defining a field schema, you may make fields conditional on other field values using the `if` setting. Until the `if` setting conditions are met, the field will be hidden. Simple conditions are passed as an object with keys *matching the names of other fields in the same schema*. The condition values must match the sibling field values *exactly* to pass.

::: note
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

## Complex conditions

In addition to simple field names, the conditional object can take the name of a method as a key. The sibling field value will be compared using strict equivalence to the value returned from the method. Like simple conditional fields, the returned value should be a string, number, or boolean.

This conditional method can either be defined in the `methods` section of the same module as the conditional field, or another module by prefixing the method with the name of defining module followed by a colon. In either case, the method name must have parentheses appended to the end.

::: note
The property here is a string, not the actual method, so you can't pass arguments back to the method within the parentheses.
:::

The method will recieve values of `(req, {docId})`, where the `docId` is `null` if the document is being created for the first time. Otherwise, the `docId` will contain the `_id` for a piece/page, or if the method is being called from a widget, the `_id` of the document where the widget is being added. The call is a server-side, asynchronous method, just like that supported for dynamic selection choices. It only occurs when the editor modal is first opened. This is unlike simple conditional fields which continuously poll other schema fields in the same module. Any changes that occur while the editor is open will not be reflected in the visibility of the conditional field. Additionally, the returned value is cached on the first call, so if multiple fields depend on the same method, that method will only be called once.

<AposCodeBlock>

``` javascript
// A field schema's `add` configuration
add: {
  selectSponsors: {
    label: 'Select a project sponsor',
    type: 'select',
    // populate choices dynamically
    choices: 'sponsorNames',
    if: {
      // `()` are mandatory, method defined in the `article` module
      `isSponsored()`: true
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
  },
  // additional field options
methods(self) {
  return {
    async isSponsored(req, {docId}) {
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
  }
}
```

<template v-slot:caption>
modules/article/index.js
</template>
</AposCodeBlock>

## Multiple required conditions

**The `if` setting may contain more than one condition.** When there is more than one, all conditions must be met before the field will be active. These conditions can be a mix of comparisions to other schema fields within the same modal, and calls to a method.

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

Additional conditional options will be added in the future.