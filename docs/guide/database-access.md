# Accessing the database directly

## Working with collections
As stated earlier, the main goal of the Apostrophe content query API is to facilitate requests to the MongoDB database without the developer having to know advanced MongoDB syntax or worry about user permissions. However, there are instances where you might want to directly access and modify your collections without the overhead or restrictions of the API.

A good example is updating a "view counter" on a piece like a blog article. Everyone can see the page, so you don't care about permissions. You don't need to update the entire document object. You just want to update one small piece of it.

Here is an example of how to do that in a piece. We will use the `beforeShow()` method of the `@apostrophecms/piece-page-type`. This method lets us make modifications just before the `show.html` of the associated `@apostrophe/piece-page-type` is displayed to the user.

<AposCodeBlock>

```javascript
module.exports = {
  // remainder of the module properties
  methods(self) {
    return {
      beforeShow(req){
        self.apos.doc.db.updateOne(
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
There are references to other core apostrophe collections that can be accessed in this same way through `self.apos.<xxx>.db`. For example, `self.apos.attachment.db` gives access to CRUD operations on the `aposAttachments` collection. Note that the reference uses the singular version of the name.
:::

Next, we are giving our database a MongoDB CRUD method saying that we want to update one document within the database. You can read about other methods within the [MongoDB docs](https://www.mongodb.com/docs/v6.0/crud/). Just make sure that you select your database version from the dropdown.

We are passing two arguments to the MongoDB method. The first is an object that sets the `_id` property to the `_id` of the piece that the user is requesting. Note the use of the underscore `_` - this is because this is a MongoDB, not user, generated id.

The second argument is an object which passes a MongoDB operator `$inc` set to the name and value of the field we want to alter. In this case, *incrementing* the `views` field by 1. This could then be accessed in the `show.html` template for the `blog-page` using `data.piece.views`.

Keep in mind, this update to the record happened *after* the requested piece was already returned from the database because we used the `beforeShow()` method. So, if five people had looked at that blog article previously, `data.piece.views` in the template would be equal to 5, but the database record views would now be 6 due to our `$inc`.

In addition to the `$inc` operator, there are a number of other MongoDB operators where it makes sense to access database directly. This includes `$set`, `$pull`, `$push`, `$addToSet`, and `$unset`. You can read more about their usage in the MongoDB [documentation](https://www.mongodb.com/docs/v6.0/reference/operator/update/).

## Modifying collections using tasks

Let's look at another typical use case for directly modifying our collections. Any module can add command line (CLI) tasks through the `tasks(self)` configuration property.

The Apostrophe modules expose multiple tasks, for example, adding users through `node app @apostrophecms/user:add <name> <role>`, or completely resetting your database (dangerous!) through `node app @apostrophecms/db:reset`. The [`task()` function](https://v3.docs.apostrophecms.org/reference/module-api/module-overview.html#middleware-self) takes the as an argument, returning one or more CLI-invokable functions. Let's look at an example.

<AposCodeBlock>

```js
module.exports = {
  // other module properties
  tasks(self) {
    return {
      'promote-author': {
        usage:
          'Add the "promoted" tag to any blog author. The author name in quotes should be passed as the argument.',
        async task(argv) {
          const authorName = argv._[1];
          if (!authorName) {
            throw 'You must specify an author name.';
          }
          // Get a req with Admin privileges. Could also use getAnonReq().
          const req = self.apos.task.getReq();
          const author = await self.apos.doc
            .find(req, {
              name: authorName,
              type: 'author'
            })
            .toObject();
          if (!author) {
            throw new Error('No such author.');
          }
          const byline = await self.apos.doc.db.updateMany(
            { authorIds: author.aposDocId },
            { $set: { tags: [ 'promoted' ] } }
          );
          if (!byline) {
            throw new Error('No articles found.');
          }
          console.log('Updated ' + byline.modifiedCount + ' articles.');
        }
      }
    };
  }
};
```

<template v-slot:caption>
modules/article/index.js
</template>
</AposCodeBlock>

The task we are adding is to select one of the article authors and add a "promoted" tag to any article they have written. We could then use this tag to display all of the promoted articles in a specific section of our article index page.

First, we give the task the name `promote-author` and add a usage string and an async function that will be run. That function gets the arguments that are passed from the CLI through the `argv` parameter. We will be able to access this task by entering `node` app article:promote-author "<name>"` on the command line.

If you look at the `argv` argument, you will see that it is an object with a `_` property set to an array that contains all of the space-separated elements following `node app`. The first element will be `article:promote-author` and therefore, the author name we want to promote is the second element `argv._[1]`. 

Once we check that we have a defined `authorName` variable, we have to check to make sure that the author exists in our author piece type documents. In this case, we will take advantage of the Apostrophe `@apostrophecms/doc` module `find()` method. We generate a `req` using `getReq()` and then pass that along with our filter into `find()`. The filter in this case is looking through the `aposDocs` collection for any document that contains both a `name` property set to the `authorName` and an `author` piece type.

After error checking, we use the `aposDocId` from the `author` object to find all of the documents where that person is an author using `updateMany()` on the docs collection. For the second parameter we pass in an object with the `$set` operator. In this case, the operator sets the value of the `tags` property of every found doc to an array containing our `promoted` tag.

Finally, we either throw an error to inform the user if no articles were updated, or we let them know how many articles were updated. Note that with these parameters we aren't discriminating between draft or published documents.

## Making your own database connections

While the core of apostrophe depends on connections to MongoDB through the mongodb native module, that doesn't mean that your custom modules are limited in the same way. If you feel like using Mongoose, go ahead! If you want to use a different database, why not!

Just install the packages you need and open your own database connections.