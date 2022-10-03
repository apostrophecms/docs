# Writing tests for modules

Tests are useful to guarantee that the requirements of your application are met over time.
They also ensure that code changes don't generate breaking artifacts.

Automating tests for expected scenarios saves significant time over having to mock those same scenarios manually each
time there are code changes.

There are many kinds of tests:

- [unit testing](https://en.wikipedia.org/wiki/Unit_testing) where we test a single part of the application, a single
    module or file commonly referred as a unit
- [integration testing](https://en.wikipedia.org/wiki/Integration_testing) where we test multiple parts of an
    application working together as a group
- [system testing](https://en.wikipedia.org/wiki/System_testing), sometimes referred as [end-to-end testing](https://www.indeed.com/career-advice/career-development/end-to-end-testing) where we test the entire application
- and many more

This documentation focuses on how to test Apostrophe modules, not Apostrophe itself using integration testing.

Modules should be stand-alone npm packages. They need to be hosted somewhere that our testing can access. For this
example, we are hosting this module in a github repo. We will use a fictitious module named `article` to illustrate how to
write tests for modules.

## Requirements

- A running MongoDB server

## Setup

This setup assumes you will use the following packages

- [apostrophe](https://www.npmjs.com/package/apostrophe): *ApostropheCMS is a full-featured, open source CMS built with Node.js that seeks to empower organizations by combining in-context editing and headless architecture in a full-stack JS environment*
- [eslint](https://www.npmjs.com/package/eslint): *ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code*
- [eslint-config-apostrophe](https://www.npmjs.com/package/eslint-config-apostrophe): *An ESLint configuration for ApostropheCMS core and officials modules*
- [mocha](https://www.npmjs.com/package/mocha): *Simple, flexible, fun JavaScript test framework for Node.js & The Browser*
```sh
npm install --save-dev apostrophe eslint eslint-config-apostrophe mocha
```

You will need to add some new scripts to your `package.json`.

<AposCodeBlock>
  ```json
  {
    "name": "article",
    "version": "1.0.0",
    "description": "A fictitious Apostrophe module",
    "main": "index.js",
    "scripts": {
      "lint": "npm run eslint",
      "eslint": "eslint .",
      "test": "npm run lint && mocha"
    },
    "keywords": [],
    "author": "",
    "license": "ISC"
  }
  ```
  <template v-slot:caption>
    package.json
  </template>
</AposCodeBlock>

Add the following to `.eslintrc.json` to tell eslint to use ApostropheCMS ESLint confiuration.

<AposCodeBlock>
  ```json
  {
    "extends": [ "apostrophe" ]
  }
  ```
  <template v-slot:caption>
    .eslintrc.json
  </template>
</AposCodeBlock>

When you call `npm test`, it will lint your files according to [eslint-config-apostrophe](https://www.npmjs.com/package/eslint-config-apostrophe) rules and run the tests using [mocha](https://www.npmjs.com/package/mocha).

### Test folder

You will need a `test/package.json` file referencing the repository URL of your module. Please replace `article` & `%article-repository-url%` with your module informations.

e.g. for the module [@apostrophecms/login-hcaptcha](https://github.com/apostrophecms/login-hcaptcha) we use 

> `"@apostrophecms/login-hcaptcha": "git://github.com/apostrophecms/login-hcaptcha.git"`
> 

<AposCodeBlock>
  ```json
  {
    "/**": "This package.json file is not actually installed.",
    " * ": "Apostrophe requires that all npm modules to be loaded by moog",
    " */": "exist in package.json at project level, which for a test is here",
    "dependencies": {
      "apostrophe": "^3.26.0",
      "article": "%article-repository-url%"
    }
  }
  ```
  <template v-slot:caption>
    test/package.json
  </template>
</AposCodeBlock>

You don’t want to commit test files artifacts to git, please add the following to your `.gitignore` file

<AposCodeBlock>
  ```gitignore
  # Test files
  /test/apos-build
  /test/public
  /test/locales
  ```
  <template v-slot:caption>
    .gitignore
  </template>
</AposCodeBlock>

## Writing tests

We will start with a single test file `test/index.js`.

As your test grows, you can break them down into multiple files based on your liking.

Mocha does not play well with arrow-functions, more info at [https://mochajs.org/#arrow-functions](https://mochajs.org/#arrow-functions)

<AposCodeBlock>
  ```javascript
  // We use assert strict assertion mode, value and type must be the same when doing a comparison, .i.e. ===
  // https://nodejs.org/api/assert.html#strict-assertion-mode
  const assert = require('assert').strict;
  const t = require('apostrophe/test-lib/util.js');

  // getAppConfig is used to set options for Apostrophe and the module you want to test
  const getAppConfig = function (options = {}) {
    return {
      article: {
        options: {
          // Pass the required options here
          // In the example below, we will test for the presence of a `custom` option
          // If your module doesn't have any options, please skip the `options` attribute
          ...options,
          custom: true
        }
      }
    };
  };

  // describe and it functions are provided by mocha
  // Usually use to "structure" the test file
  // They don't have a strict meaning from mocha's point of view

  // describe is a test suite and used to group tests
  // You can have as many describe as you want in a test file
  // describe can be nested
  describe('article', function () {
    let apos;

    this.timeout(t.timeout);

    // before is a hook and will run once before every describe/it found below 
    before(async function () {
      apos = await t.create({
        shortName: 'article',
        testModule: true,
        modules: getAppConfig()
      });
    });

    // after is a hook and will run once after every describe/it found below 
    after(async function () {
      await t.destroy(apos);
    });

    // it is used for an individual test case, e.g. testing a single function
    it('should have module options', function () {
      const actual = apos.modules.article.options;
      const expected = {
        apos,
        custom: true
      };

      assert.deepEqual(actual, expected);
    });
  });
  ```
  <template v-slot:caption>
    test/index.js
  </template>
</AposCodeBlock>

### Dependencies

[apostrophe/test-lib/util.js](https://github.com/apostrophecms/apostrophe/blob/main/test-lib/util.js) contains some logic to create and destroy apostrophe instances for testing purposes.

It exposes:

- `t.create` to create an apostrophe instance
- `t.destroy` to delete the database when the apostrophe instance is destroyed
- `t.createAdmin` to create an admin user
- `t.getUserJar` to get a cookie jar for the admin user
- `t.timeout` can be set using an environment variable `TEST_TIMEOUT`, e.g.`TEST_TIMEOUT=5000 npm test`

[testModule](https://github.com/apostrophecms/apostrophe/blob/main/index.js#L468) will tweak the Apostrophe environment suitably for unit tests (i.e. set default modules options, check test files location, build module paths)

- `describe` & `it` functions are provided by mocha, more info at [BDD](https://mochajs.org/#bdd)

### Output

By running the test using the example `@apostrophecms/login-hcaptcha` module details and the `npm test` command, you should see the output below

```
$ npm test

> @apostrophecms/login-hcaptcha@1.0.0 test
> npm run lint && mocha


> @apostrophecms/login-hcaptcha@1.0.0 lint
> npm run eslint


> @apostrophecms/login-hcaptcha@1.0.1 eslint
> eslint .



  Apostrophe Login hCAPTCHA
Listening at http://127.0.0.1:7780
    ✓ should have module options


  1 passing (909ms)
```

### What's next?

You can now test the additional methods you've provided with your module on [self](https://v3.docs.apostrophecms.org/reference/module-api/module-overview.html#methods-self).

You can use any existing apostrophe modules with a `test` folder as a reference.

You'll find below a non exhaustive list of such modules:

- [@apostrophecms/form](https://github.com/apostrophecms/form/blob/main/test/test.js)
- [@apostrophecms/login-hcaptcha](https://github.com/apostrophecms/login-hcaptcha/blob/main/test/test.js)
- [@apostrophecms/svg-sprite](https://github.com/apostrophecms/svg-sprite/blob/main/test/test.js)
- [@apostrophecms/scheduled-publishing](https://github.com/apostrophecms/scheduled-publishing/blob/main/test/test.js)
- [@apostrophecms/sitemap](https://github.com/apostrophecms/sitemap/blob/main/test/test.js)

## FAQ

### MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017

Apostrophe assumes by default that there is MongDB server running on `127.0.0.1:27017`.

You can change it by using the environment variable `APOS_MONGODB_URI`. 

```sh
APOS_MONGODB_URI=mongodb://%mongodb-address% npm test
```

### Mocha doesn't seems to work with apostrophe

Starting from Apostrophe 3.26.0, we now support Mocha 9+
([Apostrophe 3.26.0 Changelog](https://github.com/apostrophecms/apostrophe/blob/main/CHANGELOG.md#3260-2022-08-03))

If you are using an older version of Apostrophe, please use Mocha 8.

```sh
npm install --save-dev mocha@8
```
