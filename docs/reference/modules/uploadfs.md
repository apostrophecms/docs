
# `@apostrophecms/uploadfs`


 Much as `@apostrophecms/express` configures Express or `@apostrophecms/db` makes a connection to MongoDB, the `@apostrophecms/uploadfs` module creates an instance of the `uploadfs` module and makes it available to the rest of Apostrophe. The `uploadfs` module copies files to a web-accessible location and provides a consistent way to get the URLs that correspond to those files.  It includes S3-based, Azure-based, GCS-based, and local filesystem-based backends and you may supply others. `uploadfs` can also resize, crop, and autorotate uploaded images.

An instance of the `uploadfs` module is available through `self.apos.uploadfs`. This can be used for custom uploads as long as the existing `/attachments` and `/apos-frontend` prefixes are avoided. This is the typical use case. If you really need access to the `@apostrophecms/uploadfs` module itself in order to obtain a new, separate instance of uploadfs for an unusual application, use `self.apos.modules['@apostrophecms/uploadfs']`.

## Selected Options
::: note
These are only selected options. For additional options, see the [documentation](https://www.npmjs.com/package/uploadfs) for the `uploadfs` npm package. While the `uploadfs` module handles image manipulation, these image-related options are configured mostly by the `attachment` module and will be covered by the reference page for that module.
:::

The `uploadfs` module storage options can be configured in several ways. For the Amazon S3 service you can set the most common options through [environment variables](#environmentvariables). Options that are common to both attachments and assets can be configured through the `uploadfs` property within the module `options` in `modules/@apostrophecms/uploadfs/index.js`. For less common asset storage use cases, like alternative CDN usage for attachments and assets, additional configuration can be passed in the same manner through the `modules/@apostrophe/asset/index.js` file.

<AposCodeBlock>

```javascript
module.exports = {
  options: {
👉🏻  uploadfs: {
      storage: 'local'
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

The options documentation for this module are split into those that are general storage options and those that are service-specific for local, AWS S3, Microsoft Azure, and Google Cloud Storage. A number of the options are described in greater detail in the official documentation for the specific service and links are provided. If you are using an S3 compatible service, the options provided through the `storage: 's3'` option are a good starting point and may be sufficient, along with the `endpoint` option which is needed to point to an alternative provider.

## General Storage Options
|  Property | Type | Description |
|---|---|---|
| [`cdn`](#cdn) | String \|\| Object | Takes either a string representing the URL of the CDN, or an object with `url` and `enabled` properties. |
| `prefix` | String | Allows prefixing of static assets that share a single, multisite backend bucket |
| [`storage`](#storage) | String \|\| Object  | Storage backend specified as string for built-in solutions or an object for custom storage. |
| [`tempPath`](#temppath) | String | Defaults to `data/temp/uploadfs` relative to the project root. Directory location for creating the temporary folder and files during processing. |

### `cdn`
If you choose to host assets on a CDN, set the `cdn` property value to the URL of the CDN. This property can also take an object with two properties - `url` and `enabled`. The `url` property value is the URL of the CDN and `enabled` takes a boolean which determines if the CDN will be used. This results in Apostrophe outputing URLs that point to the CDN rather than directly to the storage backend. Configuring your CDN of choice to automatically obtain files from your storage backend is your responsibility.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      cdn: {
        url:'https://wpc.cdnurl.com',
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

### `tempPath`
During processing of files, the `uploadfs` module first copies them to a temporary location until the pipeline is finished. By default this is set to `data/temp/uploadfs` by the `@apostrophecms/uploadfs` module. The `tempPath` property takes a local directory path for creating the `/temp` folder that houses these files. It is deleted after the build process.

---

## Local Storage Options
|  Property | Type | Description |
|---|---|---|
| [`disabledFileKey`](#disabledfilekey) | String | Used along with the `enable` and `disable` methods to rename and obfuscate files to block access. |
| [`uploadsPath`](#uploadspath) | String | Changes the storage location of uploadfs on the local filesystem from the default `public/uploads` subdirectory of the project root. |
| [`uploadsUrl`](#uploadsurl) | String | Sets the endpoint for asset access. Defaults to `/uploads`. |

### Minimal Local Example
<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      storage: 'local' //this is also the default
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

### `disabledFileKey`
This property takes a string (longer is better) and provides an alternative way to make uploaded assets disabled for access when using local storage. Explicitly preventing web access using the `disable` method blocks local file system access by modifying the file permissions which will lead to problems syncing content with `rsync` or similiar commands. This can be circumvented by using a string passed to the `disabledFileKey` property. This value is used with the filename to create an HMAC key hash that is appended to the filename. This is typically sufficient to obfuscate the file name and prevent access. It is recommended that this option be used from the start of the project, but the module exposes a method, [migrateToDisabledFileKey](#migratetodisabledfilekey), to switch later if desired.

### `uploadsPath`
By default, this is set to the `/public/uploads` directory at the root of your project by the `@apostrophecms/uploadfs` module. If desired, you can reassign this to a different directory.

### `uploadsUrl`
By default, this is set to your local apostrophe instance base URL, plus any localization prefix, plus `/uploads` by the `node_modules/apostrophe/modules/@apostrophecms/uploadfs` module. If desired, you can reassign this to a different directory.

---

## S3 Storage Options
The options listed below are ApostropheCMS specific. Any AWS S3-specific options can be passed as options using the properties listed in the AWS SDK [documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property). This option is viable for other storage vendors that use S3-compatible methods, like DigitalOcean or Linode.
|  Property | Type | Description |
|---|---|---|
| [`agent`](#agent) | Object | The Agent object used to perform HTTP requests - passed into the `params.httpOptions`. |
| `bucket` | String | Sets the bucket name. |
| [`contentTypes`](#contenttypes) | Object | Adds additional project asset file extensions, without leading '.', as properties with corresponding mimetype as value. |
| `cachingTime` | Integer | Changes the default caching time to a new amount of time, in seconds, for an asset. |
| [`endpoint`](#endpoint) | String | Sets the endpoint URI to send requests. |
| `https` | Boolean | Setting this to true forces `https:` transfer to the endpoint. |
| [`noGzipContentTypes`](#nogzipcontenttypes) | Array | Designates file types that should not be gzipped and replaces the default list. |
| [`addNoGzipContentTypes`](#addnogzipcontenttypes) | Array | Adds to the default list of files that should not be gzipped. |
| [`region`](#region) | String | Used to build a standard AWS `endpoint`. |
| `style` | String  | If set to `path` it forces path style URLs for S3 objects - the same as passing `s3ForcePathStyle: true`. |
| `port` | Integer | Sets the port. |
| [`secret`](#secret) | String | Provides the account `secretAccessKey`. |
| [`key`](#key) | String | Provides the account `accessKeyId`. |
| [`token`](#token) | String  | Provides an optional `sessionToken`. |

Also see the (environment variables)[#environmentvariables], which are often sufficient to select and configure S3 without any options in the code.

### Minimal S3 Example
<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      storage: 's3',
      // Get your credentials at aws.amazon.com
      secret: 'xxx',
      key: 'xxx',
      // Bucket name created on aws.amazon.com
      bucket: 'bucketname',
      // Region name for endpoint
      region: 'us-east-1'
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

### `storage` {#s3storage}
The `storage` option should be set to `s3` to use the Amazon Web Services S3 or any other S3-compatible service, like DigitalOcean or Linode.

### `agent`
The `agent` property takes either `http.Agent` or `https.Agent`. This value will be used to set the `params.httpOptions.agent` value for the S3 service object. See the [documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html) for more details.

### `contentTypes`
The `contentTypes` property is populated by default with an object taken from the [`contentTypes.js`](https://github.com/apostrophecms/uploadfs/blob/main/lib/storage/contentTypes.js) file of the module. This object has all valid project file extensions as properties and their mimetype as value. Any object supplied to the `contentTypes` is merged with the existing default object.

### `endpoint`
The `endpoint` option allows setting of an endpoint to which to send requests. For the AWS S3 service it is constructed from the `region` option. However, this option allows for custom URLs for other non-AWS S3-compatible storage services, like DigitalOcean or Linode. This can also be set using an [environment variable](#environmentvariables).

### `noGzipContentTypes`
By default, an array of MIME types that should not be gzip compressed is loaded from the `/lib/storage/noGzipContentTypes.js` file in the `uploadfs` npm module. If you pass an array through the `noGzipContentTypes` option it will replace this default list. 

### `addNoGzipContentTypes`
Adding an array of MIME types to the `addNoGzipContentTypes` will result in merging of those MIME types with the existing default array of types that should not be compressed.

### `region`
The `region` option is used to pass a specific AWS S3 region to build the endpoint. The allowed values are listed in the [official documentation](https://docs.aws.amazon.com/general/latest/gr/s3.html). If you are using a third party S3 provider like DigitalOcean, you should specify `endpoint` instead. This can also be set using an [environment variable](#environmentvariables).

### `secret`
The `secret` option is used to pass the value of the `secretAccessKey` to the `AWS.Credentials()` credentials object. See the [official documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor_details) for alternative ways to present the credentials. This can also be set using an [environment variable](#environmentvariables).

### `key`
The `key` option is used to pass the value of the `accessKeyId` to the `AWS.Credentials()` credentials object. See the [official documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor_details) for alternative ways to present the credentials. This can also be set using an [environment variable](#environmentvariables).

### `token`
The `token` option is used to pass the value of the optional `sessionToken` to the `AWS.Credentials()` credentials object. See the [official documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor_details) for alternative ways to present the credentials.

---

## Azure Storage Options
See the [Azure documentation](https://docs.microsoft.com/en-us/rest/api/storageservices/) for additional details.
|  Property | Type | Description |
|---|---|---|
| `account` | String | Required. Sets the storage account name. |
| `allowedMethods` | Array | Configures CORS allowed methods. |
| `allowedHeaders` | Array | Configures CORS allowed headers. |
| `allowedOrigins` | Array | Configures CORS allowed origins. |
| `container` | String | Sets the storage container name. |
| [`disabledFileKey`](#azuredisabledfilekey) | String | Required. Works along with the `enable` and `disable` methods to rename and obfuscate files to block access. |
| `exposedHeaders` | Array | Configures the exposure or the CORS response headers. |
| `key` | String | Required. Sets the access key. |
| `maxAgeInSeconds` | Integer | Sets the maximum amount of time the browser should cache the preflight OPTIONS request. |
| [`replicateClusters`](#replicateClusters) | Array |Array of objects to replicate content across a cluster. |

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
      // Always required for Azure
      disabledFileKey: 'a random string of your choosing'
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

::: warning
If using Azure as your storage choice, you must always set `disabledFileKey` option. With Azure, the permissions for a single blob (file) can't be changed, so it must be duplicated and renamed to disable web access.
:::

### `storage` {#azurestorage}
The `storage` option should be set to `azure` to use the Microsoft Azure service.

### `disabledFileKey` {#azuredisabledfilekey}
This required property takes a string (generate a random, secure password of at least 8 characters) and provides a way to make uploaded assets disabled for access. This value is used with the filename to create an HMAC key hash that is appended to the filename. This is typically sufficient to obfuscate the file name and prevent access.

### `replicateClusters`
This property takes an array of objects describing individual containers to replicate data across. Each object takes `account`, `container`, and `key` properties.

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

---

## GCS Storage Options
See the [Google Cloud Storage (GCS) documentation](https://googleapis.dev/nodejs/storage/latest/Bucket.html
) for additional details.
|  Property | Type | Description |
|---|---|---|
| `bucket` | String | Sets the bucket name. |
| [`contentTypes`](#gcscontenttypes) | Object | Adds additional project asset file extensions as properties with corresponding mimetype as value. |
| `cachingTime` | Integer | Changes the default 1 hour caching time to a new amount of time, in seconds, for an asset. |
| `endpoint` | String | Sets the endpoint URI to send requests. |
| `https` | Boolean | Setting this to true forces `https:` transfer to the endpoint. |
| `port` | Integer | Sets the port. |
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
      region: 'us-west-2'
    }
  }
};

```
  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

### `storage` {#gcsstorage}
The `storage` option should be set to `gcs` to use the Google Cloud Storage service.

### `contentTypes` {#gcscontenttypes}
The `contentTypes` property is populated by default with an object taken from the [`contentTypes.js`](https://github.com/apostrophecms/uploadfs/blob/main/lib/storage/contentTypes.js) file of the module. This object has all valid project file extensions as properties and their mimetype as value. Any object supplied to the `contentTypes` is merged with the existing default object.

---

## Environment variables

Apostrophe exposes a number of environmental variables for easily setting a number of options for the AWS S3 and GCS services.

For the AWS S3 service and similar S3-type services, these variables cover the most common options needed to use the service.

### `APOS_S3_BUCKET`
 The 'APOS_S3_BUCKET' takes the bucket name and is required. Adding a value to this variable will also automatically set the `storage` option to `s3` and enables setting the other S3 options using environment variables. This value will override the value passed in through the corresponding option.

### `APOS_S3_SECRET`
The `APOS_S3_SECRET` variable is required and takes the `secretAccessKey` option for the account. This value will override the value passed in through the corresponding option.
### `APOS_S3_KEY`
The `APOS_S3_KEY` variable is required and takes the `accessKeyId` for the account. This value will override the value passed in through the corresponding option.
### `APOS_S3_REGION`
The `APOS_S3_REGION` variable will be used to set the endpoint and is required when using the AWS S3 service. If using a S3-type service, like DigitalOcean or Linode` it is optional and `APOS_S3_ENDPOINT` is required. This value will override the value passed in through the corresponding option.

### `APOS_S3_ENDPOINT`
The `APOS_S3_ENDPOINT` variable is used with S3-type services offered by vendors other than AWS and is required when using these types of services. This value will override the value passed in through the corresponding option.

### `GOOGLE_APPLICATION_CREDENTIALS`
The GCS service `storage` option requires that the `GOOGLE_APPLICATION_CREDENTIALS` environment variable be set to the location of a service account file obtained from the Google Cloud Console.

#### Example
```sh
export GOOGLE_APPLICATION_CREDENTIALS=./projectname-f7f5e919aa79.json
```

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

### `migrateFromDisabledFileKey(callback)` {migratefromdisabledfilekey}
The `migrateFromDisabledFileKey` function provides a way to switch any file previously disabled using the `disabledFileKey` option to use the `disable` method instead. Note: the `disabledFileKey` option should be removed before invoking this method.

#### Example

```javascript
self.apos.uploadfs.migrateFromDisabledFileKey(function(e) { … });
```

### `migrateToDisabledFileKey(callback)` {migratetodisabledfilekey}
The `migrateToDisabledFileKey` function provides a way to switch any file previously disabled using the`disable` method to use the `disabledFileKey` option. Note: `disabledFileKey` must be set before invoking this method.

#### Example

```javascript
self.apos.uploadfs.migrateToDisabledFileKey(function(e) { … });
```

