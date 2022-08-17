
# `@apostrophecms/uploadfs`


The `uploadfs` module copies files to a web-accessible location and provides a consistent way to get the URLs that correspond to those files.  `uploadfs` can also resize, crop and autorotate uploaded images. It includes S3-based, Azure-based, GCS-based, and local filesystem-based backends and you may supply others.

## Selected Options
::: note
These are only selected options. For additional options, see the main [documentation](https://www.npmjs.com/package/uploadfs) for this module. While the `uploadfs` module handles image manipulation, options are configured mostly by the `attachment` module and image specific options will be covered by the reference page for that module.
:::

The `uploadfs` module storage options can be configured in several ways. For the Amazon S3 service you can set the most common options through [environment variables](#environmentvariables). Options that are common to both attachments and assets can be configured through the `uploadfs` property from `modules/@apostrophecms/uploadfs/index.js`. For less common asset storage use cases, like alternative CDN usage, additional configuration can be passed through `modules/@apostrophe/asset/index.js`.

The options documentation for this module are split into those that are passed for all backend storage services, options that are supplied to multiple services, and those that are service-specific. A number of the options are described in greater detail in the official documentation for the specific service and links are provided.

## General Storage Options
|  Property | Type | Description |
|---|---|---|
| [`cdn`](#cdn) | String \|\| Object | Takes either a string representing the URL of the CDN, or an object with `url` and `enabled` properties. |
| `prefix` | String | Allows prefixing of static assets that share a single, multisite backend bucket |
| [`storage`](#storage) | String \|\| Object  | Storage location specified as string for built-in solutions or an object for custom storage. |
| `strictPaths` | Boolean | By default, `uploadfs` will modify slashes in the asset path. Setting `strictPaths` to `true` will eliminate this behavior. |

## Backend-type Specific Options
|  Property | Type | Description |
|---|---|---|
| `bucket` | String | Sets the bucket name for either S3 or GCS services. |
| [`contentTypes`](#contenttypes) | Object | Adds additional project asset file extensions as properties with corresponding mimetype as value for the S3 and GCS services.  |
| [`disabledFileKey`](#disabledfilekey) | String | Used along with the `enable` and `disable` methods to rename and obfuscate files to block access for both local and Azure storage options. |
| `endpoint` | String | Sets the endpoint URI for S3 or GCS services to send requests. |
| `https` | Boolean | Setting this to true forces `https:` transfer to the endpoint for S3 or GCS services. |
| `key` | String | Sets the access key for S3 (for backwards compatibility, see below) or Azure services. |
| `port` | Integer | Sets the port for S3 or GCS services. |
| `cachingTime` | Integer | Changes the default caching time for an asset for the S3 and GCS services. |

## Local Storage Options
|  Property | Type | Description |
|---|---|---|
| [`uploadsPath`](#uploadspath) | String | Sets the directory location for creating the local `/public/uploads` folder and writing post-processed files. |
| [`uploadsUrl`](#uploadsurl) | String | Sets the endpoint for asset access. |

### Minimal Local Example
<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      storage: 'local',
      // The next three can be set if 
      // a different path from default is desired
      uploadsPath: __dirname + '/public/uploads',
      uploadsUrl: 'http://localhost:3000' + uploadsLocalUrl,
      tempPath: __dirname + '/temp',
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

## S3 Storage Options
The options listed below are ApostropheCMS specific. Any AWS S3-specific options can be passed as options using the properties listed in the AWS SDK [documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property).
|  Property | Type | Description |
|---|---|---|
| [`agent`](#agent) | Object | The Agent object used to perform HTTP requests - passed into the `params.httpOptions`. |
| [`noGzipContentTypes`](#nogzipcontenttypes) | Array | Designates file types that should not be gzipped and replaces the default list. |
| [`addNoGzipContentTypes`](#addnogzipcontenttypes) | Array | Adds to the default list of files that should not be gzipped. |
| `style` | String  | If set to `path` it forces path style URLs for S3 objects - the same as passing `s3ForcePathStyle: true`. |
| [`secret`](#secret) | String | Provides the account `secretAccessKey` for older knox style credentials. |
| `key` | String | Provides the account `accessKeyId` for older knox style credentials. |
| `token` | String  | Provides an optional `sessionToken` for older knox style credentials. |

### Minimal S3 Example
<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      storage: 's3',
      // Add an arbitrary S3 compatible endpoint
      endpoint: 's3-compatible-endpoint.com',
      // Get your credentials at aws.amazon.com
      secret: 'xxx',
      key: 'xxx',
      // Bucket name created on aws.amazon.com
      bucket: 'bucketname',
      // For read-after-write consistency in the US East region.
      // You could also use any other region name except us-standard
      region: 'external-1',
      // Any additional S3 object options specified in the linked documentation
      useDualstackEndpoint: true
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

## Azure Storage Options
See the Azure documentation [here](https://docs.microsoft.com/en-us/rest/api/storageservices/) for additional details.
|  Property | Type | Description |
|---|---|---|
| `account` | String | Sets the storage account name. |
| `allowedMethods` | Array | Configures CORS allowed methods. |
| `allowedHeaders` | Array | Configures CORS allowed headers. |
| `allowedOrigins` | Array | Configures CORS allowed origins. |
| `container` | String | Sets the storage container name. |
| `exposedHeaders` | Array | Configures the exposure or the CORS response headers. |
| [`gzipEncoding`](#gzipencoding) | Object | Designates file types to gzip or prevent from gzipping using  property:value pairs of file extensions and `true` or `false` for values. |
| `maxAgeInSeconds` | Integer | Sets the maximum amount of time the browser should cache the preflight OPTIONS request. |
| [`replicateClusters`](#replicateClusters) | Array |Array of objects to replicate content across clusters. |
| [`tempPath`](#temppath) | String | The directory location for creating the `/temp` folder and temporary files during processing. |

### Minimal Azure Example
<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      storage: 'azure',
      account: 'storageAccountName',
      container: 'storageContainerName',
      key: 'accessKey',
      // If a non-default path is desired
      tempPath: __dirname + '/temp',
      // Always required for Azure
      disabledFileKey: 'a random string of your choosing',
      gzipEncoding: {
        docx: true,
        pdf: false
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

## GCS Storage Options
See the GCS documentation [here](https://googleapis.dev/nodejs/storage/latest/Bucket.html
) for additional details.
|  Property | Type | Description |
|---|---|---|
| `validation`| String \|\| Boolean | Method for checking data integrity - 'md5', 'crc32c', or false. |

### Minimal GCS Example
<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      storage: 'gcs',
      // Create bucket in the Google Cloud Console
      bucket: 'bucketname',
      // Select your region
      region: 'us-west-2',
      validation: 'md5'
    }
  }
};

```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

<h2>General Storage Options</h2>

### `cdn`
If you choose to host assets on a CDN, set the `cdn` property value to the URL of the CDN. This property can also take an object with two properties - `url` and `enabled`. The `url` property value is the URL of the CDN and `enabled` takes a boolean which determines if the CDN will be used.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      cdn: {
        url:'https://wpc.cdnurl.com/cap/800001/',
        enabled: true
      }
    }
  }
};

```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

### `storage` 
This property takes either a string designating one of the built-in storage options to be used, or an object for custom storage needs. Built-in values are `azure` (Microsoft Azure), `gcs` (Google Cloud Storage), `local` (local file storage only), and `s3` (Amazon Simple Storage Service). See the [`s3.js`](https://github.com/apostrophecms/uploadfs/blob/main/lib/storage/s3.js) file for an example of creating a custom storage solution.

<h2>Backend-type Specific Options</h2>

### `contentTypes`
The `contentTypes` property is populated by default with an object taken from the [`contentTypes.js`](https://github.com/apostrophecms/uploadfs/blob/main/lib/storage/contentTypes.js) file of the module. This object has all valid project file extensions as properties and their mimetype as value. Any object supplied to the `contentTypes` is merged with the existing default object.

### `disabledFileKey`
This property takes a string (longer is better) and provides an alternative way to make uploaded assets disabled for access when using local and Azure storage. Explicitly preventing web access using the `disable` method blocks local file system access by modifying the file permissions. This can be circumvented by using a string passed to the `disabledFileKey` property. This value is used with the filename to create an HMAC key hash that is appended to the filename. This is typically sufficient to obfuscate the file name and prevent access.

::: warning
If using Azure as your storage choice, you should always use `disabledFileKey` with the `disable` method. With Azure, the permissions for a single blob (file) can't be changed, so it must be duplicated and renamed to disable web access.
:::

<h2>Local Storage Options</h2>

### `uploadsPath`
By default, this is set to the `/public/uploads` directory at the root of your project by the `node_modules/apostrophe/modules/@apostrophecms/uploadfs` module. If desired, you can reassign this to a different directory.

### `uploadsUrl`
By default, this is set to your local apostrophe instance base URL, plus any localization prefix, plus `/uploads` by the `node_modules/apostrophe/modules/@apostrophecms/uploadfs` module. If desired, you can reassign this to a different directory.

<h2>S3 Storage Options</h2>

### `agent`
The `agent` property takes either `http.Agent` or `https.Agent`. This value will be used to set the `params.httpOptions.agent` value for S3 service object. See the [documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html) for more details.

### `noGzipContentTypes`
By default, an array of MIME types that should not be gzip compressed is loaded from the `/lib/storage/noGzipContentTypes.js` file in the `node_modules/uploadfs` package. If you pass an array through the `noGzipContentTypes` option it will replace this default list. 

### `addNoGzipContentTypes`
Adding an array of MIME types to the `addNoGzipContentTypes` will result in merging of those MIME types with the existing default array of types that should not be compressed.

### `secret`
The `secret`, `key`, and `token` properties are all used to generate an `AWS.Credentials()` credentials object. This is for legacy AWS support. 

<h2>Azure Storage Options</h2>

### `gzipEncoding`
By default, the Azure storage option will gzip all files except those who have an extension in the array passed by the `defaultGzipBlacklist.js` file at the root of the 'uploadfs' package. The `gzipEncoding` option takes an object with file extensions as properties and values of `true` or `false`. These choices will be merged with the default selection to either remove the file type from the existing list and enable gzip compression if `true`, or add it to the list and disable gzip compression if `false`.

#### Example

<AposCodeBlock>

```javascript
 uploadfs: {
    gzipEncoding: {
       docx: true, // enable gzip encoding for .docx files
       pdf: false // disable gzip encoding for .pdf files
    }
 }
```
<template v-slot:caption>
   modules/@apostrophecms/uploadfs/index.js
</template>
</AposCodeBlock>

### `replicateClusters`
This property takes an array of objects describing individual clusters to replicate data across. Each object takes `account`, `container`, and `key` properties.

#### Example
<AposCodeBlock>

```javascript
uploadfs: {
    storage: 'azure',
    replicateClusters: [
      {
        account: 'storageAccountName1',
        container: 'storageContainerName1',
        key: 'accessKey1',
      },
      {
        account: 'storageAccountName2',
        container: 'storageContainerName2',
        key: 'accessKey2',
      },
    ]
}
```
<template v-slot:caption>
   modules/@apostrophecms/uploadfs/index.js
</template>
</AposCodeBlock>

### `tempPath`
During processing of files, the `uploadfs` module first copies them to a temporary location until the pipeline is finished. By default this is set to `data/temp/uploadfs` by the `node_modules/apostrophe/modules/@apostrophecms/uploadfs` module. The `tempPath` property takes a local directory path for creating the `/temp` folder that houses these files. It is deleted after the build process.

## Featured methods

### `copyIn(localPath, path, options, callback)`
This method is used for handling uploads by the various storage types exposed by `uploadfs`. It is used by both the `asset` and `attachment` modules, but can also be used to handle files that aren't covered by the `attachment` module. The `copyIn()` method takes a local filename through the `localPath` argument. This file is copied to a uploadfs path specified by the `path` argument. Any necessary intermediate folders that don't exist will be created. The optional `options` argument is used to pass additional options to the selected storage. Finally, the callback receives any errors. It is often useful to wrap this function in  `promisify` to convert it to a promise-based function.

#### Example
```javascript
async handleFile( file, uploadfsPath) {  
  const copyIn = require('util').promisify(self.uploadfs.copyIn);
  try {
    await copyIn(file, uploadfsPath)
  } catch (e) {
    console.error(e);
};  
```

### `copyOut(localPath, path, options, callback)`
Much like the `copyIn` method, the `copyOut` method takes a `localPath` and a uploadfs `path` and copies the file back from uploadfs to the local file system. This is used when an existing asset needs to be updated, such as supplying additional cropping or other image processing. It should be used sparingly because it can result in poor storage service performance. Like the `copyIn` method, wrapping `copyOut` in `promisify` is often useful.

#### Example

```javascript
async modifyImage( file, uploadfsPath) {  
  const copyOut = require('util').promisify(self.uploadfs.copyOut);
  const copyIn = require('util').promisify(self.uploadfs.copyIn);
  try {  
    await copyOut(file, uploadfsPath);
    await newImageCrop(file);
    await copyIn(file, uploadfsPath);
   } catch (err) {
    console.error(err);
  }
};
```

### `migrateFromDisabledFileKey(callback)`
The `migrateFromDisabledFileKey` function provides a way to switch any file previously disabled using the `disabledFileKey` option to use the `disable` method instead. Note: the `disabledFileKey` option should be removed before invoking this method.

#### Example

```javascript
self.uploadfs.migrateFromDisabledFileKey(function(e) { … });
```

### `migrateToDisabledFileKey(callback)`
The `migrateToDisabledFileKey` function provides a way to switch any file previously disabled using the`disable` method to use the `disabledFileKey` option.

#### Example

```javascript
self.uploadfs.migrateToDisabledFileKey(function(e) { … });
```

## ENVIRONMENT variables

### `APOS_S3_BUCKET`
Apostrophe exposes a number of environmental variables for easily setting a number of options for the AWS S3 service allows. The 'APOS_S3_BUCKET' must be set to the bucket name to set the account options in this way. The other possible environment variables are `APOS_S3_ENDPOINT`, `APOS_S3_SECRET`, `APOS_S3_KEY`, and `APOS_S3_REGION`. The values of these variables will override any values passed in through the corresponding option. No other cconfiguration is required.

### GOOGLE_APPLICATION_CREDENTIALS
The GCS service `storage` option requires that the `GOOGLE_APPLICATION_CREDENTIALS` environment variable be set to the location of a service account file obtained from the Google Cloud Console.

#### Example
```sh
export GOOGLE_APPLICATION_CREDENTIALS=./projectname-f7f5e919aa79.json
```
