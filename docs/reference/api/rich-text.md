# rich text widgets in the REST API

### A simple example of what to expect

In the REST APIs of piece types and pages, and also in the database, an area containing a simple rich text widget looks like this:

``` json
{
  "main": {
    "_id": "ckj0k0dy7000i2a68s1z8v4ky",
    "items": [
      {
        "_id": "ckj0k0mox000o2a68oouznar1",
        "metaType": "widget",
        "type": "@apostrophecms/rich-text",
        "content": "<p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum <strong>nibh, ut fermentum massa justo sit amet risus.</strong></p><p><br /></p>",
        "_docId": "ckj0k2i45001c7u9kky3tftx2"
      }
    ],
    "metaType": "area",
    "_docId": "ckj0k2i45001c7u9kky3tftx2"
  }
}
```

### Adding and updating rich text widgets

If creating a new document with `POST`, or updating a document with `PUT` or `PATCH`, you can add new rich text widgets to the `items` array or update the `content` of existing ones.

When adding a new widget via the REST API, you are not required to pass `_id`, `_docId` or `metaType`. These are supplied automatically for you.

### Rich text is filtered

Note that the HTML must specifically match what is allowed by the set of features enabled in that particular rich text widget, for instance via the `insert`, `toolbar`, `styles` and `colors` options given when configuring the widget. Anything else sent in a `POST`, `PATCH` or `PUT` request will be filtered out. This feature is designed to prevent users from carrying out cross-site scripting attacks or simply breaking the entire layout of your website with unexpected CSS.

### Importing inline images

Inline images are only permitted if the rich text widget has the `image` control in its `toolbar` and/or `insert` option.

When using the `content` property, inline images are only permitted via a specifically formatted `figure` tag, based on `@apostrophecms/image` pieces already uploaded to the system. However, there is a simple way to import external images.

Just use the following format when making a `POST`, `PUT` or `PATCH` REST API call for a page or piece type:

```json
{
  // Other properties of the page
  "slug": "/about",
  "type": "default-page",
  "title": "About",
  // The area field we are interested in, within the page
  "main": {
    "metaType": "area",
    // The array of widgets
    "items": [
      // A rich text widget
      {
        "type": "@apostrophecms/rich-text",
        // Use import rather than content to trigger
        // the image-importing behavior
        "import": {
          "baseUrl": "https://myoldsite.com",
          "html": "<p>Here is some text.</p>\n<img src=\"/my-image.jpg\" />"
        }
      }
    ]
  }
}
```

Note that:

* We are using an `import` property, not a `content` property. This triggers special behavior for importing external images.

* The `baseUrl` sub-property has been set to point to another site. This optional sub-property is used to resolve `img src` URLs with no protocol, like the one in this example.

* The actual markup is passed in the `html` sub-property.

* Any images found during import are imported into the system as Apostrophe image pieces. This means they will appear in the media library alongside images added to Apostrophe in the usual way.

* Any `alt` attributes found are also imported.

* The rich text widget still must specify the `image` control in its `toolbar` and/or `insert` options or the images will be filtered out.
