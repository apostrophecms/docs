# Using JSX in Apostrophe

In modern web development, tools and technologies evolve rapidly, and so do the demands of web applications. ApostropheCMS offers a robust and flexible platform for building content-rich websites, it comes with a powerful built-in Webpack build system that caters to most development needs out of the box. This system streamlines the process of managing assets, optimizing performance, and ensuring a smooth developer experience. However, there are times when you may want to extend its capabilities by customizing the build process. One common scenario is integrating React components into your ApostropheCMS project, which involves customizing Webpack to support JSX (JavaScript XML). By leveraging JSX and React, you can enhance the interactivity and maintainability of your front-end components, providing a richer user experience while still taking advantage of the features offered by ApostropheCMS.

### Why Customize Your Webpack Build?

Webpack is a powerful module bundler that compiles JavaScript modules into a single file or multiple files that the browser can understand. Customizing your Webpack configuration can offer several benefits:

1. **Enhanced Development Workflow**: Customizing Webpack allows you to integrate modern JavaScript frameworks like React, enabling a more component-based architecture.
2. **Performance Optimization**: By customizing Webpack, you can take advantage of advanced features such as code splitting, tree shaking, and caching to optimize the performance of your application.
3. **Extended Functionality**: Webpack's plugin system allows you to extend its functionality to handle various types of assets (e.g., images, fonts, SVGs) and preprocessors (e.g., Babel for modern JavaScript syntax).
4. **Improved Maintainability**: A customized Webpack build can help maintain a cleaner and more modular codebase, making it easier to manage and scale your project.

### Advantages of Using JSX for a Dynamic Component

While Nunjucks is a powerful templating engine for server-side rendering in ApostropheCMS, using JSX with React offers several advantages for building interactive and dynamic user interfaces:

1. **Component-Based Architecture**: JSX allows you to build reusable components, encapsulating both the markup and logic. This modularity makes it easier to manage complex UIs and promotes code reusability.
2. **State Management**: React's state management capabilities enable you to handle dynamic data changes efficiently. This means you can easily manage and update the state as new data is fetched.
3. **Enhanced Interactivity**: With React and JSX, you can create highly interactive UIs with real-time updates and smooth user experiences, such as automatically updating elements without a full page reload.

### Building a Weather App with JSX

![Screenshot of the react weather widget with Philadelphia set to the default city](../images/react-weather-app.png)

