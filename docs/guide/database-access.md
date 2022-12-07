# Accessing the database directly

## Working with collections
As stated earlier, the main goal of the Apostrophe JavaScript content API is to facilitate requests to the MongoDB database without the developer having to know advanced MongoDB syntax or worry about user permissions. However, there are instances where you might want to directly access and modify your collections without the overhead or restrictions of the Apostrophe model layer.

A good example is updating one document property, like a "view counter" of a blog article. Everyone can see the page, so you don't care about permissions. You don't need to update the entire document object. You just want to update one small piece of it.

Here is an example of how to do that in a piece. We will override the `beforeShow()` method of the `@apostrophecms/piece-page-type`. This method lets us make modifications just before the `show.html` of the associated `@apostrophe/piece-page-type` is displayed to the user.

<AposCodeBlock>

```javascript
module.exports = {
  // remainder of the module properties
  methods(self) {
    return {
      async beforeShow(req) {
        await self.apos.doc.db.updateOne(
          { _id: req.data.piece._id },
          { $inc: { views: 1 } }
        );
      }
    };
  }
};
```

<template v-slot:caption>
modules/article-page/index.js
</template>
</AposCodeBlock>

Within the `beforeShow()` method we are gaining access to the `aposDocs` collection of the project database using `self.apos.doc.db`. This reference to the collection is shorthand for `self.apos.db.collection('aposDocs')`. Note that this is *not* the same thing as `self.apos.db`, which is the main MongoDB connection object. 

::: tip
There are references to other core apostrophe collections that can be accessed in this same way through `self.apos.<xxx>.db`. For example, `self.apos.attachment.db` gives access to CRUD (Create, Read, Update, Delete) operations on the `aposAttachments` collection. Note that the reference uses the singular version of the name.
:::

Next, we are invoking a method of the MongoDB collection saying that we want to update one document within the database. You can read about other methods within the [MongoDB Node.js driver docs](https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/).

We are passing two arguments to the MongoDB method. The first is an object that sets the `_id` property to the `_id` of the piece that the user is requesting. Note the use of the underscore `_` - this is because this is a MongoDB, not user, generated id.

The second argument is an object which passes a MongoDB operator `$inc` set to the name and value of the field we want to alter. In this case, *incrementing* the `views` field by 1. This could then be accessed in the `show.html` template for the `blog-page` using `data.piece.views`.

Keep in mind, this update to the record happened *after* the requested piece was already returned from the database because we used the `beforeShow()` method. So, if five people had looked at that blog article previously, `data.piece.views` in the template would be equal to 5, but the database record views would now be 6 due to our `$inc`.

In addition to the `$inc` operator, there are a number of other MongoDB operators where it makes sense to access database directly. This includes `$set`, `$pull`, `$push`, `$addToSet`, and `$unset`. You can read more about their usage in the MongoDB [documentation](https://www.mongodb.com/docs/v6.0/reference/operator/update/).

## Modifying collections using tasks

Let's look at another typical use case for directly modifying our collections. Any module can add command line (CLI) tasks through the `tasks(self)` configuration property.

The Apostrophe modules expose multiple tasks, for example, adding users through `node app @apostrophecms/user:add <name> <role>`, or completely resetting your database (dangerous!) through `node app @apostrophecms/db:reset`. The [`task()` function](https://v3.docs.apostrophecms.org/reference/module-api/module-overview.html#middleware-self) takes the as an argument, returning one or more CLI-invokable functions. You can access and modify documents within a CLI function just as you would from any module method.

## Making your own database connections

While the core of apostrophe depends on connections to MongoDB through the mongodb native module, that doesn't mean that your custom modules are limited in the same way. If you feel like using Mongoose, go ahead! If you want to use a different database, why not!

Just install the packages you need and invoke your database connections with `await` within the `async init(self)` function of your module.