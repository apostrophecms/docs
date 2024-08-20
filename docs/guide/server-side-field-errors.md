# Generating errors for individual fields from the server side

## Motivation

Apostrophe provides useful ways to validate most field types in the browser, before the user ever tries to save them. For example, most field types support `required`, `min` and `max`, and string fields and their close relatives support `pattern`.

However, sometimes you won't know there is a problem until you try to do something on the server side. In that situation, it is helpful to be able to report the error to the browser in such a way that the message is associated with the correct field.

## Sample code

Here is sample code to forbid the user to use certain slugs. This code adds a `beforeSave` handler in the `@apostrophecms/doc-type` module, the base class of all piece and page types. That means it will be checked for *all* documents. If you want to do something similar but just for one document type, you can add the handler to a specific page or piece type module. If you want it for all pages, you can add it to `@apostrophecms/page-type`. For all pieces, add it to `@apostrophecms/piece-type`.

When you test out this code, you'll find it is not possible to save a page with the slug `/evil-page`, or save a piece with the slug `evil-piece`. And, a polite error appears in the right place.

::: tip
The folder name matters. Placing this code in `modules/@apostrophecms/doc-type/index.js` associates it with the right module.
:::

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    forbiddenSlugs: [
      '/evil-page',
      'evil-piece'
    ]
  },
  handlers(self) {
    return {
      beforeSave: {
        checkForbiddenSlugs(req, doc) {
          if (self.options.forbiddenSlugs.includes(doc.slug)) {
            const e = self.apos.error('invalid', 'That slug is reserved.');
            e.path = 'slug';
            throw self.apos.error('invalid', {
              errors: [
                e
              ]
            });
          }
        }
      }
    }
  }
};
```
  <template v-slot:caption>
    /modules/@apostrophecms/doc-type/index.js
  </template>
</AposCodeBlock>

This code first creates an error for the individual field, then attaches a `path` property specifying the field name, and then throws another error which contains the first one in an `errors` array. This is the format that Apostrophe's document editor expects, and as a result it allows the error to be associated with the correct field. Note that you can include more than one error in the `errors` array if multiple fields have problems.

## Monitoring events in other modules

If you prefer, you can add the handler code to a different module, as long as you specify the module you want to monitor:

```javascript
// This way the code can be in any module's index.js file

handlers(self) {
  return {
    '@apostrophecms/doc-type:beforeSave': {
      checkForbiddenSlugs(req, doc) {
        // See above
      }
    }
  };
}
```
