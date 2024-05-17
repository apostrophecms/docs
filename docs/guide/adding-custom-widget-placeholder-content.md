# Adding placeholders to custom widgets

Custom widgets can also take advantage of non-schema field placeholders by adding code to the widget module in question, preparing the widget template to show the custom placeholder content, and adding the placeholder content into an accessible folder.

## Basic placeholder addition

### Altering the `index.js` file

 In order to add a custom image file, two options should be set within the widget `index.js` file, `placeholder: true` and the `placeholderImage` option with the value set to the file extension of the placeholder content without any `.` prefix.

Next, to supply the URL of the placeholder content, the module should invoke the `determineBestAssetUrl('placeholder')` method in the `init(self)` initialization function.

Even though the option name ends with `Image`, this same method can be used for adding custom video placeholder content that will be uploaded into the module's `public` folder. In contrast, for videos that are hosted externally, you need to add the `placeholder: true` and `placeholderUrl` option with the value set to the URL of the resource. The initialization function in this case can be skipped.

Example for adding a custom image.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Custom Widget',
    placeholder: true,
    placeholderImage: 'png'
  },
  init(self) {
    self.determineBestAssetUrl('placeholder');
  },
  // remainder of the widget code
};
```

<template v-slot:caption>
  modules/custom-widget/index.js
</template>

</AposCodeBlock>

::: info
You can bypass the call to `determineBestAsetUrl()` for your images or videos stored in the `public` folder and instead pass the path to the asset using `placeholderUrl` in place of `placeholderImage`. This is discouraged because errors can be made in this path. It is better to let Apostrophe figure this out for you.
:::

### Altering the widget.html file

The specific alteration of the `widget.html` template will depend on the type of placeholder content being delivered. Irrespective of file type, the template will have access to `data.widget.aposPlaceholder` and `data.manager.options.placeholderUrl` to populate the markup. 

The first, `data.widget.aposPlaceholder`, allows for confirmation that the placeholder should be displayed. This will return `true` when the widget is first added and return `false` once the widget has been edited.

The second, `data.manager.options.placeholderUrl`, will contain the path to the content placeholder asset. If you set the `placeholderImage`, this will either be the path computed by the call to `determineBestAssetUrl()`. Otherwise, it will be the URL passed directly through the `placeholderUrl` option.

This example demonstrates adding an image.

<AposCodeBlock>

``` nunjucks
<section data-custom-widget>
  <h1>Custom Widget</h1>
  {% if data.widget.aposPlaceholder and data.manager.options.placeholderUrl %}
  <img
    src="{{ data.manager.options.placeholderUrl }}"
    alt="{{ __t('nameSpace:imagePlaceholder') }}"
    class="custom-widget-placeholder"
  />
  {% else %}
    <!-- markup displayed after the user edits the widget -->
  {% endif %}
</section>
```
<template v-slot:caption>
  modules/custom-widget/views/widget.html
</template>

</AposCodeBlock>

This example demonstrates adding a self-hosted video.

<AposCodeBlock>

``` nunjucks
<section data-custom-widget>
  <!-- For videos uploaded to the `public` folder -->
  {% if data.widget.aposPlaceholder and data.manager.options.placeholderUrl %}
    <video controls width="250">
      <source src="{{ data.manager.options.placeholderUrl }}" type="video/mp4" />
    </video>
  {% else %}
    <!-- markup displayed after the user edits the widget -->
  {% endif %}
</section>
```

<template v-slot:caption>
  modules/custom-widget/views/widget.html
</template>

</AposCodeBlock>

### Add the placeholder content file
Your placeholder content should be added to the `public` folder of the custom widget. It should be named `placeholder.extension`, where the extension matches the extension passed into the `placeholderImage` option. In the first example above, the file should be `modules/custom-widget/public/placeholder.png`.

## Adding a placeholder with a custom name
In some cases, a widget might need to have more than a single piece of placeholder content, or you might want to give the placeholder content a different name than `placeholder.extension`. In this case, once again you need to modify the main module options, the Nunjuck template, and the contents of the public folder.

### Altering the `index.js` file for custom placeholders

As with the basic addition of a placeholder, for one or more custom placeholders the `placeholder` option should have a value of `true`. Next, the extension of any project-hosted custom placeholders should be passed in an option of `<name>Image`. For example, `customOneImage: 'png`' and `customTwoImage: 'png'`. For any videos that are not uploaded to the project, the URL can be added to an option of `<name>Url`, for example, `videoOneUrl`.

For each self-hosted placeholder, the initialization function should call the `determineBestAssetUrl()` method, with the name of the placeholder passed as an argument. For example `self.determineBestAssetUrl('customOne')` and `self.determineBestAssetUrl('customTwo')`. This is not required for assets using the `<name>Url` option.

If electing to add multiple placeholders to a single page, as soon as the user makes any edits, all placeholder content will be removed from the page because `aposPlaceholder` is only checked once to determine if the widget has been edited.

### Altering the Nunjucks template for custom placeholders

The template will still have access to `data.widget.aposPlaceholder` to determine if the widget has been edited and remove placeholder content. The URL for the placeholder can be accessed using `data.manager.options.<name>Url`. For example, `data.manager.options.customOneUrl` or `data.manager.options.videoOneUrl`. This will be available for each `<name>Image` and `<name>Url` option in the module.

The same conditional block that was used for a single basic placeholder should be used for each custom placeholder added to the template.

### Adding files for custom placeholders

All of the self-hosted custom placeholder assets should be copied to the module's `public` folder. The file names and extensions should match the options passed to the main module file. For the example above, this would be `modules/custom-widget/public/customOne.png` and `modules/custom-widget/public/customTwo.png`.
