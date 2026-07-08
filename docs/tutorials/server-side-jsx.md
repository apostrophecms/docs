---
next: false
prev: false
title: "Building a Weather Widget with Server-Side JSX"
detailHeading: "Tutorial"
url: "/tutorials/server-side-jsx.html"
content: "Build a server-rendered weather widget using ApostropheCMS's JSX template system. Fetch live data with async/await directly in the template, compose the UI from inline sub-components, and drop the result into your existing Nunjucks layout — no Vite config, no widget player, no client-side JavaScript required."
tags:
  topic: "Advanced Techniques"
  type: tutorial
  effort: intermediate
---

# Building a Weather Widget with Server-Side JSX

ApostropheCMS's JSX template system lets you write widget and page templates in JSX instead of Nunjucks. These templates run **on the server** and produce plain HTML — there is no React runtime shipped to the browser, no widget player to write, and no new Vite configuration needed for the template logic itself.

This tutorial focuses on three capabilities that make server-side JSX particularly useful:

1. **Fetching external data directly in the template** using `async`/`await` — no async component wrapper required
2. **Composing markup from inline sub-components** defined in the same file, treating the template as a real JavaScript module
3. **Extending an existing Nunjucks layout from a JSX page template** via `<Extend>`, so you can migrate page by page instead of all at once

If you've read the [browser-side React weather widget tutorial](/tutorials/using-jsx-in-apostrophe.html), you'll recognize the example, it's the same weather widget. The contrast is the point: that tutorial needed changes to the project Vite configuration, a widget player, `createRoot`, and a proxy API route to render the same weather data. This one does the same rendering in a single `.jsx` file with no client JavaScript at all.

::: info When to use each approach
Use **server-side JSX templates** (this tutorial) when your widget renders content that does not need to change after the page loads. The output is static HTML with nothing running in the browser.

Use **browser-side React** when you genuinely need post-load interactivity: user input that triggers re-renders, real-time data updates, client state, and so on. Server-side JSX is not a replacement for React, it is a replacement for Nunjucks.
:::

## What we're building

A "Current Conditions" widget that an editor can place in any area. The editor enters a city and selects a temperature unit in the widget schema. When a page request comes in, the widget template fetches live weather data from the OpenWeatherMap API, formats it using small helper components defined inline, and renders the result as plain HTML, all before the response is sent.

## Prerequisites

- An ApostropheCMS project running a version that supports JSX templates
- An [OpenWeatherMap](https://openweathermap.org/) API key (the free tier is sufficient)
- Comfort reading JSX; this tutorial explains the Apostrophe-specific parts but not JSX syntax itself

## Step 1: Create the widget module

```sh
apos add widget weather-conditions
```

No `--player` flag is needed since there is no browser-side JavaScript for this widget.

Register it in `app.js`:

<AposCodeBlock>

```javascript
import apostrophe from 'apostrophe';

export default apostrophe({
  shortName: 'my-project',
  modules: {
    // ... other modules
    'weather-conditions-widget': {}
  }
});
```

<template v-slot:caption>
app.js
</template>

</AposCodeBlock>

## Step 2: Define the schema fields

Open `modules/weather-conditions-widget/index.js` and add the two fields an editor will configure:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Current Conditions'
  },
  fields: {
    add: {
      city: {
        type: 'string',
        label: 'City',
        required: true,
        def: 'Philadelphia'
      },
      units: {
        type: 'select',
        label: 'Temperature units',
        def: 'metric',
        choices: [
          { label: 'Celsius (°C)', value: 'metric' },
          { label: 'Fahrenheit (°F)', value: 'imperial' },
          { label: 'Kelvin (K)', value: 'standard' }
        ]
      }
    }
  }
};
```

<template v-slot:caption>
modules/weather-conditions-widget/index.js
</template>

</AposCodeBlock>

The module configuration is now complete.

## Step 3: Write the JSX template

Create `modules/weather-conditions-widget/views/widget.jsx`. This is the whole widget with data fetching, sub-components, and final markup in one file.

<AposCodeBlock>

```jsx
// ─── Inline sub-components ────────────────────────────────────────────────────

function StatBlock({ label, value }) {
  return (
    <div class="weather-stat">
      <span class="weather-stat__value">{value}</span>
      <span class="weather-stat__label">{label}</span>
    </div>
  );
}

function ErrorState({ city, message }) {
  return (
    <div class="weather-widget weather-widget--error">
      <p>Could not load weather for <strong>{city}</strong>.</p>
      <p class="weather-widget__error-detail">{message}</p>
    </div>
  );
}

// ─── Main template ────────────────────────────────────────────────────────────

