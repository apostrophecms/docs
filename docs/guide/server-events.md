# Using server side events

Apostrophe emits many sever-side events to allow project code and installed modules respond as needed. These range from start-up events to event triggered by normal editor actions. For example, if we had a website to track ghost sightings, we could watch for new sighting submissions and respond by sending the location address to a mapping API for validation and additional location information.

For a list of server-side events, see the [events reference page](/reference/server-events.md).

## The `handlers` module property

Apostrophe modules have a dedicated function property to register event handles. As a reminder, essentially all code in Apostrophe projects is a part of one module or another, whether custom or configuration of an installed module (including core modules).

Any module can include a [`handlers` customization function](/reference/module-api/module-overview.md#handlers-self), which takes the module itself as an argument. This function returns an object whose keys are names of server-side events. Those event keys are assigned an object containing event handlers.

Every event includes particular arguments, so event handlers need to be written with matching parameters. For example, the `beforeInsert` event from piece type modules includes the request (`req`) and an object of data for the inserted piece (`piece`).

The examples below show two examples of how a custom `product` module registers event handlers for that event.

<AposCodeBlock>
  ```javascript
  module.exports = {
    // ...
    handlers(self) {
      return {
        // Responds to `beforeInsert` when emitted by the `product` module
        beforeInsert: {
          async applyTax(req, piece) {
            piece.totalPrice = piece.price * (1.0 + (piece.tax / 100));
          }
        },
        // Response to `beforeInsert` when emitted by *any* piece type
        '@apostrophecms/piece-type:beforeInsert': {
          async beforeAnyPieceIsInserted(req, piece) {
            console.log('Something is being inserted. 📬', piece.title);
          }
        }
      }
    }
  };
  ```
  <template v-slot:caption>
    modules/product/index.js
  </template>
</AposCodeBlock>

The first event handler object is set to watch `beforeInsert`. Since that key only includes the event name it will watch for the event **only when emitted by this `product` module**.

The second event handler object is set to the key `'@apostrophecms/piece-type:beforeInsert'`. This still watches the `beforeInsert` event, but **since it begins with a module name**, `@apostrophecms/piece-type` followed by a colon, it will run the handler whenever that module, *or any modules that extend it*, emit that event. Since all piece types extend that named module, this handler will run before *any* piece is inserted into the database.

## Multiple handlers for an event

Event handlers can be spread *across multiple modules* in a project even if they respond to the same event. This allows us to keep each handler in the module that is most related to their purpose. When a product is updated by an editor, one module may send emails to notify the sales team and another module may update featured products on the home page.

<AposCodeBlock>
  ```javascript
  module.exports = {
    // ...
    handlers(self) {
      return {
        // Responds to `beforeSave` when emitted by the `product` module
        'product:beforeSave': {
          async updateProducts(req, piece) {
            // Code to update featured products for the home page
          }
        }
      }
    }
  };
  ```
  <template v-slot:caption>
    modules/@apostrophecms/home-page/index.js
  </template>
</AposCodeBlock>

<AposCodeBlock>
  ```javascript
  module.exports = {
    // ...
    handlers(self) {
      return {
        // Responds to `beforeSave` when emitted by the `product` module
        beforeSave: {
          async emailSales(req, piece) {
            // Code to construct and send an email to the sales team
          }
        }
      }
    }
  };
  ```
  <template v-slot:caption>
    modules/product/index.js
  </template>
</AposCodeBlock>

At the same time, *multiple event handlers for a single event can be included in a single module*. Each handler should be added as a separate property of the event object. This allows us to avoid having only one large handler that might get hard to maintain.

<AposCodeBlock>
  ```javascript
  module.exports = {
    // ...
    handlers(self) {
      return {
        // Responds to `beforeInsert` when emitted by the `product` module
        beforeInsert: {
          async applyTax(req, piece) {
            piece.totalPrice = piece.price * (1.0 + (piece.tax / 100));
          },
          async emailSales(req, piece) {
            // Code to construct and send an email to the sales team
          }
        }
      }
    }
  };
  ```
  <template v-slot:caption>
    modules/product/index.js
  </template>
</AposCodeBlock>

::: note
**Event handler names are important** (e.g., `applyTax` and `emailSales` in the example above). They are used in log messages to help us find the source of problems, for one reason. They also allow us to override or [extend an event handler](/reference/module-api/module-overview.html#extendhandlers-self) when inherited by another module. Name them well and use multiple handlers to make the code easier to maintain.
:::
