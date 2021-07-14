# Template tags

Template tags add additional functionality to Apostrophe templates. The tags described below are specific to Apostrophe, though they use the standard Nunjucks syntax: `{% tagName %}`. See standard tags in the [Nunjucks reference](https://mozilla.github.io/nunjucks/templating.html#tags).

If a template tag takes multiple arguments they will be comma-separated. Additional context data may be included after a `with` keyword. See `area` below for examples of both.

| Tag name | Description | Self-closing |
| -------- | ----------- | ------------ |
| [`area`](#area) | Insert a [widget area](/guide/areas-and-widgets.md) | Yes |
| [`component`](#component) | Insert an [async component](/guide/async-components.md) | Yes |
| [`fragment`](#fragment) | Declare a [template fragment](/guide/fragments.md) | No |
| [`render`](#render) | Insert a basic template fragment | Yes |
| [`rendercall`](#rendercall) | Insert a template fragment that includes a `rendercaller` slot | No |
| [`widget`](#widget) | Used in the core area template to render individual widgets | Yes |


## `area`

The `area` tag inserts an area field into the template. The area field [must already be configured](/guide/areas-and-widgets.md#basic-area-configuration) in the page

### Usage

```django
{% area context, areaName with contextOptions %}
```

**Example:**
```django
{% area data.page, 'main' with {
  '@apostrophecms/image': {
    sizes: '(min-width: 600px) 45vw, (min-width: 1140px) 530px'
  }
} %}
```

### Arguments

#### `context`

The area's document context, either a page (`data.page`), piece (`data.piece`), or widget (`data.widget`). The area field must be defined in the field schema for that context. See the [template data](/guide/template-data.md) section for more on each `data` property.

#### `areaName`

The name (a string) of the area field as defined in the field schema.

#### `contextOptions` (optional)

The context options object is added after area tag arguments following the `with` keyword. It is an object with keys matching the names of widget types allowed in that particular area field. Each key is assigned a value that will be passed into the widget template as `data.contextOptions`. See the [image widget guide](/guide/core-widgets.md#image-widget) for an example.

Context options are optional for all core and official Apostrophe widget types.

## component

The `component` tag inserts an asynchronous component into the template. See the [async components guide](/guide/async-components.md) for more on using this feature.

### Usage

```django
{% component 'moduleName:componentName' with data %}
```

**Example:**
```django
{% component 'product:newest' with { max: 3 } %}
```

### Arguments

#### `moduleName:componentName`

The primary argument is a combination of the name of a module name and the name of an async component from that module, separated by a colon. All async components belong to a specific module, though multiple modules may have components with the same name.

#### `data` (optional)

The data argument, following the `with` keyword, is available in the async component template as `data`. It can be any data type, however it is a best practice to make it an object with subproperties so using the values are clearer in templates.

## fragment

The `fragment` tag *declares* a template fragment that will be inserted elsewhere with [`render`](#render) or [`rendercall`](#rendercall). See the [template fragments guide](/guide/fragments.md) for more on using this feature.

This tag must be closed with an `endfragment` tag.

### Usage

```django
{% fragment name(arguments) %}
  {# Fragment markup #}
{% endfragment %}
```

**Examples:**
```django
{% fragment button(text, action, options = {}) %}
  <button class="o-button {{ options.class }}" data-action="{{ action }}">
    {{ text }}
  </button>
{% endfragment %}
```

```django
{% fragment card(data = {}) %}
  <section class="o-card">
    <h2>{{ data.heading }}</h2>
    <div>
      {{ rendercaller() }}
    </div>
  </section>
{% endfragment %}
```

### Arguments

#### `name()`

The fragment name used to reference it in `render` and `rendercall` tags. It should be written as a function with parentheses. The parentheses may include argument names if needed, which would be referenced in variable brackets.

## render

The `render` tag is used to insert a [fragment](/guide/fragments.md) in a template.

### Usage

```django
{% render name(arguments) %}
```

**Example:**
```django
{% render button('Click me', 'send', { class: 'is-blue' }) %}
```

### Arguments

#### `name()`

The name of the fragment to render. It may include a source reference [if the fragment was imported](/guide/fragments.md#importing-fragments-across-files) (e.g., `source.button()`). The parentheses following the name may take arguments to pass into the fragment.

## rendercall

Similar to `render`, `rendercall` tag is used to insert a fragment in a template. `rendercall` is used when [injecting markup into a fragment as well](/guide/fragments.md#inserting-markup-with-rendercall).

This tag must be closed with an `endrendercall` tag.

### Usage

```django
{% rendercall name(arguments) %}
{% endrendercall %}
```

**Example:**
```django
{% rendercall card({ heading: 'Featured image' }) %}
  {% area data.widget, 'photo' %}
{% endrendercall %}

```

### Arguments

#### `name()`

The name of the fragment to render. It may include a source reference [if the fragment was imported](/guide/fragments.md#importing-fragments-across-files) (e.g., `source.card()`). The parentheses following the name may take arguments to pass into the fragment.

## widget

The `widget` template tag will usually not be used in Apostrophe project templates. It is used in the core area template file to render individual widgets.

```django
{% widget widgetObject, widgetOptions with contextOptions %}
```

**Example:**
```django
{# Example from modules/@apostrophecms/area/views/area.html in A3 core #}
{% widget item, widgetOptions with data._with %}
```

### Arguments

#### `widgetObject`

An individual widget object from area field data. Eventually passed into a widget template as `data.widget`.

#### `widgetOptions`

Widget options object as defined in the area configuration. Eventually passed into a widget template as `data.options`.

#### `contextOptions`

Area context options for the widget type as [defined in the template using the area](/guide/areas-and-widgets.md#passing-context-options). Eventually passed into a widget template as `data.contextOptions`.