export default async function({ widget }, { apos }) {
  const { city, units = 'metric' } = widget;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  // Fetch live weather data. Because this function is async, we can await
  // here just like any other JavaScript — no async component wrapper needed.
  let weather;
  try {
    const url =
      'https://api.openweathermap.org/data/2.5/weather?' +
      new URLSearchParams({ q: city, units, appid: apiKey });
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`OpenWeatherMap returned ${res.status}`);
    }
    weather = await res.json();
  } catch (err) {
    return <ErrorState city={city} message={err.message} />;
  }

  const unitLabel = { metric: '°C', imperial: '°F', standard: 'K' }[units];
  const temp = Math.round(weather.main.temp);
  const description = weather.weather[0].description;
  const icon = weather.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div class="weather-widget">
      <div class="weather-widget__header">
        <p class="weather-widget__city">
          {weather.name}, {weather.sys.country}
        </p>
        <img
          class="weather-widget__icon"
          src={iconUrl}
          alt=""
          width="80"
          height="80"
        />
      </div>

      <p class="weather-widget__temp">
        {temp}{unitLabel}
        <span class="weather-widget__description">{description}</span>
      </p>

      <div class="weather-widget__stats">
        <StatBlock label="Humidity" value={`${weather.main.humidity}%`} />
        <StatBlock label="Wind" value={`${weather.wind.speed} m/s`} />
        <StatBlock label="Pressure" value={`${weather.main.pressure} hPa`} />
      </div>
    </div>
  );
}
```

<template v-slot:caption>
modules/weather-conditions-widget/views/widget.jsx
</template>

</AposCodeBlock>

Let's step through the main highlights of the code.

**The `async` keyword on the export function** is all it takes to unlock `await` inside a template. There is no async component to register in `index.js` like you would do with a Nunjucks template, no `beforeSend` hook to write, and no data-passing mechanism to thread through. The function fetches data, handles errors, and returns markup — in one place.

**`StatBlock` and `ErrorState` are plain JSX functions** defined at the top of the same file. They work exactly like React function components but they run on the server and produce strings. This inline approach works well for small, single-use partials. For reusable components, you have two alternatives: a standard JavaScript `import` if the component lives in its own file and doesn't need name-based resolution, or Apostrophe's `<Template name="…">` tag if you need cross-module lookup or Nunjucks-parity.

**Class attributes use `class`**, not `className`. Server-side JSX does not target the React DOM, so there is no reason to use the React alias. Write standard HTML attributes.

**The `apos` object is available** as the second argument to the exported template function if you need it — call any module method, run a database query, or use `apos.http` for authenticated internal requests. This template doesn't need it, but the pattern scales. Note that inline sub-components like `StatBlock` and `ErrorState` don't receive it automatically — they only get whatever props you pass them.

## Step 4: Style the widget

The widget has no client-side JavaScript, but it still needs CSS — that part of the build isn't optional just because there's no widget player. Apostrophe's asset pipeline (and Vite on top of it) automatically discovers a `ui/src/index.scss` (or `index.js`) file inside *any* module, so you don't need to touch a central stylesheet or register anything: just create the file and it's picked up on the next build.

<AposCodeBlock>

```scss
.weather-widget {
  max-width: 320px;
  padding: 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e2e2;
  font-family: inherit;
}

.weather-widget--error {
  border-color: #d33;
}

.weather-widget__error-detail {
  color: #a00;
  font-size: 0.875rem;
}

.weather-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.weather-widget__city {
  margin: 0;
  font-size: 1.1rem;
}

.weather-widget__icon {
  flex-shrink: 0;
}

