# Module Extension and Improvement

One core feature of ApostropheCMS is its module system that allows you to customize and enhance functionality without modifying core code. This approach keeps your project maintainable and upgrade-friendly while giving you the flexibility to tailor the CMS to your needs. You will see this information partially repeated in several areas of our documentation including in the [reference section](/reference/module-api/module-overview.html#extend) because we feel it is so important for developers to understand.

## Understanding Module Customization in ApostropheCMS

When working with ApostropheCMS, it's important to understand that customizations should be made through files in your project's `/modules` folder rather than by directly modifying files in the `node_modules` directory.

Modifying files in `node_modules` can create significant problems:
- Changes are lost when you run `npm install` or `npm update`
- Customizations won't carry over when deploying to different environments
- Your changes won't be tracked in version control

Instead, ApostropheCMS is designed to let you customize modules by creating corresponding files in your project's `/modules` folder. This way, your changes are:
- Preserved during updates
- Properly tracked in version control
- Correctly deployed across environments
- Applied consistently throughout your application

## The Three Types of Module Customization

ApostropheCMS provides three distinct ways to customize module behavior, each with its own purpose:

### 1. Module options

**Use for:** Adjusting existing behavior using options that have been specifically built into modules.

The module `options` property provides a way to set values for options that are already designed into the modules. You can only configure options that the module (or code you are adding to it) explicitly supports in this way, not create new ones. You can apply these configuration options in your project level module files or `app.js` when registering the module:

**For core ApostropheCMS modules:**
Create an `index.js` file with a path matching how the core module is organized in the `node_modules` folder.

<AposCodeBlock>

```javascript
export default {
  options: {
    session: {
      // If this still says `undefined`, set a real secret!
      secret: undefined
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/express/index.js
  </template>
</AposCodeBlock>

This example is from our [starter-kit-essentials](https://github.com/apostrophecms/starter-kit-essentials) repository and configures the options for the core `@apostrophecms/express` module.

**For project-specific modules:**
You can just configure the options within the modules main `index.js` file.
<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    // Configuration options
    label: 'Article',
    pluralLabel: 'Articles',
    sort: { publishedAt: -1 }
  }
}
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>


For both core and project-specific modules you can pass an `options` object when registering modules in your `app.js` file:

<AposCodeBlock>

```javascript
export default {
  modules: {
    '@apostrophecms/image': {
      options: {
        // Simple configuration settings
        sizes: '(min-width: 600px) 45vw, (min-width: 1140px) 530px'
      }
    }
  }
}
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

### 2. Module Improvement

**Use for:** Adding or enhancing functionality of an existing module without changing its core purpose.

Module improvement lets you add new methods, event handlers, or other features to an existing module that was installed as a npm package. You do this by creating a file with the same path as the module you want to improve For core Apostrophe modules you place your improvement files inside an `@apostrophecms` folder like they are in the `node_modules` folder, just like setting the `options` configuration:

<AposCodeBlock>

```javascript
export default {
  // No "extend" needed - you're improving a specific module
  handlers(self) {
    return {
      beforeSave: {
        logSaving(req, piece) {
          console.log(`About to save ${piece.title}`);
        }
      }
    };
  },
  methods(self) {
    return {
      // Log piece information for debugging
      logPieceInfo(piece, label = 'Piece Info') {
        console.log(`--- ${label} ---`);
        console.log(`ID: ${piece._id}`);
        console.log(`Title: ${piece.title}`);
        console.log(`Type: ${piece.type}`);
        console.log(`Last Modified: ${piece.updatedAt}`);
      }
    };
  }
}
```
  <template v-slot:caption>
    modules/@apostrophecms/piece-type/index.js
  </template>
</AposCodeBlock>

In this example we are adding a `handler(self)` and a `methods(self)` to the core `@apostrophecms/piece-type` module. This means that any other module in your project that uses `extend` to create a new piece type will have access to that handler and method.

### 3. Module Extension

**Use for:** Creating a new module that inherits behavior from an existing one.

Module extension allows you to create entirely new modules that utilize the base functionality of existing ones. You use the `extend` property to specify which module you're building upon:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article',
    pluralLabel: 'Articles'
  },
  fields: {
    add: {
      subtitle: {
        type: 'string',
        label: 'Subtitle'
      },
      featuredImage: {
        type: 'relationship',
        withType: '@apostrophecms/image',
        label: 'Featured Image',
        max: 1
      }
    },
    group: {
      basics: {
        label: 'Basic Information',
        fields: ['title', 'subtitle', 'featuredImage']
      }
    }
  }
}
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

In this example we created a new type of piece, an article, that extends the core `@apostrophecms/piece-type` module. This means that new articles will be created and edited in the piece manager and can easily be displayed on a piece type page.


## How Module Customization Works Behind the Scenes

### Module Configuration

When you configure a module, Apostrophe applies those settings to the module definition before initializing it. Only options that have been programmed into the module will have an effect.

### Module Improvement

