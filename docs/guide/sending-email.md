# Sending email from your Apostrophe project

Any module in Apostrophe can send email by calling its own [`self.email()`](/reference/modules/module.html#featured-methods) method and the popular [nodemailer](https://nodemailer.com/) package. However, prior to sending an email using this method, either the `nodemailer` option of the `@apostrophecms/email` module needs to be configured, or another Nodemailer transport needs to be defined as `self.transport` in that same module. The `nodemailer` option will pass any values to the [`createTransport` method](https://nodemailer.com/about/) of the nodemailer app.

Due to the difficulty of ensuring that emails are delivered reliably, we recommend that you utilize a delivery provider. However, if your server is set up with both [DKIM](https://www.dkim.org/) and [SPF](https://en.wikipedia.org/wiki/Sender_Policy_Framework) ([DMARC](https://en.wikipedia.org/wiki/DMARC)) configured correctly, you can easily use the `sendmail` server app.

## Configuring to use `sendmail`

If your server has `sendmail` installed, `nodemailer` can use the service to send emails by setting the `sendmail` property to `true`. Both the `newline` and `path` properties may also need to be configured. By default, `newline` is set to `unix`(\<LF\> only), but it also accepts `windows`(\<LF\> and \<CR\>). The `path` property defaults to `usr/bin/sendmail`. If this isn't how your server is configured, then the correct path needs to be passed in.

### Example

<AposCodeBlock>

```js
module.exports = {
  options: {
    nodemailer: {
      // enables the usage of `sendmail`
      sendmail: true,
      // changes the path to the `sendmail` app
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
      service: 'gmail',
      host: "smtp.gmail.com.com",
      auth: {
        // substitute in your actual Gmail credentials
        user: "username@gmail.com",
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

::: note
When using Gmail as the SMTP email relay, you need to make sure that the "from" address of your email matches the user name added to the nodemailer configuration. You will likely also have to allow [less secure apps](https://myaccount.google.com/lesssecureapps) and [disable Captcha]( https://accounts.google.com/DisplayUnlockCaptcha) from your Google account dashboard.
:::

## Using specific service APIs

The `nodemailer` app has four built-in transports - `sendmail`, `SES` - for sending by AWS SES, and the `stream` and `jsonTransport` transports - which are used for testing or passing data to another nodemailer extension for processing as detailed in the [nodemailer documentation](https://nodemailer.com/transports/stream/). You can create your own custom transport using the `nodemailer` [transport API documentation](https://nodemailer.com/plugins/create/#transports), or use one of the many transport plugins that are available. These can either be found on the provider's site or by [searching NPM](https://www.npmjs.com/search?q=nodemailer%20transport). Each transporter will have slightly different parameters configured through an object that is then passed along with the specific transport.

### Example for Mailgun

<AposCodeBlock>

```js
const mg = require('nodemailer-mailgun-transport');

const auth = {
  auth: {
    // key supplied with your Mailgun account
    api_key: 'key-1234123412341234',
    //one of your domains listed at your https://app.mailgun.com/app/sending/domains
    domain: 'sandbox.domain.com'
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

The first parameter passed to this method is the `req`.

The next parameter, `template`, takes the name of a Nunjucks template that will make up the body of the email. This template should be located in the `views` template of the module. The method will pass this HTML template, as well as an automatically generated plain text version, to the `nodemailer` transport object.

The `data` parameter takes an object that will be passed to the Nunjucks template for populating any customized fields. It can be accessed through `data.property` within the template.

The final parameter, `options`, should be an object that contains the information for the email header. This is typically `from`, `to`, and `subject`. Any of these can have defaults set in the `options` of the `@apostrophecms/email` module, just like the transport. Any parameters specified in an individual method call will override those set in this manner.

### Example usage

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    lable: 'article',
    pluralLabel: 'articles'
  },
  // additional module code
  handlers(self) {
    return {
      'afterSave': {
        async sendEmail(req, piece) {
          const options = {
            from: 'admin@mysite.com',
            to: 'editors@mysite.com',
            subject: 'New Article added'
          };
          try {
            await self.email(req, 'email.html', { piece }, options);
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
/modules/article/index.js
</template>

</AposCodeBlock>


<AposCodeBlock>

```django
<h1>A new article has been added to the site</h1>
<p>Here is the blurb</p>
{{ data.piece.title }}
{% area data.piece, 'blurb' %}
```

<template v-slot:caption>
/modules/article/views/email.html
</template>

</AposCodeBlock>

In this example, we are creating a custom piece type that implements an article. The `afterSave` server event property is being added to the `handlers()` function. This event is emitted any time this custom module saves a new article and runs the function that is being passed in as a value. This function, in turn, sends out an email to the site editors. The data coming from the piece is passed into the `email.html` template through the `data` argument to add the title and blurb for the editors to review.

## Debugging email delivery without sending

The `self.email()` method returns `info`. This can be used to determine if message handoff to the mailing service has been completed successfully. Note: this does not mean that message delivery will complete successfully. The email could still be rejected en route or by the receiving server.

The returned data can also be used along with the `stream` transporter to ensure that the header and body of the email have been correctly constructed without sending the email.

### Stream example

<AposCodeBlock>

```js
module.exports = {
  options: {
    nodemailer: {
      // enables the usage of the `stream` transport
      streamTransport: true
    }
  }
};
```

<template v-slot:caption>
/modules/@apostrophecms/email
</template>
</AposCodeBlock>

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    lable: 'article',
    pluralLabel: 'articles'
  },
  // additional module code
  handlers(self) {
    return {
      'afterSave': {
        async sendEmail(req, piece) {
          const options = {
            from: 'admin@mysite.com',
            to: 'editors@mysite.com',
            subject: 'New Article added'
          };
          try {
            const info = await self.email(req, 'email.html', { piece }, options);
          }
          console.log(info.envelope);
          console.log(info.messgeId);
          info.message.pipe(process.stdout);
        }
      }
    }
  }
};
```

<template v-slot:caption>
/modules/article/index.js
</template>

</AposCodeBlock>

## Triggering email from a route

In addition to using `handlers()` to trigger email delivery, you can use `apiRoutes()`. This can be triggered by any selected HTTP request, like submission of FormData through POST, or retrieval of a specified payload with GET. All of the same arguments passed when invoking the `email()` method from a module need to be supplied when using the method in a route.

### Example usage

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    lable: 'contact'
  },
  // additional module code
  apiRoutes(self) {
    return {
      post: {
        async subscribe(req) {
          if (!req.body.email || !req.body.name) {
            throw self.apos.error('invalid');
          }
          const email = self.apos.launder.string(req.body.email);
          const options = {
            from: email,
            to: 'admin@mysite.com',
            subject: 'A new user has subscribed'
          };
          const data = {
            name: self.apos.launder.string(req.body.name)
          };
          try {
            await self.email(req, 'email.html', data, options);
          }
        }
      }
    };
  }
};

```

<template v-slot:caption>
/modules/article/index.js
</template>

</AposCodeBlock>

So, what is going on with this code? First, we are passing our `apiRoutes()` a `post` object. This contains the functions that should be used with a `POST` HTTP request. Each expected route should get a separate function. In this case, we are passing the `subscribe` function. This will monitor for a POST request to `https://www.mysite.com/api/v1/subscribe`. We could give the property a name prefixed with a slash to monitor that exact route - `https://www.mysite.com/subscribe`. See the [reference documentation](../reference/module-api/module-overview.html#naming-routes) for more details.

In the next block of code, we test to ensure that the information needed to construct the `options` and `data` arguments exists in the submission. If it does exist, the values for both those parameters are created with sanitization using `self.apos.launder.string()`. Finally, this information and the email template are passed to the `self.email()` method in a try block. If passing the email to the handler fails, the exception will be caught automatically, logged, and reported as a 500 error. Note that even if the `self.email()` method doesn't throw an error it does not mean that message delivery will be completed successfully. The email could still be rejected en route or by the receiving server.
