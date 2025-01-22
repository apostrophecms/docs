---
next: false
prev: false
---
# Building Vue Widgets in Apostrophe with Vite 

Modern web applications often require sophisticated user interactions and real-time updates, even within content management systems. While Apostrophe's Nunjucks templates excel at server-side rendering, and its built-in async components and refresh mechanisms handle many common scenarios effectively, complex widgets can benefit from more structured approaches to state management and UI updates. Vue's reactive component system offers a familiar pattern for organizing these concerns, particularly when widgets need to manage multiple states and handle complex data flows. Combined with the streamlined development environment delivered by the ApostropheCMS Vite build, this approach provides a practical option for building maintainable, interactive widgets. In this tutorial, we'll demonstrate these concepts by building a dynamic charting widget - one example of what you can create with Vue and Vite in Apostrophe.

### The Power of Vite in Modern Web Development

Vite represents a significant leap forward in build tool technology, offering advantages that directly translate to improved development workflow and application performance:

1. **Development Speed**: Vite's innovative approach to development servers means you spend less time waiting and more time coding:
   - Server starts in milliseconds regardless of application size
   - Changes reflect instantly through advanced hot module replacement (HMR)
   - Smart caching ensures only modified modules are processed

2. **Build Optimization**: Production builds are automatically optimized for modern browsers:
   - Efficient code splitting strategies reduce initial load times
   - Automatic CSS code splitting for optimal caching
   - Modern browser features are leveraged while maintaining compatibility

3. **Vue Integration**: The seamless integration between Vue and Vite provides an exceptional development experience:
   - Zero-configuration support for Single-File Components (SFC)
   - TypeScript and JSX support out of the box
   - Automatic chunk optimization for async components

### Why Vue for Apostrophe Widgets?

Again, while Apostrophe's template system excels at server-side rendering, Vue offers compelling advantages for building interactive widgets:

1. **Reactive Data Handling**: Vue's reactivity system automatically updates your UI when data changes, perfect for dynamic charts and interactive components.
2. **Component Architecture**: Vue components encapsulate logic, styling, and markup in a maintainable way, making it easier to build complex widgets.
3. **Rich Ecosystem**: Access to Vue's extensive ecosystem of libraries and tools, particularly valuable for data visualization and user interaction.

This tutorial will walk you through creating a basic charting widget that demonstrates how to integrate Vue components within Apostrophe. While the example is intentionally simple - offering three chart types with basic customization - it provides a foundation for building more complex widgets based on your specific needs.

### Building a charting widget with Vue
# Building Vue Widgets in Apostrophe with Vite 

Modern web applications often require sophisticated user interactions and real-time updates, even within content management systems. While Apostrophe's Nunjucks templates excel at server-side rendering, and its built-in async components and refresh mechanisms handle many common scenarios effectively, complex widgets can benefit from more structured approaches to state management and UI updates. Vue's reactive component system offers a familiar pattern for organizing these concerns, particularly when widgets need to manage multiple states and handle complex data flows. Combined with the streamlined development environment delivered by the ApostropheCMS Vite build, this approach provides a practical option for building maintainable, interactive widgets. In this tutorial, we'll walk you through creating a basic charting widget that demonstrates how to integrate Vue components within Apostrophe. While the example is intentionally simple - offering three chart types with basic customization - it provides a foundation for building more complex widgets based on your specific needs.

## Setting up Vue in Your Apostrophe Project

Before we create our charting widget, we need to configure Vite to work with Vue components:

1. Install the Vue plugin for Vite:
   ```bash
   npm install @vitejs/plugin-vue --save-dev
   ```

2. Configure Vite to use Vue by updating your `apos.vite.config.js`:
   ```javascript
   import vue from '@vitejs/plugin-vue';

   export default {
     // ... existing config
     plugins: [
       vue()
     ]
   };
   ```

## Creating the Chart Widget

### 1. Widget Setup
First, we'll create the basic widget structure and configure it to use our Vue component:

```javascript
// modules/chart-widget/index.js
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Chart'
  },
  // Add the Vite bundle configuration
  build: {
    vite: {
      bundles: ['chartWidget']
    }
  },
  // Fields for the widget schema
  fields: {
    add: {
      chartType: {
        type: 'select',
        choices: [
          {
            label: 'Line',
            value: 'line'
          },
          {
            label: 'Bar',
            value: 'bar'
          },
          {
            label: 'Pie',
            value: 'pie'
          }
        ]
      },
      chartData: {
        type: 'string',
        textarea: true,
        help: 'Enter JSON data for the chart'
      }
    }
  }
};
```

### 2. Widget Template
Create a template that will serve as the mounting point for our Vue component:

```nunjucks
{# modules/chart-widget/views/widget.html #}
<div data-chart-widget 
     data-chart-type="{{ data.widget.chartType }}"
     data-chart-data="{{ data.widget.chartData | dump }}">
</div>
```

### 3. Front-end Implementation
Create the Vue initialization code:

```javascript
// ui/src/chartWidget.js
import { createApp } from 'vue';
import ChartComponent from './app/ChartComponent.vue';

export default () => {
  // Find all chart widget instances on the page
  const widgets = document.querySelectorAll('[data-chart-widget]');
  
  widgets.forEach(widget => {
    // Parse the data attributes
    const chartType = widget.dataset.chartType;
    const chartData = JSON.parse(widget.dataset.chartData);
    
    // Create and mount the Vue application
    const app = createApp(ChartComponent, {
      chartType,
      chartData
    });
    app.mount(widget);
  });
};
```

### 4. Creating the Vue Component
Finally, create your Vue component:

```vue
<!-- ui/src/app/ChartComponent.vue -->
<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  props: {
    chartType: {
      type: String,
      required: true,
      validator: value => ['line', 'bar', 'pie'].includes(value)
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas;
      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: this.chartData,
        options: {
          responsive: true
        }
      });
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style>
.chart-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

## Using Other Frameworks

The steps for integrating React or Svelte components follow a similar pattern. The main differences are:
- Using the appropriate Vite plugin (`@vitejs/plugin-react` or `@vitejs/plugin-svelte`)
- Using each framework's specific mounting syntax

For detailed examples of React and Svelte implementations, check out our demo repository at [link].

## Example Chart Data Format

Here's an example of the JSON data format for different chart types:

```javascript
// Line or Bar Chart Data
{
  "labels": ["January", "February", "March", "April"],
  "datasets": [{
    "label": "Sales",
    "data": [65, 59, 80, 81],
    "borderColor": "rgb(75, 192, 192)",
    "tension": 0.1
  }]
}

// Pie Chart Data
{
  "labels": ["Red", "Blue", "Yellow"],
  "datasets": [{
    "data": [300, 50, 100],
    "backgroundColor": [
      "rgb(255, 99, 132)",
      "rgb(54, 162, 235)",
      "rgb(255, 205, 86)"
    ]
  }]
}
```