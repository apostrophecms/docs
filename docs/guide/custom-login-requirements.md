# Custom login requirements

Apostrophe's built-in login form handles the typical case where a user logs in with a username and password. And the [@apostrophecms/passport-bridge](https://github.com/apostrophecms/passport-bridge) module handles "single sign-on," in which users log in via a third-party system like Google Workspace, Twitter, Facebook, etc. These two solutions cover most situations. However in some cases developers may wish to extend the built-in login form with additional, custom login requirements. Often these are shipped as npm modules. This guide will explain how to implement such requirements.

The main focus of this guide is on implementing requirements involving custom UI, such as CAPTCHA, two-factor authentication (TOTP), "math problems" and other additional steps at login time. However we'll start by briefly addressing password complexity as it is a common requirement and implemented separately.

## Password complexity rules

While [most password complexity rules are often counterproductive](https://arstechnica.com/information-technology/2013/06/password-complexity-rules-more-annoying-less-effective-than-length-ones/), some organizations may have a business requirement to implement them. Currently the easiest rule to implement, and the most effective one, is to set a minimum length. You can do that by configuring the `@apostrophecms/user` module at project level:

<AposCodeBlock>
  ```javascript
  module.exports = {
    fields: {
      add: {
        // "Re-add" the standard password field
        // to reconfigure it
        password: {
          type: 'password',
          label: 'Password',
          // Minimum number of characters
          min: 10
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/user/index.js
  </template>
</AposCodeBlock>

## The phases of login

Apart from password complexity, most enhancements to the login form involve at least some new UI code. UI components added this way are integrated into the existing login interface. This involves both backend Node.js development and frontend Vue 2 [component](https://vuejs.org/v2/guide/components.html) development.

Apostrophe allows you to add extra login requirements during two different phases of the login process:

* `beforeSubmit`: Requirements in this phase are displayed before the user clicks the Login button. If the requirement has a visible UI, it appears at the bottom of the login form itself. Best used for requirements that have no visible interface but need to monitor user behavior on the form to determine if the user is "real," like [reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3).
* `afterPasswordVerified`: Requirements in this phase are displayed after the form is completed, the Login button is clicked, and the password is verified. Best used for requirements that have a visible interface and which require any special knowledge about the user, such as a Two-Factor Authentication (2FA) challenge. 

## The server side

Each distinct requirement has its own server-side code, which must be added to the `requirements(self)` module configuration function of the `@apostrophecms/login` module at project level, or to an npm module that enhances it via `improve`.

The object returned by `requirements` is similar to that returned by `fields`, in that it has an `add` property, and each individual login requirement is a sub-property of `add`.

Each requirement must have a unique name. The name of each requirement should be CapitalizedInCamelCase, as it doubles as a Vue component name, as explained below.

Each requirement has:

* A `phase` property, which must be `beforeSubmit` or `afterPasswordVerified`.
* A `props()` function, which may be `async` and returns an object. The properties of the returned object become Vue `props` of the Vue component, as explained below. For `beforeSubmit` the `props()` function receives `(req)`, for `afterPasswordVerified` it receives `(req, user)`.  The `req` object allows access to the [current Express request](https://expressjs.com/en/api.html#req), including `req.session` which can be useful for temporary storage not revealed to the browser. The `user` object allows access to the current user even though login is not yet complete.
* A `verify()` function, which may be `async`. For `beforeSubmit` the `verify()` function receives `(req, data)`, for `afterPasswordVerified` it receives `(req, data, user)`. This function is responsible for throwing an exception if the requirement has not been met. Any data provided by the Vue component will be accessible here as the `data` argument.
* For `afterPasswordVerified` requirements only, an optional `askForConfirmation: true` property. If present the corresponding Vue component is responsible for displaying its own success message and emitting a `confirm` event as described later. Otherwise flow proceeds automatically to the next step.

To illustrate, the general structure on the server side is:

<AposCodeBlock>
  ```javascript
  module.exports = {
    requirements(self) {
      return {
        add: {
          RequirementName: {
            phase: 'afterPasswordVerified',
            async props(req, user) {
              return {
                propName: propValue
              };
            },
            async verify(req, data, user) {
              if (!verifyThisCodeIsCorrect(data)) {
                throw self.apos.error('invalid', 'appropriate message');
              }
            }
          }
        }
      };
    }
  };
  ```
  <template v-slot:caption>
    modules/@apostrophecms/login/index.js
  </template>
</AposCodeBlock>

## The browser side

Each distinct requirement also has browser-side code, which is implemented as a Vue component. As explained in the [custom UI guide](custom-ui.md), Vue components intended for the admin UI (including login requirements) must be placed in the `ui/apos/components` subdirectory of a module in the project. For this purpose they are typically placed in the `modules/@apostrophecms/login/ui/apos/components` module at project level, or in an npm module that enhances `@apostrophecms/login` via `improve`.

The developer is responsible for the appearance of the component. For `beforeSubmit` requirements, the component will appear at the bottom of the login form itself. For `afterPasswordVerified` requirements, it will appear on its own, after the Login button is clicked and the password is verified. If there are multiple `afterPasswordVerified` requirements, the user will see them presented one at a time. Transitions are provided by Apostrophe and do not need to be included in login requirement components.

Each component is responsible for:

* Presenting its own UI, if any. Note that `afterPasswordVerified` requirements will appear in isolation, one at a time, while any UI for `beforeSubmit` components will appear simultaneously with the login form.
* Accepting the properties of the object returned by the server-side `props(req)` function as props.
* Emitting a `done` event with a payload providing proof that the requirement has been met. This proof is accessible to the `verify(req)` function on the server side as `req.body.requirements.RequirementName`. In the case of `afterPasswordVerified` requirements, the `done` event should not be emitted until the user has indicated their response is complete in some way.
* `beforeSubmit` requirements may emit a `block` event to cancel a previous `done` event so that the Login button cannot be clicked yet.
* `afterPaswordVerified` requirements are responsible for displaying a custom error message when the `error` Vue prop is set to an error object.
* `afterPasswordVerified` requirements that set the `askForConfirmation` property are also responsible for displaying a custom success message when the `success` Vue prop is true.

While there is no fixed structure for the Vue components, a typical outline looks like:

<AposCodeBlock>
  ```javascript
  <template>
    <fieldset>
      <label>What code did you receive?</label>
      <p>Hint: {{ hint }}</p>
      <input type="text" v-model="value" />
      <button type="button" @click="go">OK</button>
      <p v-if="error">{{ error.message }}</p>
    </fieldset>
  </template>
  <script>
  export default {
    emits: [ 'done' ],
    props: {
      // Comes from the hint property of the
      // object returned by props(req) on the server side
      hint: String,
      error: String
    },
    data() {
      return {
        value: ''
      };
    },
    methods: {
      go() {
        this.$emit('done', this.value);
      }
    }
  };
  </script>
  ```
  <template v-slot:caption>
    modules/@apostrophecms/login/ui/apos/components/RequirementName.vue
  </template>
</AposCodeBlock>

## Implementing `beforeSubmit` requirements

Here is complete server-side code for a simple requirement to solve a math problem when logging in. The UI appears at the bottom of the login form because the password has not been verified yet.

<AposCodeBlock>
  ```javascript
  module.exports = {
    requirements(self) {
      return {
        add: {
          MathProblem: {
            phase: 'beforeSubmit',
            async props(req) {
              if (!(req.session.mathProblem && req.session.mathAnswer)) {
                const x = Math.ceil(Math.random() * 5);
                const y = Math.ceil(Math.random() * 5);
                req.session.mathProblem = `${x} + ${y}`;
                req.session.mathAnswer = x + y;
              }
              return {
                mathProblem: req.session.mathProblem
              };
            },
            async verify(req, data) {
              const answer = self.apos.launder.integer(data);
              if ((!req.session.mathAnswer) || (answer !== req.session.mathAnswer)) {
                throw self.apos.error('invalid', 'math problem incorrect');
              }
            }
          }
        }
      };
    }
  };
  ```
  <template v-slot:caption>
    modules/@apostrophecms/login/index.js
  </template>
</AposCodeBlock>

**What is happening here?**

* The `props()` function of the requirement is invoked before the form appears and returns an object whose properties become props for the custom Vue component shown below. Because it has access to `req`, the [Express request object represnting the current browser request](https://expressjs.com/en/api.html#req), this function can store information about the "challenge" presented by the requirement in `req.session` so that it remains available for verifying the result **without disclosing the right answer** to the browser.
* The `verify()` function of the requirement is invoked when the login form is completed and the user clicks Login. Note that Apostrophe won't allow that to happen until the custom Vue component emits a `done` event, as shown below. `verify()` also has access to `req`, so it can consult `req.session` to see if the response is correct.
* If `verify()` throws an error, the error is displayed and the login form can be submitted again. If no requirements throw an error, login proceeds, to the `afterPasswordVerified` requirements if any.

::: warning
This simple example uses `req.session`, however be aware that if your site uses bearer tokens for headless REST API logins you will need to store temporary information between requests in another way, such as by using the `@apostrophecms/cache` module. Sessions are not available to headless API clients.
:::

To complete the requirement we also need a Vue component on the browser side. As explained in the [custom UI guide](custom-ui.md), Vue components intended for the admin UI (including login requirements) must be placed in the `ui/apos/components` subdirectory of a module in the project, like this:

<AposCodeBlock>
  ```javascript
  <template>
    <fieldset>
      <label>Math Problem: what is {{ mathProblem }}?</label>
      <input type="text" v-model="value" />
      <button type="button" @click="go">OK</button>
    </fieldset>
  </template>
  <script>
  export default {
    emits: [ 'done' ],
    props: {
      mathProblem: String
    },
    data() {
      return {
        value: ''
      };
    },
    methods: {
      go() {
        this.$emit('done', this.value);
      }
    }
  };
  </script>
  <style scoped>
    fieldset {
      color: white;
    }
  </style>
  ```
  <template v-slot:caption>
    modules/@apostrophecms/login/ui/apos/components/MathProblem.vue
  </template>
</AposCodeBlock>

::: info
Don't forget to set the `APOS_DEV` environment variable to `1` when developing admin UI code. Otherwise Apostrophe will not rebuild the admin UI automatically when you make changes to admin UI code, such as login requirement components.

If your project is derived from `starter-kit-essentials` you can type:

```bash
APOS_DEV=1 npm run dev
```

If this is unfamiliar to you we recommend reading [Customizing the user interface](custom-ui.md) first.
:::

**What is happening here?**

This Vue component has only one job: take the props returned by the server-side `props` function, display an appropriate interface, and emit a `done` Vue event with the user's response to the challenge. Everything else is handled for us by Apostrophe.

::: info
Apostrophe looks for a Vue component with the same name as the requirement.
:::

## Implementing `afterPasswordVerified` requirements

Unlike the other phase, requirements displayed in the `afterPasswordVerified` phase can potentially access information about the user when returning props and verifying responses. This is essential for implementing features like 2FA (such as Google Authenticator support) because an additional secret must be stored in Apostrophe's user document.

Below is a simple example of a requirement to solve a weak form of 2FA challenge: entering a code that is assigned the first time the user logs in successfully.

<AposCodeBlock>
  ```javascript
  module.exports = {
    requirements(self) {
      return {
        add: {
          Weak2FA: {
            phase: 'afterPasswordVerified',
            async props(req, user) {
              if (!user.weak2FA) {
                const code = Math.random().toString().replace('.', '').substring(0, 4);
                await self.apos.doc.db.updateOne({
                  _id: user._id
                }, {
                  $set: {
                    weak2FA: code
                  }
                });
                return {
                  code
                };
              }
              // A code is already set, don't return it, that would
              // defeat the purpose of ensuring the user can verify it
            },
            async verify(req, data, user) {
              if (data !== user.weak2FA) {
                throw self.apos.error('invalid', '2FA secret incorrect');
              }
            }
          }
        }
      };
    }
  };
  ```
  <template v-slot:caption>
    modules/@apostrophecms/login/index.js
  </template>
</AposCodeBlock>

**What is happening here?**

This code isn't too different from the `MathProblem` requirement. The most important differences are:

* `props()` and `verify()` both receive `(req, user)`. While the user is not completely logged in yet, we have access to the `user` piece in these functions. This allows us to use a MongoDB `updateOne` operation to `$set` a random 2FA challenge code on the first call to `props()`. Note that we only return the code the first time, as otherwise any script can "sniff" the right answer and defeat the requirement. In this simple example, the user is expected to remember it.

::: info
In a real 2FA system, a new challenge might be texted to the user's device each time — or a stored code much like this one, but longer and more secure, might be used to generate a time-based one-time password (TOTP) as with Google Authenticator.

A real 2FA system requiring a "setup code" like this one would also continue to display it until the user successfully verifies it for the first time, marking the code as confirmed, in case the user doesn't succeed in setting it up on the first try.
:::

Here is the front-end Vue component code for this requirement:

<AposCodeBlock>

  ```javascript
  <template>
    <fieldset>
      <p v-if="code">
        Welcome, first-time user!<br />
        Your 2FA code is {{ code }}<br />
        It will not be displayed again. Make a note of it.
      </p>
      <label>2FA code</label>
      <input type="text" v-model="value" />
      <button type="button" @click="go">OK</button>
    </fieldset>
  </template>
  <script>
  export default {
    emits: [ 'done' ],
    props: {
      code: String
    },
    data() {
      return {
        value: ''
      };
    },
    methods: {
      go() {
        this.$emit('done', this.value);
      }
    }
  };
  </script>
  <style scoped>
    fieldset {
      color: white;
    }
  </style>
  ```
  <template v-slot:caption>
    modules/@apostrophecms/login/ui/apos/components/Weak2FA.vue
  </template>
</AposCodeBlock>

**What is happening here?**

There's not much new here in comparison to the earlier requirement, which you should review as well. However note that the interface adapts to whether we're displaying a new `code` for the first time or not.