In this tutorial, we'll walk through the process of customizing your Webpack configuration to support JSX in an ApostropheCMS project. We'll build a weather widget that leverages the power of React components for a dynamic and interactive user interface. The code for this widget is based on a basic React tutorial that you can find [here](https://github.com/ayushkul/react-weather-app). By the end of this tutorial, you'll understand how to set up a custom Webpack build and take advantage of JSX to enhance your ApostropheCMS projects.

## Adding the Weather Widget to your Project

We will start this tutorial by creating a new widget in an already created starter kit project using the [Apostrophe CLI](https://apostrophecms.com/extensions/apos-cli) tool. At the root of your project, run the following on the command line:

```sh
apos add widget react-weather-widget --player
```

Next, add the new widget to the `app.js` file.

<AposCodeBlock>

```javascript
require('apostrophe')({
  shortName: 'jsx-project',
  modules: {
    // other modules
    'react-weather-widget': {}
  }
});
```

  <template v-slot:caption>
    app.js
  </template>

</AposCodeBlock>

You can choose to add this widget to any area, but for this tutorial we will add it to the default page-type.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Default Page'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {},
            '@apostrophecms/video': {},
            'react-weather': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'main'
        ]
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/default-page/index.js
  </template>

</AposCodeBlock>

## Adding JSX to Our Project

Now that we have our widget added, we will turn our attention to modifying the project Webpack configuration. A typical Webpack configuration is organized into several key sections that define how different types of files should be processed and managed. Within an ApostropheCMS project, we typically modify three configuration sections:

1. **Module:** Specifies rules for handling different file types through loaders.
2. **Plugins:** Allows for the inclusion of plugins that perform a wide range of tasks, from optimizing bundles to injecting environment variables.
3. **Resolve:** Helps Webpack understand how to locate and bundle modules by specifying file extensions and aliasing module paths.

The existing Apostrophe Webpack build uses the Babel compiler to allow the use of modern JavaScript while supporting older browsers. In this case, we will be extending the `module` section to recognize and transpile JSX files by adding a new object to the `rules` array. Open the `modules/react-weather-widget/index.js` and add the following:

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'React Weather Widget'
  },
  webpack: {
    extensions: {
      jsxAddition: {
        module: {
          rules: [
            {
              test: /\.(js|jsx)$/, // Apply this rule to .js and .jsx files
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [ '@babel/preset-react' ] // Presets for ES6+ and React
                }
              }
            }
          ]
        },
        resolve: {
          extensions: [ '.jsx' ]
        }
      }
    }
  }
};
```
<template v-slot:caption>
  modules/react-weather-widget/index.js
</template>

</AposCodeBlock>

::: info
This new rule will be merged by Apostrophe into the existing array of rules, allowing you to create rules in multiple project-level modules.
:::

Within the new rule, we are adding a `test` property with a regular expression to determine if the rule should be applied to a file. In this case, we are using the loader for files with either the `.js` or `.jsx` extensions. It is a matter of preference whether you want other developers to be able to use the `.js` extension for JSX files. We are also adding an `exclude` property so that the files in the `node_modules` folder aren't processed.

In the `use` section, we state that the file should be loaded using the `babel-loader`. This Webpack loader will let us use Babel presets and plugins to transpile our `.jsx` files. In this case, we are using the `@babel/preset-react` preset to interpret our JSX.

In addition to providing a new module rule, we also need to tell the Webpack build that files with a `.jsx` extension should be run through the build process. This is done by extending the `resolve` section's `extensions` array.

In order for our new Webpack build to function, we need to add the new development dependencies. Navigate to the root of your project in your terminal and issue the following command:

```sh
npm install babel-loader @babel/preset-react --save-dev
```

## Creating the Weather App Component
Now that we are able to use JSX in our project, we need to create a component that utilizes it. At the moment, we have only modified our project to be able to transpile JSX files. We haven't changed the build entry point. That means that all of our app component files should be placed into the custom module `ui/src` folder and be imported through the `index.js` file located in that folder. That file is also going to act to bootstrap our app.

<AposCodeBlock>

```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './jsx-components/App.jsx';

export default () => {
  apos.util.widgetPlayers.reactWeather = {
    selector: '[data-react-weather-widget]',
    player: function(el) {
      const rootElement = el.querySelector('#react-weather-root');
      if (rootElement) {
        const defaultCity = rootElement.getAttribute('data-default-city');
        const root = createRoot(rootElement);
        root.render(<App defaultCity={defaultCity}/>);
      }
    }
  };
};
```
  <template v-slot:caption>
    modules/react-weather-widget/ui/src/index.js
  </template>

</AposCodeBlock>

At the top of this file we are importing both `react` and the `createRoot` function from `react-dom/client`. This will allow us to use the React framework in our project. We are also importing the main entry point `App`. In this case I'm electing to add that file and the other component files inside the `ui/src` folder, but you can elect to place them anywhere inside your project, as long as you import them through the `ui/src/index.js` file. To use these two packages we need to add them to our project dependencies. Since they are being used on the front-end, not during the Webpack build, we need to add them as regular dependencies. Navigate to the root of your project in your terminal and issue the following command: `npm install react react-dom/client`.

The remainder of this file is a standard widget player. This player is attached to the `[data-react-weather-widget]` attribute that we will need to add to the widget Nunjucks template. Within that element, it selects an element with an id of `react-weather-root` to create the root for our React component. We are also passing a prop we are getting from the `data-default-city` attribute on our `rootElement`. We will need to add this root element and the data into the data attribute that we will be getting from a schema field.

### Adding the widget Nunjucks template
The markup for this widget on the Nunjucks side is going to be simple. We require an attribute for the player to identify the code our client-side JavaScript player should target, a target where React will render our component root, and another attribute for passing data between the widget schema fields and the react app.

<AposCodeBlock>

```nunjucks
<section data-react-weather-widget>
  <div id="react-weather-root" data-default-city="{{ data.widget.defaultCity or '' }}"></div>
