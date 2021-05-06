# Connecting content with relationships

Creating and displaying content is great, but the power of a CMS really shines when you start connecting pieces of content to one another. In Apostrophe we do that with **relationship fields**.

::: note
If you have experience with Apostrophe 2, this may already sound familiar. It is an updated version of the A2 "join" field types.
:::

There are many use cases for relationships, but one common use is categorization. You may have a blog with dozens of articles covering several topics. If you make a piece type for "Topics" and select a topic on each article, you can then do things such as filtering the articles by topic. Let's take a look at how this works.

## The anatomy of a relationship field

We will start with a basic blog article piece type with only an area field for the article text.

```js
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  fields: {
    add: {
      body: {
        label: 'Article text',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'body' ]
      }
    }
  }
};
```

::: note
Refer to the [pieces guide](/guide/pieces.md) for more information on adding piece types.
:::

Then we can add a "Topics" piece type. Since it is only used for categorization, it doesn't need any special fields.

```js
// modules/topic/index.js
module.exports = {
  extend: '@apostrophecms/piece-type'
};
```

Now that we have the two piece types, the next step is to add a relationship field to connect them. The important question is: where should we put the relationship field?

Relationships establish **directional connections**. That means that the connection is added on one end, then it can only be *edited* or *removed* from that same end. In the case of articles and topics, we will put the field on the *article* piece type. That way editors can select a topic when adding articles and they never have to edit the topic at all.

The article piece type's relationship field would look like:

```js
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  fields: {
    add: {
      // ...
      _topics: {
        type: 'relationship',
        label: 'Blog post topic',
        withType: 'topic',
        builders: {
          project: {
            title: 1,
            _url: 1
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'body', '_topics' ]
      }
    }
};
```

Like with all fields, we identify the field type, `type: 'relationship'`, and give it a display label. The other two properties are new.

| New properties | What is it? |
| -------------- | ----------- |
| **`withType`** | This identifies the Apostrophe doc type that can connect on the field |
| **`builders`** | Field query builders, specifically using the `project` filter. This limits the data that is fetched from the connected doc. It is optional, but recommended for improved performance. [See the relationship field reference for detail.](/reference/field-types/relationship.md#filtering-related-document-properties) |

::: note
**Why does the field name start with an underscore?** You may have noticed that the field name is `_topics`, *not* simply `topics`. Field names that begin with an underscore indicate that a *reference* will be saved to the database document instead of the actual data being referenced.

In the case of a relationship field, the `_id` of the connected doc is saved. Since that connected doc may change, the actual data will be fetched when the relationship is used so it is always up to date.

`_id` is another example of a document property that begins with an underscore. Pieces' `_url` is as well. This pattern generally indicates that a property should not be updated directly when a document is saved using APIs. `_id` is a permanent unique identifier and others are populated by Apostrophe when the document is loaded.
:::

## Creating relationships in the interface

Once a relationship field is added to the schema, the editor will now include a relationship field. They can type in the name of a topic or use the "Browse" button to view the full list of topics to choose.

![The topics relationship field](/images/relationship-autocomplete.png)

![The chooser interface for the topics relationship field](/images/relationship-chooser.png)

## Limiting the number of relationships

You can configure a minimum and/or maximum number of doc relationships on a relationship field using the `min` and `max` settings.

Setting `max: 1` on a relationship field will only allow one such connection.

```javascript
_topics: {
  type: 'relationship',
  label: 'Blog post topic',
  withType: 'topic',
  max: 1,
  builders: {
    project: {
      title: 1,
      _url: 1
    }
  }
}
```

Or setting `min: 2` and `max: 5` will require at least two topics on the article and no more than five. These settings can be used to guide editors to choose the right number of relationship, whatever that may be.

```javascript
_topics: {
  type: 'relationship',
  label: 'Blog post topic',
  withType: 'topic',
  min: 2,
  max: 5,
  builders: {
    project: {
      title: 1,
      _url: 1
    }
  }
}
```

See the full table of [relationship field settings](/reference/field-types/relationship.md#settings) in the reference section.

## Using a relationship in templates

Relationship fields can be referenced in templates like any other field as a property on the context object. If there is any, the field data will be an array of objects.

A blog article show page template may include this code snippet:

```django
{# module/article-pages/views/show.html #}
<p>Topics:</p>
<ul>
  {% for topic in data.piece._topics %}
    <li>{{ topic.title }}</li>
  {% endfor %}
</ul>
```

Since the data is fetched in an array, we use the `{% for %}` tag to loop it. If there is a maximum of one connected doc, you could reference it directly using the array index:

```django
{# module/article-pages/views/show.html #}
{% if data.piece._topics.length > 0 %}
  <p>Topic: {{ data.piece._topics[0] }}</p>
{% endif %}
```

::: warning
Even if the relationship has `min: 1` set, requiring one selection, never assume that the relationship is populated in templates. If the selected item is archived at some point the field will become empty.
:::

<!--
TODO: Uncomment this section once reverse relationships are fixed in core so we can confirm behavior.

## Reverse relationships

Relationships are directional, but you can still read the relationship from the opposite direction using a `reverseRelationship` field. A `reverseRelationship` field must reflect an existing `relationship` field. **It has no user interface or property in database documents.** It is simply a signal for Apostrophe to populate data when fetching a document.

In the example above of articles and topics, you might want to give each topic their own page showing every article using that topic. To do that, add a `relationshipReverse` field to the topic piece type:

```javascript
// modules/topic/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  fields: {
    add: {
      _articles: {
        type: 'relationshipReverse',
        withType: 'article',
        reverseOf: '_topics'
      }
    }
  }
};
```

::: tip
You don't need to use a fields `group` setting here since the `relationshipReverse` field has no user interface.
:::

This field is identifying the connected doc type with the `withType` setting, then the matching `relationship` field on that doc type with the `reverseOf` setting. See [more about `relationshipReverse` configuration](/reference/field-types/relationship-reverse.md) in the field type reference page.

With this field in place, you could display connected articles in a topics show page the same way you displayed article topics above.

```django
{# module/topic-pages/views/show.html #}
<p>Articles:</p>
<ul>
  {% for article in data.piece._articles %}
    <li>{{ article.title }}</li>
  {% endfor %}
</ul>
```

-->
