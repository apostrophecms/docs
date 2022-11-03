# Sending email from your Apostrophe project

Any module in Apostrophe can send email through the [`email()`](/reference/modules/module.html#featured-methods) method and the popular [nodemailer](https://nodemailer.com/) package. However, prior to sending an email using this method, either the `nodemailer` option of the `@apostrophecms/email` module needs to be configured, or another Nodemailer transport needs to be defined as `self.transport` in that same module. The `nodemailer` option will pass any values to the [`createTransport` method](https://nodemailer.com/about/) of the nodemailer app.

Due to the difficulty of ensuring that emails are delivered reliably, we recommend that you utilize a delivery provider. However, if your server is set-up with both [DKIM](https://www.dkim.org/) and [SPF](https://en.wikipedia.org/wiki/Sender_Policy_Framework) ([DMARC](https://en.wikipedia.org/wiki/DMARC)) configured correctly, you can easily use the `sendmail` server app.

## Configuring to use `sendmail`

If your server has `sendmail` installed, `nodemailer` can use the service to send emails by setting the `sendmail` property to `true`. Both the `newline` and `path` properties may also need to be configured. By default, `newline` is set to `unix`, but it also accepts `windows` if needed. The `path` property defaults to `usr/bin/sendmail`. If this isn't how your server is configured, then the correct path needs to be passed in.

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
<template v-slot:caption>
/modules/@apostrophecms/email
</template>

</AposCodeBlock>

## Configuring using generic SMTP

Using a 3rd-party email delivery provider like Gmail, or Mailgun will probably better guarantee delivery without the email being either bounced or sent to spam. Most providers use SMTP. In fact, the `sendmail` server application uses SMTP. It just performs most of the configuration for you automatically. To configure sending through other providers, you typically need to supply three different parameters to the `nodemailer` option through an object - the 'host', 'port', and 'auth' parameters. Depending on the host there are a number of other options that could be passed as outlined in the [`nodemailer` documentation](https://nodemailer.com/smtp/).

### Example

<AposCodeBlock>

```js
module.exports = {
  options: {
    nodemailer: {
      host: "smtp.example.com",
      port: 587,
      auth: {
        user: "username",
        pass: "password"
      }
    }
  }
};

```
<template v-slot:caption>
/modules/@apostrophecms/email
</template>

</AposCodeBlock>

## Using specific service APIs

The `nodemailer` app has three built-in transports - `sendmail`, `SES`, for sending by AWS SES, and `stream`, which is used for testing. You can create your own custom transport using the `nodemailer` [transport API documentation](https://nodemailer.com/plugins/create/#transports), or use one of the many transport plugins that are available. These can either be found on the providers site, or by [searching NPM](https://www.npmjs.com/search?q=nodemailer%20transport). Each transporter will have slightly different parameters configured through an object that is then passed along with the specific transport.

### Example for Mailgun

<AposCodeBlock>

```js
const mg = require('nodemailer-mailgun-transport');

const auth = {
  auth: {
    api_key: 'key-1234123412341234',
    domain: 'one of your domain names listed at your https://app.mailgun.com/app/sending/domains'
  }
};

module.exports = {
  options: {
    nodemailer: mg(auth);
  }
};

```
<template v-slot:caption>
/modules/@apostrophecms/email
</template>

</AposCodeBlock>

## Sending email from a module
Once the `@apostrophecms/email` module is configured, email can be sent from any module using the `self.email(req, template, data, options)` method.

The first parameter passed to this method is the page `req`.

The next parameter, `template`, takes the name of a Nunjucks template that will make up the body of the email. This template should be located in the `views` template of the module.

The `data` parameter take an object that will be passed to the Nunjucks template for populating any customized fields. It can be accessed through `data.property` within the template.

The final parameter, `options` should be an object that contains the information for the email header. This is typically `from`, `to`, and `subject`. Any of these can also be set in the `options` of the `@apostrophecms/email` module, just like the transport. Any parameters specified in each individual module will override those set in this manner.

### Example usage

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    lable: 'article',
    pluralLabel: 'articles'
  },
  fields: {
    add: {
      blurb: {
        type: 'area',
        label: 'Blurb',
        help: 'A short summary.',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: [ 'Bold', 'Italic' ]
            }
          }
        }
      },
      _topics: {
        label: 'Article topics',
        type: 'relationship',
        withType: 'topic',
        fields: {
          add: {
            relevance: {
              type: 'string'
            }
          }
        }
      },
      main: {
        label: 'Content',
        type: 'area',
        options: {
          widgets: require('../../../lib/area.js').fullConfig
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'blurb'
        ]
      },
      main: {
        label: 'Content',
        fields: [
          'main',
          '_topics'
        ]
      }
    }
  },
  handlers(self) {
    return {
      'afterSave': {
        async sendEmail(req, data) {
          const options = {
            from: 'admin@mysite.com',
            to: 'editors@mysite.com',
            subject: 'New Article added'
          };
          const template = 'email.html';
          try {
            await self.email(req, template, data, options);
          return null;
          } catch (err) {
            self.apos.util.error('email notification error: ', err);
          }
        }
      }
    }
  }
};
```

<template v-slot:caption>
/modules/article
</template>

</AposCodeBlock>


<AposCodeBlock>

```django
<h1>A new article has been added to the site</h1>
<p>Here is the blurb</p>

{% area data, 'blurb'}
```

<template v-slot:caption>
/modules/article/views/email.html
</template>

</AposCodeBlock>

::: note
Note that in the Nunjucks template, the area is passed in through the `data` context. It isn't being passed in through the `data.piece` context as it would for a normal Nunjucks template view.
:::

## Triggering email from a route

In addition to using `handlers` to trigger email delivery, you can use `apiRoutes()`. 