.weather-widget__temp {
  margin: 0.5rem 0 1rem;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.weather-widget__description {
  font-size: 0.9rem;
  font-weight: 400;
  color: #666;
  text-transform: capitalize;
}

.weather-widget__stats {
  display: flex;
  gap: 1rem;
}

.weather-stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.weather-stat__value {
  font-weight: 600;
}

.weather-stat__label {
  font-size: 0.75rem;
  color: #666;
}
```

<template v-slot:caption>
modules/weather-conditions-widget/ui/src/index.scss
</template>

</AposCodeBlock>

Keep spacing in CSS rather than adding whitespace to JSX strings. This keeps content separate from presentation and avoids stray spaces if the layout changes.

Restart or rebuild your assets and the widget should render with clean spacing.

## Step 5: Add the widget to an area

In your page type (or any piece type with an area), add `'weather-conditions': {}` to the widgets list:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/page-type',
  options: { label: 'Default Page' },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {},
            'weather-conditions': {}
          }
        }
      }
    },
    group: {
      basics: { label: 'Basics', fields: ['title', 'main'] }
    }
  }
};
```

<template v-slot:caption>
modules/default-page/index.js
</template>

</AposCodeBlock>

## Step 6: Extend your existing Nunjucks layout (optional but instructive)

If you want to see how JSX and Nunjucks coexist in the same project, convert your default page template to JSX and have it extend `layout.html` using `<Extend>`. This is the recommended migration path: convert individual page templates one at a time while leaving `layout.html` untouched.

Rename `modules/default-page/views/page.html` to `page.jsx` and replace its contents:

<AposCodeBlock>

```jsx
export default function({ page, global }, { Area, Extend }) {
  return (
    <Extend templateName="layout"
      main={
        <main>
          <h1>{page.title}</h1>
          <Area doc={page} name="main" />
        </main>
      }
      bodyClass="default-page"
    />
  );
}
```

<template v-slot:caption>
modules/default-page/views/page.jsx
</template>

</AposCodeBlock>

`<Extend templateName="layout">` maps each JSX prop to the matching `{% block %}` in `layout.html`. So if `layout.html` contains:

```nunjucks
{% block main %}{% endblock %}
{% block bodyClass %}{% endblock %}
```

Those blocks are replaced by the JSX prop values. Everything else in the layout — the outer HTML shell, scripts, stylesheets, Apostrophe's admin UI — stays exactly as it was. No other `page.html` files are affected.

::: info The one hard rule of JSX↔Nunjucks interop
A `.html` Nunjucks template **cannot** `{% extends %}` or `{% include %}` a `.jsx` template — Nunjucks has no way to invoke the JSX renderer.

The reverse works fine: `.jsx` can extend or include `.html`. This is why the bottom-up migration order (convert leaf templates first, keep `layout.html` last) is recommended.
:::

## Step 7: Start the server

Pass your API key as an environment variable:

```sh
OPENWEATHERMAP_API_KEY=your_key_here npm run dev
```

Add the "Current Conditions" widget to a page, set a city and unit preference, and save. The weather data is fetched at request time and rendered into the page HTML — no JavaScript runs in the browser, and the markup is immediately available to search engines and screen readers.

## How this compares to the Nunjucks equivalent

To make the same widget in pure Nunjucks you would need:

- An async component registered in `index.js` to expose the fetched data to the template
- A `components(self)` function and a `fetchWeather` method in `index.js` to actually call the API
- A `views/fetchWeather.html` template file for the component output
- The `{% component %}` tag in `widget.html` to invoke it
- Careful data threading to get the city and units values from widget schema fields into the component

With server-side JSX, the data-loading and rendering logic collapses into a single `async` template function. The async component pattern is still useful — it's the right tool for named, reusable data-loading concerns shared across multiple templates — but for a widget that owns its own data fetching, the inline `async` template is simpler and easier to follow.

## Troubleshooting ESLint

If your project's ESLint configuration predates JSX support, inline components such as `StatBlock` and `ErrorState` may be reported as unused. ESLint's default `no-unused-vars` rule does not recognize JSX usage without the appropriate JSX rule enabled.

Add a `.jsx`-specific override that enables JSX parsing and `jsx-uses-vars`, or disable `no-unused-vars` for these template files. For a one-off fix, you can also add `// eslint-disable-next-line no-unused-vars` above an inline component.

## Going further

**Caching** — This tutorial fetches fresh data on every page request to keep the example focused. In production, cache the response so page rendering does not depend on an external API call for every request. The `apos.cache` API is available in the template via the `apos` argument: `await apos.cache.get('weather', city)` / `await apos.cache.set('weather', city, data, 600)`.

**Error boundaries** — The `ErrorState` component above renders an informative message if the fetch fails. For production, consider logging the error in the `catch` block, before returning `ErrorState`, through `apos.util.error` so it appears in your server logs: `apos.util.error('weather fetch failed', err)`.

**Multiple fetches** — Because the template is an `async` function, you can `await Promise.all([…])` to fetch data from multiple sources in parallel before rendering.

**SEO** — Building the weather widget both front-end and back-end makes a great side-by-side example. Current weather doesn't usually matter for SEO, so either approach works fine here. But when the content you're rendering does matter for search, server-side JSX has a real edge over browser-side React: search engines index it immediately since it's already in the HTML, and some AI chatbot crawlers may not execute client-side JavaScript at all.

**Migrating the rest of the project** — Once all `page.html` files that extend `layout.html` have been converted to `.jsx`, you can rename `layout.html` to `layout.jsx` and use JSX's `children` prop pattern instead of named `{% block %}` overrides. The [`jsx-templates` guide](/guide/jsx-templates.html) covers this top-down migration path in full.