When you create a file at `modules/@apostrophecms/piece-type/index.js`, Apostrophe:

1. Loads the core module definition from `node_modules`
2. Merges your project-level improvements with the core module
3. Uses the enhanced module definition for all operations

Improvements affect both the base module and any modules that extend it.

### Module Extension

When you extend a module with `extend: '@apostrophecms/piece-type'`, Apostrophe:

1. Creates a new module type based on the parent module
2. Applies any improvements to the parent module first
3. Applies your extension-specific configuration
4. Initializes the new module type with the combined definition

This cascade ensures that improvements to base modules flow through to all modules that extend them.

## Customizing Third-Party Modules and Packages

The same customization patterns apply to all Apostrophe modules, including:
- Core modules bundled with ApostropheCMS
- Official packages from the Apostrophe team (like `@apostrophecms/blog`)
- Third-party modules from other developers
- Your own custom modules installed via npm

When you install any module through npm, you should **never modify the files in `node_modules`**. Instead, use project-level improvements and extensions just as you would with core modules.

### Example: Improving a Third-Party Module

Say you've installed a module called `organization-chart` (a hypothetical Apostrophe module for displaying org charts):

### Improving the Module

You might want to improve the base module to add functionality that will apply to all uses of it:

<AposCodeBlock>

```javascript
export default {
  // No "extend" property - this improves the original module
  methods(self) {
    return {
      // Add a new utility method to the original module
      sortEmployeesByDepartment(employees) {
        return employees.sort((a, b) => a.department.localeCompare(b.department));
      }
    }
  },
  handlers(self) {
    return {
      // Add an event handler to the original module
      beforeSave: {
        validateReportingStructure(req, piece) {
          // Custom validation logic
        }
      }
    }
  }
}
```
  <template v-slot:caption>
    modules/organization-chart/index.js
  </template>
</AposCodeBlock>

### Extending the Module

At the same time, you could extend the module to create specialized versions of it:

<AposCodeBlock>

```javascript
export default {
  extend: 'organization-chart',
  options: {
    label: 'Executive Team Chart',
    pluralLabel: 'Executive Team Charts'
  },
  fields: {
    add: {
      fiscalYear: {
        type: 'select',
        label: 'Fiscal Year',
        choices: [
          { label: '2023', value: '2023' },
          { label: '2024', value: '2024' },
          { label: '2025', value: '2025' }
        ]
      }
    }
  }
}
```
  <template v-slot:caption>
    modules/executive-team-chart/index.js
  </template>
</AposCodeBlock>

### How This Works Together

When Apostrophe initializes your project:

1. It applies your improvements to the `organization-chart` module first
2. Then it creates the new `executive-team-chart` module type that extends the (now improved) `organization-chart` module
3. The `executive-team-chart` module inherits all the functionality from the improved base module, plus gets its own specialized fields and behavior

This powerful pattern lets you:
1. Add global improvements that affect both the module and those that extend it
2. Create specialized versions of modules for specific purposes
3. Maintain clean separation of concerns in your code

It's particularly useful when you want to both enhance a module's core functionality and create specialized variants of it for different use cases in your project.

## The `improve` Property in npm Packages

While project-level module improvements are made by creating matching file paths in your `/modules` directory, npm packages that aim to improve core ApostropheCMS modules use a different approach: the `improve` property. Much like the `extend` property, the specific module being improved is passed as the value.

<AposCodeBlock>

```javascript
module.exports = {
  improve: '@apostrophecms/rich-text-widget',
  options: {
    typoConfig: {}
  },
  extendMethods(self) {
    return {
      // We need to extend this method so that our configuration data is available
      getBrowserData(_super, req) {
        const initialData = _super(req);
        const finalData = {
          ...initialData,
          aposTypoConfig: self.options.typoConfig
        }
        return finalData;
      }
    }
  }
};
```
  <template v-slot:caption>
    rich-text-example-extensions/modules/@apostrophecms/typography/index.js
  </template>
</AposCodeBlock>

This example is from the [rich-text-example-extensions](https://github.com/apostrophecms/rich-text-example-extensions) repository that can be installed into a project using `npm install @apostrophecms/rich-text-example-extensions`. It uses the `improve` property to target the core `@apostrophecms/rich-text-widget` module and add additional functionality.

> [!IMPORTANT]
> The `improve` property should never be used in a project-level module, only in modules installed as packages in the `node_modules` folder.

## Conclusion

Understanding the difference between configuration options, improvement, and extension in ApostropheCMS will help you customize the CMS effectively while maintaining a clean, maintainable codebase.

To summarize:
- **Configuration** adjusts existing behavior using predefined options
- **Improvement** enhances existing modules with new capabilities
- **Extension** creates new module types based on existing ones

These patterns apply to all modules, whether they're core modules, official packages, third-party modules, or your own custom modules installed via npm.

By choosing the right approach for each customization need and always making changes at the project level rather than in `node_modules`, you'll build robust ApostropheCMS projects that remain maintainable as your needs evolve and as the platform is updated.