</section>
```
  <template v-slot:caption>
    modules/react-weather-widget/views/widget.html
  </template>

</AposCodeBlock>

Briefly, the attribute on the `section` tag is what we are passing into the `selector` property of the player. This section contains a single `div` element that will be used as the root. Finally on that same element we are setting the `data-default-city` attribute value to data passed from the widget `defaultCity` schema field, or an empty string if the content manager hasn't added a string to that field.

### Modifying the widget schema fields
We have already added our Webpack configuration changes to the `modules/react-weather-widget/index.js` file, but now we also want to add the `defaultCity` schema field.

<AposCodeBlock>

```javascript
require('dotenv').config();

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'React Weather Widget'
  },
  fields: {
    add: {
      defaultCity: {
        type: 'string',
        label: 'Default City'
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'defaultCity' ]
      }
    }
  },
  webpack: {
    // configuration code
  }
};

```
  <template v-slot:caption>
    modules/react-weather-widget/index.js
  </template>

</AposCodeBlock>

As we will see when we cover the JSX code files, this default city will cause the widget to be prepopulated with data from a selected city that can then be replaced with user input.

### Adding the main `App.jsx` component

Since this tutorial is mainly focused on how you use React in an ApostropheCMS project, we aren't going to go through the fine points of the React code we are adding.

<AposCodeBlock>

```jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import CityComponent from "./CityComponent";
import WeatherComponent from "./WeatherComponent";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 380px;
  padding: 20px 10px;
  margin: auto;
  border-radius: 4px;
  box-shadow: 0 3px 6px 0 #555;
  background: white;
  font-family: Montserrat;
`;

const AppLabel = styled.span`
  color: black;
  margin: 20px auto;
  font-size: 18px;
  font-weight: bold;
`;

function App({ defaultCity }) {
  const [city, updateCity] = useState(defaultCity || "");
  const [weather, updateWeather] = useState(null);

  useEffect(() => {
    if (defaultCity) {
      fetchWeather(defaultCity);
    }
  }, [defaultCity]);

  const fetchWeather = async (cityName) => {
    try {
      const response = await fetch(`/fetch-weather?city=${cityName}`);
      const weather = await response.json();
      updateWeather(weather);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const handleFetchWeather = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };
  return (
    <Container>
      <AppLabel>React Weather App</AppLabel>
      <CityComponent updateCity={updateCity} fetchWeather={handleFetchWeather} />
      {weather && <WeatherComponent weather={weather} city={city} />}
    </Container>
  );
}

export default App;
```
  <template v-slot:caption>
    modules/react-weather-widget/ui/src/jsx-components/App.jsx
  </template>

</AposCodeBlock>

It should be noted that the two components used by this React app are being imported in the `App.jsx` file that is imported in the base `ui/src/index.js` file. The Webpack build is clever enough to import all the files without having to import them to the base, as long as they are imported into a file that is imported into the base. The only other part of this code we need to focus on is the `fetchWeather()` function. In this app we have elected to use the [OpenWeatherMap](https://openweathermap.org/) API to retrieve the weather for each city. At the time of this writing it had a generous free tier, and easy geolocation from a city name. However, it does require an API key. We don't want to directly add this key into our `App.jsx` code since it will be exposed client-side. Instead, we are going to create a proxy endpoint in our project that will fetch the data and pass it back to our component.

```javascript
const response = await fetch(`/fetch-weather?city=${cityName}`);
```
This line in that function performs a fetch on the `/fetch-weather` endpoint, passing in the city name as a parameter.

<AposCodeBlock>

```javascript
require('dotenv').config();

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'React Weather Widget'
  },
  fields: {
    // schema field code
  },
  webpack: {
    // webpack configuration code
  },
  apiRoutes(self) {
    return {
      get: {
        '/fetch-weather': async function (req, res) {
          const { city } = req.query;
          const apiKey = process.env.OPENWEATHERMAP_API_KEY;
          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`,
            );
            const weather = await response.json();
            return weather;
          } catch (error) {
            return { error: error.message };
          }
        }
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/react-weather-widget/index.js
  </template>

</AposCodeBlock>

