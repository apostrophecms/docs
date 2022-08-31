# Writing tests for modules

## Requirements

a running MongoDB server

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

```json
{
  "scripts": {
    "lint": "npm run eslint",
    "eslint": "eslint .",
    "test": "npm run lint && mocha"
  }
}
```

When you call `npm test`, it will lint your files according to [eslint-config-apostrophe](https://www.npmjs.com/package/eslint-config-apostrophe) rules and run the tests using [mocha](https://www.npmjs.com/package/mocha).

### Test folder

You will need a `test/package.json` file referencing the repository URL of your module. Please replace `%module-name%` & `%module-repository-url%` with your module informations.

e.g. for the module `[@apostrophecms/sitemap](https://github.com/apostrophecms/sitemap)` we use 

> `"@apostrophecms/sitemap": "git://github.com/apostrophecms/sitemap.git"`
> 

```json
{
  "/**": "This package.json file is not actually installed.",
  " * ": "Apostrophe requires that all npm modules to be loaded by moog",
  " */": "exist in package.json at project level, which for a test is here",
  "dependencies": {
    "apostrophe": "^3.8.1",
    "%module-name%": "%module-repository-url%"
  }
}
```

You don’t want to commit test files artifacts to git, please add the following to your `.gitignore` file

```gitignore
# Test files
/test/apos-build
/test/public
/test/locales
```

## Writing tests

We start with a single test file `test/index.js`.

As your tests grows, you can break it down into multiple files based on your liking.

Mocha does not play well with arrow-functions, more info at [https://mochajs.org/#arrow-functions](https://mochajs.org/#arrow-functions)


```javascript
// test/index.js
const assert = require('assert');
const t = require('apostrophe/test-lib/util.js');

const getAppConfig = function (options = {}) {
  return {
    '@apostrophecms/express': {
      options: {
        session: { secret: 'supersecret' }
      }
    },
    '%module-name%': {
      options: {
        // pass the required options here
        ...options
      }
    }
  };
};

describe('%module-name%', function () {
  let apos;

  this.timeout(t.timeout);

  after(function () {
    return t.destroy(apos);
  });

  it('should be a property of the apos object', async function () {
    const appConfig = getAppConfig();

    await t.create({
      root: module,
      testModule: true,
      modules: {
        ...appConfig,
        testRunner: {
          handlers(self) {
            return {
              'apostrophe:afterInit': {
                checkModule () {
                  apos = self.apos;
                  assert(self.apos.modules['%module-name%']);
                }
              }
            };
          }
        }
      }
    });
  });
});
```

### Dependencies

[apostrophe/test-lib/util.js](https://github.com/apostrophecms/apostrophe/blob/main/test-lib/util.js) contains some logic to create and destroy apostrophe instances for testing purposes.

It exposes:

- `t.create` to create an apostrophe instance
- `t.destroy` to delete the database when the apostrophe instance is destroyed
- `t.createAdmin` to create an admin user
- `t.getUserJar` to get a cookie jar for the admin user
- `t.timeout` can be set using an environment variable `TEST_TIMEOUT`, e.g.`TEST_TIMEOUT=5000 npm test`

`[testModule](https://github.com/apostrophecms/apostrophe/blob/main/index.js#L468)` will tweak the Apostrophe environment suitably for unit tests

## FAQ

### MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017

Apostrophe assumes by default that there is MongDB server running on `127.0.0.1:27017`.

You can change it by using the environment variable `APOS_MONGODB_URI`. 

```sh
APOS_MONGODB_URI=mongodb://%mongodb-address% npm test
```

### Mocha doesn't seems to work with apostrophe

Starting from Apostrophe 3.26.0, we now support Mocha 9+
([CHANGELOG](https://github.com/apostrophecms/apostrophe/blob/main/CHANGELOG.md#3260-2022-08-03))

If you are using an older version of Apostrophe, please use Mocha 8.

```sh
npm install --save-dev mocha@8
```
