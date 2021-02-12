The `choices` setting in `checkbox`, `radio`, or `select` fields configures the options that a user will see in the interface and the values that the server will allow in validation. The `choices` value is an array of objects with `label` and `value` properties.

- `value` is used in the field's database value
- `label` is the more human-readable version used in interfaces

<!-- TODO: dynamic choices is not yet migrated -->
<!-- ### Populating `choices` dynamically

What if the field options and can't be hardcoded in your code? You can fetch them dynamically.

First, set the `choices` option to the name of a method in your module. Pass a string, the name of the method — do not pass a function.

Second, implement that function to take a single `(req)` argument and return an array of choices in the usual format. You may use an async function, or return a promise that will resolve to the array. That means you can reach out to APIs using modules like `axios` or `request-promise`.

It is usually a good idea to perform at least short-term caching in your choices method, in order to limit the impact on performance when editing. -->

<!-- TODO: Add `showFields`/`if` example when built -->
