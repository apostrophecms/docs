
# `@apostrophecms/module-name`

<AposRefExtends :module="$frontmatter.extends" />

The `uploadfs` module copies files to a web-accessible location and provides a consistent way to get the URLs that correspond to those files.  `uploadfs` can also resize, crop and autorotate uploaded images. It includes S3-based, Azure-based, GCS-based, and local filesystem-based backends and you may supply others.

## Selected Options
::: note
These are only selected options. For additional options, see the main [documentation](https://www.npmjs.com/package/uploadfs) for this module. While the majority of image manipulation options are provided by this module, they are typically configured by the `attachment` module and will be covered by the reference page for that module.
:::

## Image options
| [`image`](#image) | String \|\| Object | Defaults to `sharp`. Takes a string representing an image processor or object specifying a custom image processor. |
| [`postprocessors`(#postprocessors) | Array | Array of postprocessor objects for further image processing , like `imagemin`. |

### `image`
'image' defaults to 'sharp' and using the built-in [sharp.js](https://www.npmjs.com/package/sharp) image processor. This property also accepts `imagemagik` if it has been installed, or an object specifying a custom processor. See the [`sharp.js`](https://github.com/apostrophecms/uploadfs/blob/main/lib/image/sharp.js) file for example.

### `postprocessors`
It is possible to configure `uploadfs` to run a postprocessor on every custom-sized image that it generates. This is intended for file size optimization tools like `imagemin`.

Here is an example based on the `imagemin` documentation:

<AposCodeBlock>

```javascript
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

uploadfs({
  storage: 'local',
  image: 'sharp',
  tempPath: __dirname + '/temp',
  imageSizes: [
    {
      name: 'small',
      width: 320,
      height: 320
    },
    {
      name: 'medium',
      width: 640,
      height: 640
    }
  ],
  postprocessors: [
    {
      postprocessor: imagemin,
      extensions: [ 'gif', 'jpg', 'png' ],
      options: {
        plugins: [
          imageminJpegtran(),
          imageminPngquant({quality: '65-80'})
        ]
      }
    }
  ]
});
```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>


## General Storage Options
|  Property | Type | Description |
|---|---|---|
| [`cdn`](#cdn) | String \|\| Object | Takes either a string representing the URL of the CDN, or an object with `url` and `enabled` properties. |
| [`parallel`](#parallel) | Integer | The number of concurrent calls to `copyImageIn` |
| `prefix` | String | Allows prefixing of static assets that share a single, multisite backend bucket |
| [`storage`](#storage) | String \|\| Object  | Storage location specified as string for built-in solutions or object for custom storage. |
| `strictPaths` | Boolean | By default, `uploadfs` will modify slashes in the asset path, setting this to `true` will eliminate this behavior. |
| [`tempPath`](#temppath) | String | The directory location for creating the `/temp` folder and temporary files during processing. |

## [Backend-type Specific Options](backend-typespecificoptions)
|  Property | Type | Description |
|---|---|---|
| `bucket` | String | Sets the bucket name for either S3 or GCS services. |
| `contentTypes` | Object | Adds additional project asset file extensions as properties with corresponding mimetype as value.  |
| `disabledFileKey` | String | Used to rename and obfuscate files uploaded to the server in order to block access |
| `endpoint` | String | Sets the endpoint URI for S3 or GCS services to send request to. |
| `https` | Boolean | Setting this to true forces `https:` transfer to the endpoint for S3 or GCS services. |
| `key` | String | Sets the access key for S3 or Azure services. |
| `port` | Integer | Sets the port for S3 or GCS services. |
| `cachingTime` | Integer | Changes the default caching time for an asset for the S3 and GCS services. |

## [Local Storage Options](#localstorageoptions)
|  Property | Type | Description |
|---|---|---|
| `uploadsPath` | String | Sets the directory location for creating the local `/public/uploads` folder and writing post-processed files. |
| `uploadsUrl` | String | Sets the endpoint for asset access. |

## [S3 Storage Options](#s3storageoptions)
See the AWS S3 documentation [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html) for details.
|  Property | Type | Description |
|---|---|---|
| `agent` | Object |The agent object to perform HTTP requests with. |
| `noGzipContentTypes` | Array | Designates file types that should not be gzipped and replaces the default list. |
| `addNoGzipContentTypes` | Array | Adds to the default list of files that should not be gzipped. |
| `params` | Object | An optional map of parameters to bind every request sent by the service object. |
| `secret` | String | Provides the account secret access key. |
| `style` | String  | If set to `path` it forces path style URLs for S3 objects. |
| `token` | String  | Provides an optional session token to the credentials object. |

## [Azure Storage Options](#azurestorageoptions)
See the Azure  documentation [here](https://docs.microsoft.com/en-us/rest/api/storageservices/cross-origin-resource-sharing--cors--support-for-the-azure-storage-services) for details.
|  Property | Type | Description |
|---|---|---|
| `account` | String | Sets the storage account name. |
| `allowedMethods` | Array | Configures CORS allowed methods. |
| `allowedHeaders` | Array | Configures CORS allowed headers. |
| `allowedOrigins` | Array | Configures CORS allowed origins. |
| `container` | String | Sets the storage container name. |
| `exposedHeaders` | Array | Configures the exposure or the CORS response headers. |
| `gzipEncoding` | Object | Designates file type to gzip or prevent from gzipping using  property:value pairs of file extensions and `true` or `false` for values. |
| `maxAgeInSeconds` | Integer | Sets the maximum amount of time the browser should cache the preflight OPTIONS request. |
| `replicateClusters` | Array |Array of objects to replicate content across clusters. |

## GCS Storage Options
See the GCS documentation [here](https://googleapis.dev/nodejs/storage/latest/Bucket.html
) for additional details.
|  Property | Type | Description |
|---|---|---|
| `validation`| String \|\| Boolean | Method for checking data integrity - 'md5', 'crc32c', or false. |

### `cdn`
If you choose to host assets on a CDN, set the `cdn` property value to the URL of the CDN. This property can also take an object with two properties - `url` and `enabled`. The `url` property value is the URL of the CDN and `enabled` takes a boolean which determines if the CDN will be used.

### `parallel`
The `parallel` property sets the number of image sizes to render simultaneously per call to `copyImageIn`. It defaults to 1 and can be set to as high as the total number of sizes to be rendered, at the expense of memory and CPU load.

### `storage` 
This property takes either a string designating one of the built-in storage options to be used, or an object for custom storage needs. Built-in values are `azure` (Microsoft Azure), `gcs` (Google Cloud Storage), `local` (local file storage only), and `s3` (Amazon Simple Storage Service). See the [`s3.js` file](https://github.com/apostrophecms/uploadfs/blob/main/lib/storage/s3.js) for an example of creating a custom storage solution.

### `tempPath`
During processing of files, the `uploadfs` module first copies them to a temporary location until the pipeline is finished. By default this is the `data/temp/uploadfs` folder of the project root directory. The `tempPath` property takes a local directory path for creating the `/temp` folder that houses these files. It is deleted after the build process.

## Backend-type Specific Options

### `contentTypes`
This `contentTypes` property is populated by default with an object taken from the [`contentTypes.js`](https://github.com/apostrophecms/uploadfs/blob/main/lib/storage/contentTypes.js) file of the module. This object has all valid project file extensions as properties and their mimetype as value. Any object supplied to the `contentTypes` is merged with the existing default object.

### `disabledFileKey`
This property provides an alternative way to make uploaded assets disabled for web access. Explicitly preventing web access using the `disable` method then prevents local file system access. This can be circumvented by using a string passed to the `disabledFileKey` property. This value is used with the filename to create an HMAC key hash that is appended to the filename.

::: warning
If using Azure as your storage choice, you should always use `disabledFileKey` and never use the `disable` method. With Azure, the permissions for a single blob (file) can't be changed, so it must be duplicated and renamed to disable web access.
:::

## Local Storage Options

### `uploadsPath`
By default this is set to the `/public/uploads` directory at the root of your project. If desired you can reassign this to a different directory.

### `uploadsUrl`
By default this is set to your local apostrophe instance base URL, plus any localization prefix, plus `/uploads`.

## S3 Storage Options

### `noGzipContentTypes`
By default, an array of MIME types that should not be gzip compressed is loaded from the `/lib/storage/noGzipContentTypes.js` file in the uploadfs package. If you pass an array through the `noGzipContentTypes` option it will replace this default list. 

### `addNoGzipContentTypes`
Adding an array of MIME types to the `addNoGzipContentTypes` will result in merging of those MIME types with the existing default array of types that should not be compressed.

## Azure Storage Options

### `gzipEncoding`
By default, the Azure storage option will gzip all files except those who have an extension in the array passed by the `defaultGzipBlacklist.js` file at the root of the 'uploadfs' package. The `gzipEncoding` option takes an object with file extensions as properties and values of `true` or `false`. These choices will be merged with the default selection to either remove the file type from the existing list and enable gzip compression if `true`, or add it to the list and disable gzip compression if `false`.

### `replicateClusters`


## Featured methods
### `copyIn`
### `copyOut`
### `migrateFromDisabledFileKey`
### `migrateToDisabledFileKey`

## ENV vars
### APOS_S3_REGION
### APOS_S3_BUCKET

AWS S3 https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
GCS https://googleapis.dev/nodejs/storage/latest/Bucket.html

!!!!! util.promisify
