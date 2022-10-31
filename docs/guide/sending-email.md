# Sending email from your Apostrophe project

Any module in Apostrophe can send email through the [`email()`](/reference/modules/module.html#featured-methods) method and the popular [nodemailer](https://nodemailer.com/) package. However, prior to sending an email using this method, either the `nodemailer` option of the `@apostrophecms/email` module needs to be configured, or another Nodemailer transport needs to be defined as `self.transport` in that same module.

## Configuring to use `sendmail`

If your server has `sendmail` installed, `nodemailer` can use the service to send emails by setting the `sendmail` property to `true`. Both the `newline` and `path` properties may also need to be set. By default, `newline` is set to `unix`, you can instead pass `windows`. The `path` property defaults to `usr/bin/sendmail`. If this isn't how your server is configured, then the correct path needs to be passed in.

### Example

<AposCodeBlock>

```js
module.exports = {
  options: {
    nodemailer: {
      sendmail: true,
      path: 'user/sbin/sendmail'
    }
  }
};

```
<template>
/modules/@apostrophecms/email
</template>

Once the `@apostrophecms/email` module is configured

</AposCodeBlock>



