# Sending email from your Apostrophe project

Any module in Apostrophe can send email through the [`email()`](/reference/modules/module.html#featured-methods) method and the popular [nodemailer](https://nodemailer.com/) package. However, prior to sending an email using this method, either the `nodemailer` option of the `@apostrophecms/email` module needs to be configured, or another Nodemailer transport needs to be defined as `self.transport` in that same module. The `nodemailer` option will pass any values to the [`createTransport` method](https://nodemailer.com/about/) of the nodemailer app.

Due to the difficulty of ensuring that emails are delivered reliably, we recommend that you utilize a delivery provider. However, if your server is set-up with both [DKIM](https://www.dkim.org/) and [SPF](https://en.wikipedia.org/wiki/Sender_Policy_Framework) ([DMARC](https://en.wikipedia.org/wiki/DMARC)) configured correctly, you can easily use the `sendmail` server app.

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

The `nodemailer` app has three built-in transports - `sendmail`, `SES` - for sending by AWS SES, and `stream` - which is used for testing. You can create your own custom transport using the `nodemailer` [transport API documentation](https://nodemailer.com/plugins/create/#transports), or use one of the many transport plugins that are available. These can either be found on the providers site, or by [searching NPM](https://www.npmjs.com/search?q=nodemailer%20transport). Each transporter will have slightly different parameters configured through an object that is then passed along with the specific transport.

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

The first parameter passed to this method is the page `req`.

The next parameter, `template`, takes the name of a Nunjucks template that will make up the body of the email. This template should be located in the `views` template of the module. The method will pass this template, as well as an automatically generated version, to the `options` parameter of the `nodemailer` app.

The `data` parameter takes an object that will be passed to the Nunjucks template for populating any customized fields. It can be accessed through `data.property` within the template.

The final parameter, `options`, should be an object that contains the information for the email header. This is typically `from`, `to`, and `subject`. Any of these can have defaults set in the `options` of the `@apostrophecms/email` module, just like the transport. Any parameters specified in an individual module will override those set in this manner.

### Example usage

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    lable: 'article',
    pluralLabel: 'articles'
  },
  ...,
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
/modules/article/index.js
</template>

</AposCodeBlock>


<AposCodeBlock>

```django
<h1>A new article has been added to the site</h1>
<p>Here is the blurb</p>
{% data.title %}
{% area data, 'blurb'}
```

<template v-slot:caption>
/modules/article/views/email.html
</template>

</AposCodeBlock>

In this example, we are creating a custom piece type that implements an article. The `handlers()` function is being passed the `afterSave` server event. This event is emitted any time this custom module saves a new article. We are using this signal to send out an email to the site editors. The data coming from the page is passed into the `email.html` template through the `data` argument to add the title and blurb for the editors to review.

::: note
Note that in the Nunjucks template, the area is passed in through the `data` context. It isn't being passed in through the `data.piece` or `data.page` context as it would for a normal Nunjucks template view.
:::

## Triggering email from a route

In addition to using `handlers()` to trigger email delivery, you can use `apiRoutes()`. This can be used to send an email when a user gets redirected to a selected page or sends a POST request, like a form submission. All of the same arguments passed when invoking the `email()` method from a module need to be supplied when using the method in a route. In this case, we need to create options and our data object from our `req.body`.

### Example usage

<AposCodeBlock>

```js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    lable: 'contact'
  },
  ...,
  apiRoutes(self) {
    return {
      post: {
        submit: async function (req) {
          if (!req.body.email || !req.body.name) {
            throw self.apos.error('invalid');
          }
          const email = self.apos.launder(req.body.email);
          const options = {
            from: 'admin@mysite.com',
            to: email,
            subject: 'Thanks for your submission!'
          };
          const data = {
            name: self.apos.launder(req.body.name)
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
    };
  }
};

```

<template v-slot:caption>
/modules/article/index.js
</template>

</AposCodeBlock>

In this case, the `email.html` template is the same as the one used for mail delivery from our `handlers()`.

So, what is going on with this code? First, we are passing our `apiRoutes()` a `post` object. This contains the functions that should be used with a `POST` HTTP request. Each expected routes should get a separate function. In this case, we are passing the function through the `submit` property. This will monitor for a POST request to `https://www.mysite.com/api/v1/submit`. We could give the property a name prefixed with a slash to monitor that exact route - `https://www.mysite.com/submit`. This is useful for when the user is being redirected to a new page. See the [reference documentation](../reference/module-api/module-overview.html#naming-routes) for more details.

In the next block of code, we test to ensure that the information needed to construct the `options` and `data` arguments exists in the submission. If it does exist, the values for both those parameters are created with sanitization using `self.apos.launder()`. Finally, this information and the email template are passed to the `email()` method in a try...catch block.