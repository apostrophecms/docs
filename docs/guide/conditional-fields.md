---
prev:
  text: 'Content fields'
  link: 'guide/content-schema.md'
next:
  text: 'Connecting content with relationships'
  link: 'guide/relationships.md'
---
# Displaying conditional fields

When defining a field schema, fields can be made conditional based on the values of other fields using the `if` setting. These conditional fields remain hidden until the specified `if` conditions are satisfied.

## Simple conditions

Simple conditions are passed as an object with keys *matching the names of other fields in the same schema*. The condition values must match the sibling field values *exactly* to pass. When matching values from a `checkboxes` field, the condition is considered met if *any* of the checkbox values selected by the user match any of the values specified in the `if` condition.

::: info
Because strict equivalence is required for simple conditions, fields used in conditions must have values that are strings, numbers, or booleans. This can include simple `string`, `boolean`, or `integer` fields, but also `checkboxes`, `select`, or even `date` or `time` since they are returned as strings.
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
    // 👇 Here is our simple condition definition
    if: {
      seenMovie: true
    }
  }
}
```

## MongoDB-style comparison operators

For more flexible conditions, you can use [MongoDB-style comparison operators](https://www.mongodb.com/docs/manual/reference/mql/query-predicates/comparison/#std-label-query-selectors-comparison) instead of exact value matching. This allows for range checks, existence checks, and matching against multiple values.

```javascript
// A field schema's `add` configuration
add: {
  priority: {
    label: 'Task Priority',
    type: 'select',
    choices: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Critical', value: 'critical' }
    ]
  },
  estimatedHours: {
    label: 'Estimated Hours',
    type: 'integer'
  },
  assignee: {
  type: 'string',
  label: 'Assignee',
},
  escalationNotes: {
    label: 'Escalation Notes',
    type: 'string',
    textarea: true,
    // 👇 Show this field for high/critical priority tasks with 20+ hours
    // where someone has been assigned
    if: {
      priority: { $in: ['high', 'critical'] },
      estimatedHours: { $gte: 20 },
      'assignee.length': { $gt: 0 }
    }
  }
}
```
> [!NOTE]
> For the `assignee` field we are checking that the string length is greater than `0` characters.
> We can't use `$exists: true` because an empty string is truthy.

### Supported comparison operators

| Operator | Description | Example |
| -------- | ----------- | ------- |
| `$eq` | Equal to (same as simple condition) | `{ status: { $eq: 'active' } }` |
| `$ne` | Not equal to | `{ status: { $ne: 'archived' } }` |
| `$gt` | Greater than | `{ score: { $gt: 80 } }` |
| `$gte` | Greater than or equal to | `{ age: { $gte: 18 } }` |
| `$lt` | Less than | `{ price: { $lt: 100 } }` |
| `$lte` | Less than or equal to | `{ discount: { $lte: 50 } }` |
| `$in` | Value is in array | `{ category: { $in: ['news', 'blog'] } }` |
| `$nin` | Value is not in array | `{ status: { $nin: ['draft', 'archived'] } }` |
| `$exists` | Field exists (not null/undefined) | `{ author: { $exists: true } }` |

> [!NOTE]
> The `$eq` operator differs slightly from MongoDB's implementation when working with arrays:
> - When comparing arrays, ApostropheCMS matches if all condition values exist in the document array (order doesn't matter)
> - When the document field is an array but the condition isn't, ApostropheCMS matches if the condition value exists anywhere in the array
>
> MongoDB's `$eq` requires exact array matches including order and length.

### Combining multiple operators

You can combine multiple operators on the same field for range checks and complex validation:

```javascript
// Show field only for users aged 18-65 with a valid email
if: {
  age: {
    $gte: 18,
    $lte: 65
  },
  email: {
    $ne: ''  // Not empty string (implies existence for practical purposes)
  },
  status: {
    $in: ['active', 'verified'],
    $ne: 'suspended'
  }
}
```

::: info Negation without `$not`
While there's no `$not` operator, you can achieve negation using other operators:
- Use `$ne` instead of `$not: 'value'`
- Use `$nin` instead of `$not: { $in: ['a', 'b'] }`
- Use `$exists: false` instead of `$not: { $exists: true }`
:::

> [!INFO]
> When using `$exists`, a value of `true` checks that the field has a value (not null or undefined), while `false` checks that the field is null or undefined. Again, an empty string will evaluate as `true`, so use either `$ne` or check the length.

## Nested Conditional Fields

You can also create a hierarchy of conditional fields where child field visibility depends on a parent field. While the display of this parent field, in turn, is influenced by the value of another field in the schema. The child fields will remain hidden until both the parent field conditional display criteria is satisfied and the value of the parent field fulfills the child field conditional.

## Accessing parent schema fields

When working with nested schemas (like `array` or `object` fields), conditional fields can access values from parent schema fields using the `following` property with the same `<` prefix syntax used for dynamic choices.

> [!IMPORTANT]
> If you need to use a parent schema field for conditional display of a `string` field, and you do not want the value of that followed field to be used for the string value you need to pass any `following` fields into a `followingIgnore` property. If you do want to set a value from one of the `following` fields, leave that field out of the array passed to the `followingIgnore` property.

### Parent field access syntax reference

  - `<fieldName` - access parent level field
  - `<<fieldName` - access grandparent level field
  - `<<<fieldName` - access great-grandparent level field
  - `<arrayField.length` - access array length property
  - `<arrayField.0.property` - access specific array element by index
  - `<arrayField.property` - access property across all array elements (flattened search)
  - `<objectField.nestedProperty` - access nested object properties
  - `<arrayField.nestedObject.deepProperty` - access deeply nested properties

```javascript
// Example with nested object field
add: {
  projectType: {
    label: 'Project Type',
    type: 'select',
    choices: [
      { label: 'Internal', value: 'internal' },
      { label: 'Client', value: 'client' }
    ]
  },
  projectDetails: {
    label: 'Project Details',
    type: 'object',
    fields: {
      add: {
        clientBudget: {
          label: 'Client Budget',
          type: 'integer',
          following: [ '<projectType' ],
          // 👇 Access parent field value
          if: {
            '<projectType': 'client'
          }
        },
        internalCostCenter: {
          label: 'Cost Center',
          type: 'string',
          following: [ '<projectType' ],
          // 👇 Don't use the `following` field to set the field value
          followingIgnore: [ '<projectType' ],
          if: {
            '<projectType': 'internal'
          }
        }
      }
    }
  }
}
```

### Advanced parent field access with dot notation

You can use dot notation to access nested properties, array elements, and special properties like `length`:

```javascript
add: {
  tasks: {
    label: 'Tasks',
    type: 'array',
    fields: {
      add: {
        title: {
          label: 'Task Title',
          type: 'string'
        },
        priority: {
          label: 'Priority',
          type: 'select',
          choices: [
            { label: 'Low', value: 'low' },
            { label: 'High', value: 'high' }
          ]
        }
      }
    }
  },
  projectSettings: {
    label: 'Project Settings',
    type: 'object',
    fields: {
      add: {
        // Show only when there are tasks
        taskSummary: {
          label: 'Task Summary',
          type: 'string',
          following: [ '<tasks' ],
          followingIgnore: [ '<tasks' ],
          if: {
            '<tasks.length': { $gt: 0 }
          }
        },
        // Show only when there are 3+ tasks
        bulkActions: {
          label: 'Bulk Actions',
          type: 'checkboxes',
          following: [ '<tasks' ],
          choices: [
            { label: 'Mark all complete', value: 'complete' },
            { label: 'Delete all', value: 'delete' }
          ],
          if: {
            '<tasks.length': { $gte: 3 }
          }
        },
        // Show only when the first task is high priority
        urgentNotice: {
          label: 'Urgent Notice',
          type: 'string',
          following: [ '<tasks' ],
          followingIgnore: [ '<tasks' ],
          if: {
            '<tasks.0.priority': 'high'
          }
        },
        // Show when any task has high priority
        highPrioritySettings: {
          label: 'High Priority Settings',
          type: 'checkboxes',
          choices: [
            {
              label: 'Send email notifications',
              value: 'emailNotifications'
            },
            {
              label: 'Escalate to team lead',
              value: 'escalateToLead'
            },
            {
              label: 'Flag for immediate review',
              value: 'immediateReview'
            },
          ],
          following: [ '<tasks' ],
          if: {
            '<tasks.priority': 'high'  // Automatically searches all array elements
          }
        }
      }
    }
  }
}
```

## Complex conditions

In addition to simple field names and comparison operators, the conditional object can take the name of a method as a key. The sibling field value will be compared using strict equivalence to the value returned from the method. You cannot use MongoDB-like conditionals (like `$eq`, `$gt`, etc.) to test the returned values, only strict equivalence is supported. Like simple conditional fields, the returned value should be a string, number, boolean, or any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

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

## Multiple required conditions (AND logic)

**The `if` setting may contain more than one condition.** When there is more than one, **all conditions must be met** before the field will be active (AND logic). These conditions can be a mix of simple comparisons, MongoDB-style operators, comparisons to other schema fields within the same modal, and calls to a method.

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
    // 👇 Two conditions that both must be met (AND logic)
    if: {
      seenMovie: true,
      'votingStillOpen()': true
    }
  }
}
```

