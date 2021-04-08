The `if` setting specifies conditions that are required before the field will be active. The conditions must be an object with keys matching the names of other fields in the same schema. The condition values must match the sibling field values *exactly* to pass.

::: note
Because strict equivalence is required for conditions, fields used in conditions must have values that are strings, numbers, or booleans. This is subject to change.
:::

Learn more in the [conditional fields guide](/guide/conditional-fields).