There are several ways we can add endpoints to an ApostropheCMS project. In this case we are using the [`apiRoutes(self)` customization function](/reference/module-api/module-overview.html#customization-functions). This code creates a single `GET` route. Because the property used to name the route starts with a slash, we can use that directly when we are calling it from our components. Otherwise, we would have to use a URL like `api/v1/react-weather-widget/fetch-weather`. The remainder of this code should be fairly self-explanatory. We are getting the `city` value from the request object and the API key from an `.env` file in our project. Note that at the top of the file we are using `require('dotenv').config();` to expose this. From Node.js version `20.0.0` and up, this is supported by passing the `--env-file` flag specifying a file when starting your app and doesn't require the `dotenv` dependency. You can also do away with this line if you are passing your API key directly on the command line when starting your project => `OPENWEATERMAP_API_KEY=XXXXXX npm run dev`.

Next the function passes this information to the Open Weather Map API and gets back data that is returned to the component.

### Creating the `CityComponent` component

Again, we aren't going to focus on most of the JSX component code.

<AposCodeBlock>

```jsx
import styled from "styled-components";
import React from "react";
import PerfectDay from '../icons/perfect-day.svg';

const SearchBox = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin: 20px;
  border: black solid 1px;
  border-radius: 2px;

  & input {
    padding: 10px;
    font-size: 14px;
    border: none;
    outline: none;
    font-family: Montserrat;
    font-weight: bold;
  }
  & button {
    background-color: black;
    font-size: 14px;
    padding: 0 10px;
    color: white;
    border: none;
    outline: none;
    cursor: pointer;
    font-family: Montserrat;
    font-weight: bold;
  }
`;
const ChooseCityLabel = styled.span`
  color: black;
  margin: 10px auto;
  font-size: 18px;
  font-weight: bold;
`;
const WelcomeWeatherLogo = styled.img`
  width: 140px;
  height: 140px;
  margin: 40px auto;
`;
const CityComponent = (props) => {
  const { updateCity, fetchWeather } = props;
  return (
    <>
      <WelcomeWeatherLogo src={PerfectDay} />
      <ChooseCityLabel>Find Weather of your city</ChooseCityLabel>
      <SearchBox onSubmit={fetchWeather}>
        <input
          onChange={(e) => updateCity(e.target.value)}
          placeholder="City"
        />
        <button type={"submit"}>Search</button>
      </SearchBox>
    </>
  );
};
export default CityComponent;
```
  <template v-slot:caption>
    modules/react-weather-widget/ui/src/jsx-components/CityComponent.jsx
  </template>

</AposCodeBlock>

We have already installed `react` as a dependency of our project, but we are also utilizing the `styled-components` package in this component. Again, this will be front-end, so it should be a normal, not development dependency. Navigate to the root of your project in your terminal and issue the following command: `npm install styled-components`.

The one line of code that needs to be addressed in an ApostropheCMS project is the import of the icon this component uses: `import PerfectDay from '../icons/perfect-day.svg';`. While the `@apostrophecms/attachment` module will allow the upload of files with an `svg` extension, These files won't be included in the bundled code sent to the front-end. To facilitate image access like you would experience in a React app, we are going to further modify our Webpack configuration and add all of our icons to the `modules/react-weather-widget/ui/src/icons` folder.

To import the files into our Webpack build, we also have to make a modification to the project Webpack configuration. Open the `modules/react-weather-widget/index.js` and make the following modifications:

<AposCodeBlock>

```javascript
require('dotenv').config();

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'React Weather Widget'
  },
  fields: {
    //schema fields
  },
  webpack: {
    extensions: {
      jsxAddition: {
        module: {
          rules: [
            {
              test: /\.(js|jsx)$/, // Apply this rule to .js and .jsx files
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [ '@babel/preset-react' ] //  presets for ES6+ and React
                }
              }
            },
            {
              test: /\.svg$/,
              use: [
                {
                  loader: 'file-loader'
                }
              ]
            }
          ]
        },
        resolve: {
          extensions: [ '.jsx', '.svg' ]
        }
      }
    }
  },
  apiRoutes(self) {
    // apiRoutes code
  }
};
```
  <template v-slot:caption>
    modules/react-weather-widget/index.js
  </template>

</AposCodeBlock>

We are adding a new `rules` object that specifies that any files with an `svg` extension use the `file-loader` to be brought into the project bundle. The `extensions` array of the `resolve` section also needs to be modified to allow for processing of files with the `.svg` extension. We have to install this loader in our project by running the command `npm install file-loader --save-dev` on the command line at the root of our project.

### Creating the `WeatherComponent` component

Again, we won't touch much on the JSX code.

<AposCodeBlock>

```javascript
import React from 'react';
import styled from 'styled-components';
import SunsetIcon from '../icons/sunset.svg';
import SunriseIcon from '../icons/sunrise.svg';
import HumidityIcon from '../icons/humidity.svg';
import WindIcon from '../icons/wind.svg';
import PressureIcon from '../icons/pressure.svg';