::: info AND vs OR Logic
By default, multiple conditions use AND logic - all must be true. For OR logic (any condition can be true), use the `$or` operator described below.
:::

## Conditional field requirement

In addition to conditionally displaying a field, you can also conditionally mark a field as `required: true` based on the value of another field using the `requiredIf` setting. Like `if`, this property takes an object with keys *matching the names of other fields in the same schema*. The condition values must match the sibling field values *exactly* to pass, use MongoDB-style comparison operators, or dot notation.

Also like the `if` setting, the `requiredIf` can take complex conditionals with a mix of comparisons to other schema fields within the same modal, and calls to a method. All conditions must be met before the field will be active.

You can have both an `if` and `requiredIf` with different conditions on the same field. If the conditions for the `if` are not met, the `requiredIf` will be ignored.

> [!IMPORTANT]
> At this time, `requiredIf` does not support `following` parent schema fields. If this functionality is needed, create a hidden sibling field that takes its value from the parent field and then set the `requiredIf` based on the value of that "cloned" field.

```javascript
// Example using MongoDB-style operators in requiredIf
add: {
  customerType: {
    label: 'Customer Type',
    type: 'select',
    choices: [
      { label: 'Individual', value: 'individual' },
      { label: 'Business', value: 'business' }
    ]
  },
  annualRevenue: {
    label: 'Annual Revenue',
    type: 'integer'
  },
  taxId: {
    label: 'Tax ID Number',
    type: 'string',
    requiredIf: {
      customerType: 'business',
      annualRevenue: { $gte: 50000 }
    }
  }
}
```

