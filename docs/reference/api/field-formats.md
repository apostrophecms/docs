# API response field examples

Simple examples of how each field type might be returned in a document from the REST APIs.

## area

```json
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

```json
{
  "arrayField": [
    // Inner object properties and value types depend on the array"s fields
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

```json
attachmentField: {
    "_id": "ckj0k1t2w000w7u9kb0vdp52u",
    "crop": null,
    "group": "office",
    "createdAt": "2020-12-22T22:23:42.972Z",
    "name": "cms-research",
    "title": "cms research",
    "extension": "pdf",
    "type": "attachment",
    "docIds": [],
    "trashDocIds": [],
    "length": {
        "dev": 16777220,
        "mode": 33188,
        "nlink": 1,
        "uid": 501,
        "gid": 20,
        "rdev": 0,
        "blksize": 4096,
        "ino": 140261958,
        "size": 172190,
        "blocks": 344,
        "atimeMs": 1608675822963.3257,
        "mtimeMs": 1608675822966.0984,
        "ctimeMs": 1608675822966.0984,
        "birthtimeMs": 1608675822963.3257,
        "atime": "2020-12-22T22:23:42.963Z",
        "mtime": "2020-12-22T22:23:42.966Z",
        "ctime": "2020-12-22T22:23:42.966Z",
        "birthtime": "2020-12-22T22:23:42.963Z"
    },
    "md5": "937a8dd13975a2eec69ae167fbf7e1d3",
    "ownerId": "ckhdsd0hk0003509kchzbdl83",
    "used": true,
    "_urls": {},
    "_url": "https://example.net/uploads/attachments/ckj0k1t2w000w7u9kb0vdp52u-cms-research.pdf"
}
```

## boolean

```json
{
  "booleanField": true
}
```

## checkboxes

```json
{
  "checkFields" : [
    "med",
    "small"
  ]
}
```
## color

```json
{
  "colorField": "#9013feff"
}
```

## date

```json
{
  "dateField": "2012-12-21"
}
```

## email

```json
{
  "emailField": "jon@bonjovi.rocks"
}
```

## float

```json
{
  "floatField": 8675.309
}
```

## integer

```json
{
  "integerField": 42
}
```

## password

```json
{
  "pwField": "don't use this for sensitive passwords"
}
```

## range

```json
{
  "rangeField": 21
}
```

## relationship

```json
// This field was named `_relation`
{
  "relationIds" : [
		"ckitdkktu002bu69krdkdu2pj"
  ],
  "_relation": [
    {
      "_id": "ckitdkktu002bu69krdkdu2pj",
      "trash": false,
      "disabled": false,
      "type": "@apostrophecms/user",
      "firstName": "Alexander",
      "lastName": "Hamilton",
      "title": "Alexander Hamilton",
      "slug": "user-alexander-hamilton",
      "username": "adotham",
      "email": "aham@treasury.gov",
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

```json
{
  "selectField": "selected value"
}
```

## slug

```json
{
  "slugField": "slugified-string"
}
```

## string

```json
{
  "stringField": "String value"
}
```

## time

```json
{
  "timeField": "00:13:22"
}
```

## url

```json
{
  "urlField": "http://apostrophecms.com"
}
```
