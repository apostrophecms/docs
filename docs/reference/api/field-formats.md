---
prev: false
next: false
---
# API response field examples

Simple examples of how each field type might be returned in a document from the REST APIs.

## area

``` json
// An area with a single rich text widget
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
## array

``` json
{
  "arrayField": [
    // Inner object properties and value types depend on the array's fields
    // definition. They will have the same fields, however.
    // `_id` will be automatically generated and included on every array item.
    {
      "_id" : "ckj0k15x4001h2a68staejzpj",
      "label": "The first one",
      "count": 27
    },
    {
      "_id" : "ckj0k1gy7001j2a68hnlz3d6x",
      "label": "The second item",
      "count": 99
    }
  ]
}
```

## attachment

``` json
{
  "attachment": {
    "_id": "ckhdsopzr0005rt9kn49eyzb5",
    "crop": null,
    "group": "images",
    "createdAt": "2020-11-11T19:27:11.782Z",
    "name": "double-rainbow",
    "title": "double rainbow",
    "extension": "jpg",
    "type": "attachment",
    "docIds": [
      "ckhdsovk40006rt9kdmxp6bhj"
    ],
    "archivedDocIds": [],
    "length": 644584,
    // md5 hash of the original file
    "md5": "f41217031f11e8483ee81e20782f51be",
    "width": 2560,
    "height": 1922,
    "landscape": true,
    "used": true,
    "utilized": true,
    "archived": false,
    // Non-image files will have a single `_url` property.
    "_urls": {
      "max": "https://example.net/uploads/attachments/ckhdsopzr0005rt9kn49eyzb5-double-rainbow.max.jpg",
      "full": "https://example.net/uploads/attachments/ckhdsopzr0005rt9kn49eyzb5-double-rainbow.full.jpg",
      "two-thirds": "https://example.net/uploads/attachments/ckhdsopzr0005rt9kn49eyzb5-double-rainbow.two-thirds.jpg",
      "one-half": "https://example.net/uploads/attachments/ckhdsopzr0005rt9kn49eyzb5-double-rainbow.one-half.jpg",
      "one-third": "https://example.net/uploads/attachments/ckhdsopzr0005rt9kn49eyzb5-double-rainbow.one-third.jpg",
      "one-sixth": "https://example.net/uploads/attachments/ckhdsopzr0005rt9kn49eyzb5-double-rainbow.one-sixth.jpg",
      "original": "https://example.net/uploads/attachments/ckhdsopzr0005rt9kn49eyzb5-double-rainbow.jpg"
    }
  }
}
```

## boolean

``` json
{
  "booleanField": true
}
```

## checkboxes

``` json
{
  "checkFields" : [
    "med",
    "small"
  ]
}
```
## color

``` json
{
  "colorField": "#9013feff"
}
```

## date

``` json
{
  "dateField": "2012-12-21"
}
```

## email

``` json
{
  "emailField": "jon@bonjovi.rocks"
}
```

## float

``` json
{
  "floatField": 8675.309
}
```

## integer

``` json
{
  "integerField": 42
}
```

## password

``` json
{
  "pwField": "don't use this for sensitive passwords"
}
```

## range

``` json
{
  "rangeField": 21
}
```

## relationship

``` json
{
  "_relation": [
    {
      "_id": "ckitdkktu002bu69krdkdu2pj",
      "archived": false,
      "disabled": false,
      "type": "@apostrophecms/user",
      "firstName": "Alexander",
      "lastName": "Hamilton",
      "title": "Alexander Hamilton",
      "slug": "user-alexander-hamilton",
      "username": "adotham",
      "email": "a.ham@treasury.gov",
      "metaType": "doc",
      "createdAt": "2020-12-17T21:47:58.194Z",
      "updatedAt": "2020-12-17T21:47:58.205Z",
      "updatedBy": {
        "_id": "ckhdsd0hk0003509kchzbdl83",
        "firstName": "Super",
        "lastName": "Admin",
        "username": "admin"
      },
      "titleSortified": "alexander hamilton",
      "highSearchText": "alexander hamilton user alexander hamilton",
      "highSearchWords": [
        "alexander",
        "hamilton",
        "user"
      ],
      "lowSearchText": "alexander hamilton user alexander hamilton",
      "searchSummary": ""
    }
  ]
}
```

## select

``` json
{
  "selectField": "selected value"
}
```

## slug

``` json
{
  "slugField": "slugified-string"
}
```

## string

``` json
{
  "stringField": "String value"
}
```

## time

``` json
{
  "timeField": "00:13:22"
}
```

## url

``` json
{
  "urlField": "http://apostrophecms.com"
}
```
