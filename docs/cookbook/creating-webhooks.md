# Creating webhooks

Webhooks allow applications to communicate with each other in real time by sending HTTP requests when certain events or triggers occur. This can allow your site to automatically send notifications when events occur, like publishing a document, or receive updates, for example, from payment portals. This short recipe will demonstrate how to set up webhooks in your Apostrophe project.

## Sending information to a 3rd party webhook

There are a wide variety of applications and services that expose webhooks for the transfer of information from your site. For example, you can post messages in specific Slack or Discord channels using a webhook. Apostrophe [handlers](/reference/module-api/module-overview.html#handlers-self) are able to capture a number of built-in [server-side events](../reference/server-events.md) and you also have the option of adding custom events emitted from your own modules. These events are perfect for automatically triggering the delivery of data about an event from your site to a 3rd party.

<AposCodeBlock>

```javascript
handlers(self) {
  return {
    'afterPublish': {
      async sendWebhook(req, data) {
        // data sent by the afterPublish event includes the document data 
        // and whether it is being published for the first time
        // https://v3.docs.apostrophecms.org/reference/server-events.html#afterpublish
        if (!data.firstTime) {
          return;
        }
        // The url added here should be changed to the desired endpoint
        const url = 'https://enr061vpkj3d.x.pipedream.net/';
        const options = {
          headers: {
            // Header information will depend on the endpoint you are sending to
            'Content-Type': 'application/json'
          },
          body: {
            docTitle: data.published.title,
            docId: data.published._id
          }
        };
        const response = await self.apos.http.post(url, options);
        // the response will depend on the endpoint you are sending to
        // Potentially add code to handle errors coming back
        // like retrying if the response isn't successful
      }
    }
  };
}
```
  <template v-slot:caption>
    /modules/article/index.js
    </template>

</AposCodeBlock>

In this block of code, we are using the `handlers(self)` module configuration function. We could use any server event, but in this case we are using the `afterPublication` event that is emitted by our custom article piece-type module. This server event delivers two parameters, `req` and `data`. The `data` parameter contains information about the document being published including the content and whether this is the first time it is being published. In this case, we are adding an early return if this isn't the first time the document is being published.

The next section of code is involved in setting up the HTTP `POST` request and will depend heavily on what the desired endpoint requires, and what content you want sent to the endpoint. In this example, we are adding the `title` and `_id`.

Finally, we are using the `post` method of the [`@apostrophecms/http` module documentation](https://v3.docs.apostrophecms.org/reference/modules/http.html#async-post-url-options) to actually send our data to the endpoint. Depending on the endpoint the response might be as simple as a `200` success or a `400` failed response, or a response containing additional data. That response can be handled to retry a failed response or in some way log the returned data.

## Setting up a webhook endpoint

Your project may require a webhook endpoint for interfacing with a payment or subscription service. This can be accomplished by using the Apostrophe [`routes(self)` module configuration](https://v3.docs.apostrophecms.org/reference/module-api/module-overview.html#routes-self) function. This allows you to easily set up an endpoint for any HTTP request method.

<AposCodeBlock>

```javascript
options: {
  csrfExceptions: [ '/webhooks' ]
},
apiRoutes(self) {
  return {
    post: {
      // change to match the desired endpoint URL
      '/webhooks': async function(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return {
            status: 403,
            message: 'FORBIDDEN'
          };
        }
        // Implement your own authorization check here
        // to make sure the data is from a genuine source
        // Each webhook provider likely has guidance and 
        // a specific type of authorization

        // Use data passed by webhook to update database
        // or provide some other type of functionality
        const webhookData = req.body;
        addNewSubscriber(webhookData);

        // Most webhook providers expect a 200 response
        // or they will attempt to resend the webhook
        return {
          status: 200,
          message: 'Success'
        };
      }
    }
  };
}
```
  <template v-slot:caption>
    /modules/subscription/index.js
  </template>

</AposCodeBlock>

In this code example, the webhook is being implemented using the `apiRoutes(self)` module configuration function. We are exposing a `POST` route, the one that is most typically used by webhook providers, by passing an object with our function to the `post` property. The function is named for the route it is exposing. In this case, it starts with a forward slash (`/`), indicating that this is relative to the project site itself, e.g. `https://www.my-project.com/webhooks`. You can read about the methods in the [`@apostrophecms/http` module documentation](https://v3.docs.apostrophecms.org/reference/modules/http.html#async-post-url-options).

Within the function, we first are checking for the presence of an authorization header. If it isn't found we return an object with the status and a message. This will be sent back to the webhook originator, and what needs to be returned will depend on the service. Once authentication is complete you can pass the data off for sanitization and use.

Finally, most providers require the return of some type of success message. Otherwise, they will attempt to resend the webhook.

Lastly, since this page will be accessed using a POST method from an outside source, we have to add the route to the `csrfExceptions` option array to bypass CSRF protection.