## Special conditional operators

| Conditional operator | Value type | Description |
| -------------------- | ---------- | ----------- |
| [`$or`](#or) | Array | The `$or` condition passes if any of the array conditions pass |
| [`$and`](#and) | Array | The `$and` condition passes if all of the array conditions pass |

### `$or`

Condition rules may be independent of one another. Add separate condition rules in an array of objects using the key `$or` to show the field if any of the condition groups pass. A mixture of simple equivalence, MongoDB-style operators, and method calls can be used.

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
    // 👇 Including multiple independent conditions with MongoDB-style operators
    if: {
      $or: [
        { seenMovie: true },
        { uninformedOpinion: true },
        { contributorLevel: { $in: ['intermediate', 'expert'] } },
        { 'featuredMovie()': true }
      ]
    }
  }
}
```

### `$and`

While conditions at the same level are implicitly combined with `$and` logic, you can use explicit `$and` for more complex nested logic or when combining with `$or`. The `$and` operator takes an array of condition objects, all of which must be true.

```javascript
// Example: Show field only for admin users in specific departments 
// OR managers with sufficient experience
add: {
  userRole: {
    label: 'User Role',
    type: 'select',
    choices: [
      { label: 'User', value: 'user' },
      { label: 'Manager', value: 'manager' },
      { label: 'Admin', value: 'admin' }
    ]
  },
  department: {
    label: 'Department',
    type: 'select',
    choices: [
      { label: 'HR', value: 'hr' },
      { label: 'Finance', value: 'finance' },
      { label: 'Engineering', value: 'engineering' }
    ]
  },
  yearsExperience: {
    label: 'Years of Experience',
    type: 'integer'
  },
  confidentialField: {
    label: 'Confidential Information',
    type: 'string',
    if: {
      $or: [
        {
          // Explicit $and for clarity in complex conditions
          $and: [
            { userRole: 'admin' },
            { department: { $in: ['hr', 'finance'] } }
          ]
        },
        {
          $and: [
            { userRole: 'manager' },
            { yearsExperience: { $gte: 5 } }
          ]
        }
      ]
    }
  }
}
```

::: tip
In most cases, you don't need explicit `$and` since multiple conditions at the same level use AND logic by default. Use explicit `$and` when you need to create complex nested logic with `$or`.
:::

The exact same structure can be used to regulate whether a field is required, substituting `requiredIf` in place of `if` in the code above.