const WeatherInfoIcons = {
  sunset: SunsetIcon,
  sunrise: SunriseIcon,
  humidity: HumidityIcon,
  wind: WindIcon,
  pressure: PressureIcon
};

const Location = styled.span`
  margin: 15px auto;
  text-transform: capitalize;
  font-size: 28px;
  font-weight: bold;
`;

const Condition = styled.span`
  margin: 20px auto;
  text-transform: capitalize;
  font-size: 14px;
  & span {
    font-size: 28px;
  }
`;

const WeatherInfoLabel = styled.span`
  margin: 20px 25px 10px;
  text-transform: capitalize;
  text-align: start;
  width: 90%;
  font-weight: bold;
  font-size: 14px;
`;

const WeatherIcon = styled.img`
  width: 100px;
  height: 100px;
  margin: 5px auto;
`;

const WeatherContainer = styled.div`
  display: flex;
  width: 100%;
  margin: 30px auto;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const WeatherInfoContainer = styled.div`
  display: flex;
  width: 90%;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
`;

const InfoContainer = styled.div`
  display: flex;
  margin: 5px 10px;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

const InfoIcon = styled.img`
  width: 36px;
  height: 36px;
`;

const InfoLabel = styled.span`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  margin: 15px;
  & span {
    font-size: 12px;
    text-transform: capitalize;
  }
`;

const WeatherInfoComponent = (props) => {
  const { name, value } = props;
  return (
    <InfoContainer>
      <InfoIcon src={WeatherInfoIcons[name]} />
      <InfoLabel>
        {value}
        <span>{name}</span>
      </InfoLabel>
    </InfoContainer>
  );
};

const WeatherComponent = (props) => {
  const { weather } = props;
  const isDay = weather?.weather[0].icon?.includes('d');
  const getTime = (timeStamp) => {
    return `${new Date(timeStamp * 1000).getHours()} : ${new Date(timeStamp * 1000).getMinutes()}`;
  };
  return (
    <>
      <Location>{`${weather?.name}, ${weather?.sys?.country}`}</Location>
      <WeatherContainer>
        <Condition>
          <span>{`${Math.floor(weather?.main?.temp - 273)}°C`}</span>
          {`  |  ${weather?.weather[0].description}`}
        </Condition>
        <WeatherIcon src={`https://openweathermap.org/img/wn/${weather?.weather[0].icon}@2x.png`} />
      </WeatherContainer>

      <WeatherInfoLabel>Weather Info</WeatherInfoLabel>
      <WeatherInfoContainer>
        <WeatherInfoComponent
          name={isDay ? 'sunset' : 'sunrise'}
          value={`${getTime(weather?.sys[isDay ? 'sunset' : 'sunrise'])}`}
        />
        <WeatherInfoComponent name={'humidity'} value={weather?.main?.humidity} />
        <WeatherInfoComponent name={'wind'} value={weather?.wind?.speed} />
        <WeatherInfoComponent name={'pressure'} value={weather?.main?.pressure} />
      </WeatherInfoContainer>
    </>
  );
};

export default WeatherComponent;
```
  <template v-slot:caption>
    modules/react-weather-widget/ui/src/jsx-components/WeatherComponent.jsx
  </template>

</AposCodeBlock>

As with the `CityComponent.jsx` file, we are importing `react` and `styled-components` packages. We are also importing five SVG weather info icons from the `modules/react-weather-widget/ui/src/icons` folder. The OpenWeatherMap site makes the remainder of the images we need available on their site.

## Conclusions
In this tutorial, we covered the basics of how to create a widget powered by React and JSX components. Similar steps can be used to allow you to use Vue, Svelte, or Angular components in your project. You need to identify the correct loader(s) for the file types you want to use, add any presets to transpile the files, and make sure that the Webpack build is screening files with the expected extensions.

For this widget, we only added a single render root. But to add additional components, we simply need to make sure that each element passed from the DOM to the `createRoot()` function is unique. Whether it is passed through a widget player, added as a fragment, or directly into the Nunjucks template. Note that if you are adding front-end JavaScript to create and render your root element outside a widget player, make sure to wrap your script in an [`apos.util.onReady()`](https://docs.apostrophecms.org/guide/front-end-helpers.html#onready-fn) listener so that it triggers a rerender when the page content is updated during editing.