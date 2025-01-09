
## Device breakpoint preview

Apostrophe provides a convenient way to emulate devices, like phones and tablets, making it easy to see how your content will look at different screen sizes.

![Screen shot of breakpoint preview with ecommerce](../images/new-breakpoint-preview.png)
When device preview mode is enabled, you’ll see icons in the admin bar for each of the breakpoints (sizes) that have been set through the `breakpointPreviewMode` of the `@apostrophecms/asset` module. By default, there are three shortcut device breakpoints added. Adding additional breakpoint preview sizes without `shortcut: true` will cause a dropdown menu with all the sizes to appear, in addition to the icons.

![Screen shot of the breakpoint preview dropdown menu](../images/new-breakpoint-menu.png)

Clicking on an icon or making a selection from dropdown menu will cause your page content to display in a container that matches the specific device size, so you can quickly check how the layout and styles respond. The displayed content will be fully editable, so that you can see how any new content is impacted by the current media queries. You can go back to editing in the full browser screen by clicking on the currently selected preview icon or clicking on the `X` to the right of the dropdown.

Custom styles you’ve added with CSS media queries are converted by the `asset` module to container queries. Note that this only works with styles added or imported by stylesheets in the [`ui/src/index.scss` files of each module](/guide/front-end-assets.html#placing-client-side-code), it doesn't work with styles outside the build path, like styles added directly to the template.


Breakpoint preview is enabled by default, but if you want to change the configuration you can pass additional options to the `@apostrophecms/asset` module at project level.
<AposCodeBlock>

```javascript
module.exports = {
  options: {
    breakpointPreviewMode: {
      enable: true,
      screens: {
        desktop: {
          label: 'Desktop',
          width: '1440px',
          height: '900px',
          icon: 'monitor-icon',
          shortcut: true
        },
        tablet: {
          label: 'Tablet',
          width: '1024px',
          height: '768px',
          icon: 'tablet-icon',
          shortcut: true
        },
        mobile: {
          label: 'Mobile',
          width: '414px',
          height: '896px',
          icon: 'cellphone-icon',
          shortcut: true
        },
        ultrawide: {
          label: 'Ultrawide Monitor',
          width: '2560px',
          height: '1440px'
        },
        laptopLarge: {
          label: 'Large Laptop',
          width: '1680px',
          height: '1050px'
        },
        ipadPro: {
          label: 'iPad Pro',
          width: '1366px',
          height: '1024px'
        },
        surfaceDuo: {
          label: 'Surface Duo',
          width: '540px',
          height: '720px'
        },
        galaxyFold: {
          label: 'Galaxy Fold',
          width: '280px',
          height: '653px'
        }
      }
    }
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/asset/index.js
</template>
</AposCodeBlock>

You can learn about all the properties that can be passed to the `breakpointPreviewMode` option on the [`@apostrophecms/asset` reference page](/reference/modules/asset.md#breakpointPreviewMode). The two most critical are `enable` and `screens`. If you pass `enable: false` it will remove the breakpoint preview icons and menu from the adminbar. The `screens` property takes an object where each property is a different breakpoint. Adding the `breakpointPreviewMode` at the project level will override any default values, so you need to pass `enable: true` if you wish to add additional breakpoints.

Each of the individual breakpoint properties in the `screen` object take a `label` that will be displayed to the user when they hover over the icon. The `icon` property supplies the icon that will be displayed if the breakpoint is also given a property of `shortcut: true`. This icon name should be either an icon you can [register in this module](/reference/module-api/module-options.md#icon) or an icon that is [already registered](/reference/module-api/module-overview.md#icons). Finally, each breakpoint needs the `width` and `height`, in pixels, of the container that corresponds to the device being emulated.

---

### Limitations and Differences
While the ApostropheCMS breakpoint preview effectively converts many media queries to container queries, there are some key limitations and differences to be aware of. These limitations stem from fundamental differences between **media queries** (which target the viewport) and **container queries** (which target individual containers).

#### 1. **Unsupported Parameters**
Certain media query conditions are not supported or do not translate well to container queries:

- **Orientation queries**:
  - Parameters like `orientation: landscape` or `orientation: portrait` do not apply to containers, as containers lack inherent orientation.
  - Example of unsupported query:
    ```css
    @media (orientation: landscape) { ... }
    ```
- **Aspect ratio**:
  - Queries based on aspect ratio, such as `min-aspect-ratio` and `max-aspect-ratio`, are not supported. Containers do not inherently track their aspect ratio.
  - Example of unsupported query:
    ```css
    @media (min-aspect-ratio: 16/9) { ... }
    ```

#### 2. Operator and Descriptor Limitations
Some combinations of size-related descriptors and operators may not work reliably:

When `min-width`, `max-width`, `min-height`, or `max-height` are used with `>=` or `<=` operators.

- Example of problematic query:
  ```css
    @media (min-width >= 600px) { ... }
  ```

- Note: These descriptors work when used with standard comparisons:
  ```css
    @media (min-width: 600px) { ... } /* Works fine */
  ```

#### 3. **Behavioral Differences**
Media queries operate on the **viewport size**, whereas container queries respond to the **size of a specific container**. This distinction can lead to subtle differences in layout and behavior:
- **Viewport context**:
  - Media queries are global; they consider the entire screen or browser window. If a layout condition depends on the viewport, such as full-page navigation menus, it might not behave as expected when converted to container queries.
- **Nested containers**:
  - Container queries work within the bounds of their parent container. If a nested container has a different size, the styles applied to its content may differ from expectations.
- **Resizing effects**:
  - Breakpoint preview resizes containers but does not simulate the behavior of the entire viewport. This can impact layouts that rely on viewport-relative units like `vw` and `vh`.

#### 3. **Specificity and Logical Operators**
Complex media query conditions may not translate exactly when converted to container queries:
- **Logical operators**:
  - Combining multiple conditions with `and`, `or`, or `not` might result in unexpected behavior. For example:
    ```css
    @media (min-width: 600px) and (max-width: 800px) { ... }
    ```
    Container queries handle these operators differently and may not correctly apply styles in nested containers.
- **Specificity conflicts** 
  - Container queries may conflict with or override existing media queries or other styles due to CSS specificity rules. This is especially true when mixing global media queries and container-specific styles.

#### 4. **Viewport-relative Units**
- Units like `vw`, `vh`, `vmin`, and `vmax` are **not container-aware**. They continue to calculate values based on the viewport, not the container.
  - Example of affected styles:
    ```css
    @media (min-width: 800px) {
      .example {
        width: 50vw; /* Still based on viewport width */
      }
    }
    ```

#### 5. **Non-standard or Advanced Queries**
Advanced features of media queries, including experimental or non-standard ones, are unlikely to convert successfully:
- **Prefers-color-scheme**: Media queries like `@media (prefers-color-scheme: dark)` are not applicable to containers, as they rely on global user settings.
- **Prefers-reduced-motion**: Similar to color schemes, these queries target user preferences and cannot be container-specific.

---

### Summary of Unsupported or Partially Supported Features
| **Media Query Feature**       | **Support in Container Queries**       |
|-------------------------------|---------------------------------------|
| `orientation` | ❌ Unsupported |
| `aspect-ratio` | ❌ Unsupported |
| Size descriptors with `>=` or `<=` | ⚠️ Not recommended |
| Complex logical conditions | ⚠️ Not recommended |
| Viewport-relative units | ⚠️ Not container-aware |
| User preference queries | ❌ Unsupported (e.g., dark mode) |
| Unit conversion in @media rules | ❌ Skipped |
| Basic size queries | ✅ Supported |
| Print media queries| ✅ Preserved |

---