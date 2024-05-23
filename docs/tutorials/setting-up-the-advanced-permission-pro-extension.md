# How To Set Up the Advanced Permission Pro Extension
The [Advanced Permission](https://apostrophecms.com/extensions/advanced-permission) module is a Pro extension that adds more granular control over content permissions. It provides the ability to create custom groups and assign them to users directly in the admin UI. 

A group is a set of rules that specify how users can create, edit, delete, and publish content, including creating new users and groups. The module provides granular control, allowing admins to give a group *Create*, *Edit*, *Delete*, and *Publish* permissions for each piece type on the site. Those four core permissions can be extended with new custom permissions.

The Advanced Permission extension also enables admins to give groups and individual users granular per-document permissions on specific pages and pieces.

::: info
The name of the npm package of the Advanced Permission module is `@apostrophecms-pro/advanced-permission`.
:::

## Prerequisites

The requirements for setting up the Advanced Permission module are:

- **An Apostrophe 3+ application**: If you don’t already have one, make sure you meet the requirements and then follow the instructions in the [development setup guide](https://docs.apostrophecms.org/guide/setting-up.html).
- **An Apostrophe Pro or Apostrophe Assembly subscription**: To gain access to the Advanced Permission module, you first need to join [Apostrophe Pro](https://apostrophecms.com/pro) or [Apostrophe Assembly](https://apostrophecms.com/assembly). 
## Installing the Advanced Permission Module

After joining Apostrophe Pro or Apostrophe Assembly, you'll be added to the `@apostrophecms-pro` npm organization. This gives you the ability to install the Advanced Permission module in your Apostrophe project. 

::: warning
If you try to add `@apostrophecms-pro/advanced-permission` to your project's dependency before being added to `@apostrophecms-pro`, you’ll get the following error:

`'@apostrophecms-pro/advanced-permission' is not in this registry.`
:::

`@apostrophecms-pro/advanced-permission` is a private npm package. You must authenticate in npm before installing it. The recommended authentication method changes depending on whether you’re in a development or production environment.

**Development Setup**
In a development environment, run the following command to start the npm authentication procedure:

::: raw
npm login
:::

This will produce an output as below:

::: raw
Login at:<br>
https://www.npmjs.com/login?next=/login/cli/<NPM_HASH><br>
Press ENTER to open in the browser...
:::

Press ENTER to open the npm login page in your default browser. Type in your credentials, sign in, and return to the CLI.

After logging in successfully, you’ll receive the following message: 

::: raw
Logged in on https://registry.npmjs.org/`
:::

::: info
To keep the session alive, npm will create a global `.npmrc` configuration file containing your access token in the following line:

::: raw
//registry.npmjs.org/:_authToken=<YOUR_NPM_ACCESS_TOKEN>
:::
:::

`cd` to your project folder and then install the Advanced Permission Pro extension with the command below:

::: raw
npm install @apostrophecms-pro/advanced-permission
:::

npm will use the authenticated URL in `.npmrc` to download the private `@apostrophecms-pro/advanced-permission` package. It will then install it as per usual.

**Production Setup**
In a production environment, authenticate npm commands by setting up a granular token related to the `@apostrophecms-pro` organization. Follow the [official guide](https://docs.npmjs.com/creating-and-viewing-access-tokens#creating-granular-access-tokens-on-the-website) for guidance. 

After setting up an npm granular token, add a `.npmrc` file to the root folder of your Apostrophe project. Initialize it with the following line:

:::raw
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
:::

When launching an npm command, `${NPM_TOKEN}` will be replaced with the value read from the `NPM_TOKEN` environment variable. That URL will be used to retrieve packages from the npm registry as an authenticated user.

::: warning
Adding a local `.npmrc` file will override your global `.npmrc` file npm created on `npm login`. To avoid authorization issues while installing private packages from the `@apostrophecms-pro` npm organization, set the `NPM_TOKEN` environment variable on your local machine when working with a project that has a `.npmrc` defined as above. You can do that in your `.bashrc` file using `EXPORT NPM_TOKEN=``"``<YOUR_PERSONAL_NPM_TOKEN>``"`
:::

In the production server, set the `NPM_TOKEN` env to the value of your npm granular token:

::: raw
export NPM_TOKEN="<YOUR_NPM_GRANULAR_TOKEN>"
:::

When launching `npm install`, the production environment will now be able to install the `"@apostrophecms-pro/doc-template-library"` dependency in `package.json`.

## Enable the Module in Apostrophe

Enable the Advanced Permission extension by adding the following two modules to the `[app.js](https://docs.apostrophecms.org/tutorials/code-organization.html#app-js)` file:

<AposCodeBlock>

```javascript
require('apostrophe')({
  shortName: 'my-project',
  modules: {
    // other modules...

    // enable the Advanced Permission extension
    '@apostrophecms-pro/advanced-permission-group': {},
    '@apostrophecms-pro/advanced-permission': {}
  },
  // remaining configs...
});
```
  <template v-slot:caption>
    app.js
  </template>

</AposCodeBlock>

::: info
To use Advanced Permission in a multisite project, you can add the two modules outlined above to both the `site/index.js` and `dashboard/index.js` files. Adding the modules to the two files will enable the Pro extension for both the dashboard and all individual sites. It’s also possible to enable the extension only for the dashboard on individual sites. Before starting to use the Advanced Permission module in the dashboard, make sure the `privateDashboards` feature is set to `false`. This setting won’t affect individual sites.
:::

On the first run of your project after enabling the Advanced Permission module, some database migrations will automatically occur. These create a group for each role found in existing users and link them to the group corresponding to their `[role](https://docs.apostrophecms.org/guide/users.html#user-roles)` field.

After adding the Advanced Permission extension, a “Groups” item will appear in the top left menu in the admin bar.

## Adding Custom Permissions

In addition to the *Create*, *Edit*, *Delete*, and *Publish* core permissions, new custom permissions can be defined through the `permissions` object in a piece-type `index.js` file for an individual piece or in `[@apostrophecms/page-type/index.js](https://docs.apostrophecms.org/reference/modules/page-type.html#apostrophecms-page-type)` for all pages. You can’t define custom permissions in individual page types.

Much like the `fields` object, the `permissions` object takes an `add` property. This accepts permission properties with objects having the following three properties:

- `label`: A string that describes the new permission to the user. It determines what is shown in the group and per-document permission grids.
- `requires`: An optional string with the name of an existing permission or an object with multiple permissions (e.g., `requires: { $or: [ 'edit', 'create' ] }`). It determines whether the new permission is dependent on any other permission in the grid. For example, `requires: 'publish'` would require the admin to select the "Publish" permission for the document or document type before they could select the new permission.
- `perDoc`: An optional boolean to define whether the new permission should appear in the user and group per-document permission matrices. The default value is `false`.

For example, you can define a custom `decriptionField` permission with:

<AposCodeBlock>

```javascript
module.exports = {
  // ...
  fields: {
    // ...
  },
  // ...
  permissions: {
    add: {
      decriptionField: {
        label: 'Description',
        requires: 'publish',
        perDoc: false
      }
    }
  }
};
```

</AposCodeBlock>

::: tip
By using `permissions` in an Apostrophe core module at the project level, you can add a new custom permission to multiple document types. For example, extending the `[@apostrophecms/piece-type](https://docs.apostrophecms.org/reference/modules/piece-type.html#apostrophecms-piece-type)` module with the `permissions` object would add the custom permissions to all pieces.
:::

`**editPermission**`**: Limiting Access to a Single Field**
After defining a custom permission, you can assign it to a specific field of a piece type by using `editPermission`. This schema field property takes an object with the following two properties:

- `action`: A string with the name of one of the built-in permissions (e.g., `'create'`) or a custom permission.
- `type`: A string with the name of the module that permission is associated with. For core modules, make sure to prefix the module name with `@apostrophecms/` or `@apostrophecms-pro/`.

For example, you can assign the custom `decriptionField` permission to the `description` field of a `product` as below:

<AposCodeBlock>

```javascript
module.exports = {
  // ...
  fields: {
    add: {
      description: {
        type: 'string',
        label: 'Description',
        textarea: true,
        editPermission: {
          action: 'descriptionField', // custom permission
          type: 'product'
        }
      },
      // other fields...
    },
  },
  // ...
};
```

</AposCodeBlock>

Only users who have been granted the *Create* and/or *Modify* permissions as well as the `descriptionField` permission will now be able to edit the description of `product` pieces.

::: info
`perDoc: true` isn’t compatible with the `editPermission` feature. To grant a user per-document custom permission on a given field of a piece, follow this procedure instead:

1. Define a custom permission with `perDoc: false`.
2. Use `editPermission` to assign the custom permission to the desired field of the given piece.
3. Define a group with the selected custom permission for the given piece.
4. Assign the group to the user.
5. Grant the user per-document permission to *Modify* the documents of the given piece.
:::

**A complete example: defining the custom “Pricing” permission**
Suppose your project has a `service` piece. You want to add a custom “Pricing” permission so that only users with this permission can edit the price of services on your site. That can be achieved with the `permissions` and `editPermission` objects in `modules/service/index.js` as below:

<AposCodeBlock>

```javascript
    module.exports = {
      extend: '@apostrophecms/piece-type',
      options: {
        label: 'Service'
      },
      fields: {
        add: {
          title: {
            type: 'string',
            label: 'Title'
          },
          description: {
            type: 'string',
            label: 'Description',
            textarea: true
          },
          price: {
            type: 'float',
            label: 'Price',
            editPermission: {
              action: 'pricingField',
              type: 'service'
            }
          }
        },
        group: {
          basics: {
            label: 'Basics',
            fields: [
              'title',
              'description',
              'price'
            ]
          }
        }
      },
      permissions: {
        add: {
          pricingField: {
            label: 'Pricing'
          }
        }
      }
    };
```

</AposCodeBlock>

**Customized permission checks**
`editPermission` is not the only way to take advantage of custom permissions. You can also verify if a particular user has a custom permission (including per-document permissions) when coding your own routes and methods server-side with the following line:

::: raw
self.apos.permission.can(req, '<custom_permission_name>', doc)
:::

The function returns `true` if the user has the custom permission, `false` otherwise. This approach opens the door to custom use cases involving permission verification.

