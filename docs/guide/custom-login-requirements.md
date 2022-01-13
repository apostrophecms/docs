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

## The three phases of login

Apart from password complexity, most enhancements to the login form involve at least some new UI code. Apostrophe allows you to add extra login requirements during three different phases of the login process:

* `beforeSubmit`: right at the bottom of the login form itself. Best used for requirements that have no visible interface but need to monitor user behavior on the form to determine if the user is "real," like [reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3).
* `afterSubmit`: immediately after the form is completed and the Login button is clicked, but before the API request to actually log in. Best used for requirements that **do** have a visible interface and which do not require any special knowledge about the user, such as a visible CAPTCHA image, or a simple math problem. These will be **presented one at a time**, in the space formerly occupied by the login form, after the login button is clicked.
* `afterPasswordVerified`: similar to `afterSubmit`, but requirements in this phase are displayed **after the password has been verified.** Best used for requirements that require special knowledge of the user, such as 2FA (Two-Factor Authentication).

## Implementing `beforeSubmit` and `afterSubmit` requirements

Here is server-side code for a simple requirement to solve a math problem when logging in. This example uses `phase: 'afterSubmit'`, because the requirement has a user interface and our recommendation is to let it appear on its own. One could also use `phase: 'beforeSubmit'` if displaying the math problem at the bottom of the login form is preferred, with no other code changes:

<AposCodeBlock>
  ```javascript
  module.exports = {
    requirements(self) {
      return {
        add: {
          MathProblem: {
            phase: 'afterSubmit',
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
            async verify(req) {
              const answer = self.apos.launder.integer(req.body.requirements.MathProblem);
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

* At project level, custom login requirements must either be delivered as project-level configuration of the `@apostrophecms/login` module (in `modules/@apostrophecms/login` at project level). They may not be spread across several modules at project level, however you **may implement more than one** in the `requirements()` module initialization function of `@apostrophecms/login`. If you wish to ship a single custom login requirement as a public or private npm module for reuse, use the `improve: '@apostrophecms/login'` property so that your module is treated as an extra layer of configuration for `@apostrophecms/login`. Note that `improve` is not available at project level.
* The `props()` function of the requirement is invoked before the form appears and returns an object whose properties become props for the custom Vue component shown below. Because it has access to `req`, this function can store information about the "challenge" presented by the requirement in `req.session`, so it remains available for verifying the result, **without disclosing the right answer** to the browser.
* The `verify()` function of the requirement is invoked when the login form is completed and the user clicks Login. Note that Apostrophe won't allow that to happen until the custom Vue component emits a `done` event, as shown below. `verify()` also has access to `req`, so it can consult `req.session` to see if the response is correct.
* If `verify()` throws an error, the error is displayed and the login form can be submitted again. If no requirements throw an error, login proceeds, first to the `afterSubmit` requirements, and then the `afterPasswordVerified` requirements.

::: warning
This simple example uses `req.session`, however be aware that if your site uses bearer tokens for headless REST API logins you will need to store temporary information between requests in another way, such as by using the `@apostrophecms/cache` module. Sessions are not available to headless API clients.
:::

To complete the requirement we also need a Vue component on the browser side. As explained in the [custom UI guide](../custom-ui.md), Vue components intended for the admin UI (including login requirements) must be placed in the `ui/apos/components` subdirectory of a module in the project, like this:

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
    emits: [ 'done', 'block' ],
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

::: note
Don't forget to add `APOS_DEV=1` at the start of your `npm run dev` command if you are actively developing Apostrophe admin UI components. Otherwise Apostrophe will not rebuild the admin UI every time.
:::

**What is happening here?**

This simple Vue component has only one job: take the props returned by the server-side `props` function, display an appropriate interface, and emit a `done` Vue event with the user's response to the challenge. Everything else is handled for us by Apostrophe.

::: note
Apostrophe looks for a Vue component with the same name as the requirement.
:::

## Implementing `afterPasswordVerified` requirements

Unlike the other two phases, requirements displayed in the `afterPasswordVerified` phase can potentially access information about the user when returning props and verifying responses. This is essential for implementing features like 2FA (such as Google Authenticator support) because an additional secret must be stored in Apostrophe's user document.

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
            async verify(req, user) {
              if (req.body.requirements.Weak2FA !== user.weak2FA) {
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

::: note
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
    emits: [ 'done', 'block' ],
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

There's not much new here in comparison to the earlier requirement. However note that the interface adapts to whether we're displaying a new `code` for the first time or not.
