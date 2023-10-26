---
extends: '@apostrophecms/module'
---

# `@apostrophecms/email`

<AposRefExtends :module="$frontmatter.extends" />

This module manages general email functionality that Apostrophe modules use. The most significant feature is the `nodemailer` option, which is used to configure the [Nodemailer](https://nodemailer.com/) third-party module.

## Options

|  Property | Type | Description |
|---|---|---|
|`from` | String | The default "from" address, either as the email address or with full name (e.g., `'"Jane Doe" <jane@doe.com>'`). |
|`nodemailer` | Object | An options object for Nodemailer. Required for sending email unless the transport is directly set on `self.transport`. It is passed to nodemailer's `createTransport` method. See the [Nodemailer](https://nodemailer.com/smtp/) documentation. |


### `nodemailer`

If using a pre-configured Nodemailer transport package that must be passed to the Nodemailer `createTransport` method (e.g., `nodemailer-mailjet-transport`, `nodemailer-mailgun-transport`), you may assign that package to the `nodemailer` option as well.

<AposCodeBlock>

  ```javascript
  const mailjetTransport = require('nodemailer-mailjet-transport');

  module.exports = {
    options: {
      from: '"Jane Doe" <jane.doe@my-website.com>',
      nodemailer: mailjetTransport({
        /// Mailjet configuration...
      })
    }
  };
  ```
  <template v-slot:caption>
    modules/@apostrophecms/email/index.js
  </template>
</AposCodeBlock>

If needed, you may assign the *fully* created transport directly to `self.transport` and omit the `nodemailer` option.

<AposCodeBlock>

  ```javascript
  const nodemailer = require('nodemailer');
  const mailjetTransport = require('nodemailer-mailjet-transport');

  module.exports = {
    init(self) {
      self.transport = nodemailer.createTransport(mailjetTransport({
        // Mailjet configuration...
      }), {
        // A full set of message defaults...
      })
    }
  };
  ```
  <template v-slot:caption>
    modules/@apostrophecms/email/index.js
  </template>
</AposCodeBlock>

## Related documentation

- [Guide to sending email from your Apostrophe project](/guide/sending-email.md)
- [The `self.email()` method in every module](/reference/modules/module.md#email-req-templatename-data-options)
