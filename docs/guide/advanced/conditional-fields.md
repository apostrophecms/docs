---
permalink: '/guide/conditional-fields'
---

# Conditional fields

When defining a field schema, you may make fields conditional on other field values using the `if` setting. Until the `if` setting conditions are met, the field will be hidden. The conditions must be an object with keys *matching the names of other fields in the same schema*. The condition values must match the sibling field values *exactly* to pass.

::: note
Because strict equivalence is required for conditions, fields used in conditions must have values that are strings, numbers, or booleans. This is subject to change.
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

**The `if` setting may contain more than one condition.** When there is more than one, all conditions must be met before the field will be active.

In the next example, `seenMovie` must be `true` *and* `relationship` must be `'none'` for the rating field to appear.

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
    // 👇 Two conditions that both must be met
    if: {
      seenMovie: true,
      relationship: 'none'
    }
  }
}
```

Additional conditional options will be added in the future.