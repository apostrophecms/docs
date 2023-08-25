---
prev: false
next: false
---
# Creating webhooks

Webhooks allow applications to communicate with each other in real time by sending HTTP requests when certain events or triggers occur. This can allow your site to automatically send notifications when publishing a document or receive updates from payment portals, for example. This short recipe will demonstrate how to set up webhooks in your Apostrophe project.

## Outgoing webhooks

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
        const payload = {
          text: `Article ${data.published.title} was published.`
        };
        await self.apos.http.post('https://slack-webhook-url-here', {
          body: {
            text: `Article ${data.published.title} was published.`
        }
        });
      }
    }
  };
}
```
  <template v-slot:caption>
    /modules/article/index.js
    </template>

</AposCodeBlock>

In this block of code, we are using the `handlers(self)` module configuration function. We could use any server event, but in this case, we are using the `afterPublication` event that is emitted by our custom article piece-type module. This server event delivers two parameters, `req` and `data`. The `data` parameter contains information about the document being published including the content and whether this is the first time it is being published. In this case, we are adding an early return if this isn't the first time the document is being published.

The next section of code is involved in setting up the HTTP `POST` request using the `post` method of the [`@apostrophecms/http` module](https://v3.docs.apostrophecms.org/reference/modules/http.html#async-post-url-options) to send our data to the endpoint. Depending on the endpoint, the returned response might be as simple as a `200` success or a `400` failed response, or might contain additional data. You can wrap your `POST` in a try-catch block to catch any exceptions. You can then decide whether to throw an error or notify the user of a problem with `self.apos.notify(req, 'We were unable to send a notification to Slack.');`

## Incoming webhooks

Your project may require a webhook endpoint to receive incoming notices from services, like a payment portal or subscription manager. Much like Slack can add a message to a channel when it receives data from your site on the correct endpoint, your site can be set up to make changes to the database or perform other tasks when data is received at a specific endpoint. This can be accomplished by using the Apostrophe [`apiRoutes(self)` module configuration](https://v3.docs.apostrophecms.org/reference/module-api/module-overview.html#apiroutes-self) function. This allows you to easily set up an endpoint for any HTTP request method.

<AposCodeBlock>

```javascript
options: {
  csrfExceptions: [ '/webhooks' ]
},
apiRoutes(self) {
  return {
    post: {
      // change function name to match the desired endpoint URL
      '/webhooks': async function(req) {
        
        // Implement your own authorization check here
        // to make sure the data is from a genuine source
        // Each webhook provider likely has guidance and 
        // a specific type of authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          throw self.apos.error('forbidden');
        }

        // Use data passed by webhook to update database
        // or provide some other type of functionality
        const webhookData = req.body;
        async addNewSubscriber(webhookData);

        // Most webhook providers expect a 200 response
        // or they will attempt to resend the webhook
        return {};
      }
    }
  };
}
```
  <template v-slot:caption>
    /modules/subscription/index.js
  </template>

</AposCodeBlock>

In this code example, the webhook is being implemented using the `apiRoutes(self)` module configuration function. We are exposing a `POST` route, the one that is most typically used by webhook providers, by passing an object with our function to the `post` property. The function is named for the route it is exposing. In this case, it starts with a forward slash (`/`), indicating that this is relative to the project site itself, e.g. `https://www.my-project.com/webhooks`.

Within the function, we first are checking for the presence of an authorization header. If it isn't found we throw an error with the string 'forbidden'. This is mapped to a `403` error and returns it to the webhook originator. There are a number of other error strings detailed in the reference documentation for [`apiRoutes`](https://v3.docs.apostrophecms.org/reference/module-api/module-overview.html#returning-error-codes). Once authentication is complete you can pass the data off for sanitization and use.

Finally, most providers require the return of some type of success message, otherwise, they will attempt to resend the webhook. If no information needs to be supplied you can simply return an empty object. Alternatively, you can return an object that contains information to include in the body of the response. The header will still indicate a response of `200/OK`.

Lastly, since this page will be accessed using a POST method from an outside source, we have to add the route to the `csrfExceptions` option array to bypass CSRF protection.