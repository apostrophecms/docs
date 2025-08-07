# Users and user roles

A **"user"** in Apostrophe is an account (usually for a human or benevolent robot) that can be used to log into the application. Beyond that, users get specific sets of permissions based on the **role** they are assigned.

## Adding new users

If you want to do anything with your Apostrophe website, you will need users. There are two main ways to add them: using the command line task or through the user interface.

### Adding users with the CLI task

The CLI task for adding users is primarily useful to add the very first admin user. The command is:

```bash
node app @apostrophecms/user:add my-user admin
```

The two final arguments passed to the task are, in order, the new username (`my-user`) and the [user role](#user-roles) (`admin`).

### Adding users through the UI

Once you have that first user, you have the option to add new ones through the user interface. The first and most important thing to know is that **only admin users can create and manage other users.** The admin user created with the CLI command above will have this ability.

Open the users manager interface by clicking the "Users" button in the admin menu.

![The admin menu at the top of the browser window with the Users button highlighted](/images/users-admin-bar.png)

When the manager opens, click the "New User" button to open a fresh content editor modal. Populate the required fields, including the user's "Display Name," [role](#user-roles), username, and password. By default, if a site is configured for [multiple locales](/reference/modules/i18n.html), and a user is viewing the site in a particular locale, then the user interface will also be displayed in that locale whenever possible. However, if the `adminLocales` option of the i18n module is set to an array of locales, then it becomes possible to 'lock' the admin UI to a particular language on a per-user basis. Users can change this setting themselves if the Personal Settings module is configured. If the [`defaultAdminLocale` option](/reference/modules/i18n.html) of the i18n module is configured, the admin UI language will default to that language.

![A user editor modal with values filled in for our user, "Sam Wilson"](/images/users-editor.png)

## User roles

Users are assigned one of four **user roles**. Each role is assigned a set of permissions that cover typical content editing, review, and administration duties.

| User role | What can they do? |
| --------- | ----------------- |
| **Guest** | Guest users can log into the website and view content with visibility set to "Login required." They cannot edit any content or view unpublished content. |
| **Contributor** | Contributors may create and edit content, including the global doc. They cannot upload files (i.e., images, PDFs) or take any action on users. |
| **Editor** | Editors have all the permissions of contributors. They can also *publish* content and upload files. They cannot take any action on users. |
| **Admin** | Administrators have permissions to create, edit, archive, and publish any content. They are the only role that may create, update, or archive users. At the time of writing, an admin account is needed to reset passwords through the user interface. |

::: info
We can also change passwords through the command line task below. The `username` argument will be the username of the account you are updating.

``` bash
node app @apostrophecms/user:change-password username
```
:::

You can [read more about permissions and content workflows](/guide/permissions-and-workflow.md) to see how these roles work together in practice.

## Logging into an Apostrophe website

Users can log into Apostrophe websites at the `/login` URL path for the website. If the website base URL (homepage) is `https://example.rocks`, the login page will be `https://example.rocks/login`.

![The Apostrophe login page with username and password fields](/images/users-login.png)

::: tip
Sometimes certain content should never be fully public. You may have subscribers who get special access or information that only employees should see. The "Guest" role can be used for that.

Require login access to view specific pages or pieces using the visibility field, labeled **"Who can view this?"** This field is found in the "Permissions" editor tab by default.

![A page editor interface showing the permission tab and "who can view this" field](/images/users-visibility.png)
:::
