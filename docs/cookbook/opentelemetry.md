# Profiling ApostropheCMS with OpenTelemetry

Sometimes developers need insight into performance issues with their websites. [OpenTelemetry](https://opentelemetry.io/) is a widely adopted, open source solution for collecting performance "traces" that provide insight into where the time is going when a website responds to a request.

Here's the good news: ApostropheCMS has built-in support for OpenTelemetry tracing. So all we need to do is install the OpenTelemetry SDK in our Apostrophe-powered website project and set up a compatible "backend" in which to view the reports. [Jaeger](https://www.jaegertracing.io) is one of the simplest and best backends available.

Here is a quick guide to enabling OpenTelemetry tracing for ApostropheCMS with the [Jaeger backend](https://www.jaegertracing.io/docs/2.8/getting-started/). By the end of this guide, we'll be able to see not just how long requests take, but how much of the time in each request is spent on MongoDB queries, template rendering, Apostrophe events and more. This can be a helpful starting point for optimizing project code.

## 1. Install the required dependencies

Install the required dependencies in your ApostropheCMS project:

```sh
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/semantic-conventions \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/resources
```

**Also make sure `apostrophe` is updated to at least version 3.18.0, preferably the newest 4.x release available.**

## 2. Install Jaeger

The easiest way to install and run Jaeger in our development environment is via Docker image. Here are the most basic steps to take, but if you prefer you may follow the [Jaeger Getting Started Guide](https://www.jaegertracing.io/docs/2.8/getting-started/).

::: warning
First ensure you have [Docker installed](https://docs.docker.com/get-docker/).
:::

```sh
docker --version
```

Now we can install and launch Jaeger in the background with a single command:

```sh
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 5778:5778 \
  -p 9411:9411 \
  cr.jaegertracing.io/jaegertracing/jaeger:2.8.0
```

Jaeger will keep running in the background. We can stop it later with:

```sh
docker stop jaeger && docker rm jaeger
```

Now we can open <span v-pre>`http://localhost:16686`</span> in the browser to ensure Jaeger is working properly.

## 3. Configure OpenTelemetry

There are various ways to configure and integrate OpenTelemetry in a project. We think this is the cleanest way.

Create a `telemetry.js` file in the project root:

<AposCodeBlock>

``` js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import pkg from './package.json' with { type: 'json' };

// 1. Add the application metadata (resource)
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: pkg.name,
  [ATTR_SERVICE_VERSION]: pkg.version
});

// 2. Initialize the OTLP exporter with correct endpoint
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
  headers: {},
});

// 3. Initialize the SDK
const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

// 4. The shutdown handler
const shutdown = async () => {
  await sdk
    .shutdown()
    .then(
      () => console.log('OpenTelemetry stopped'),
      (err) => console.log('Error shutting down OpenTelemetry', err)
    );
};

export default {
  sdk,
  shutdown
};
```
<template v-slot:caption>
telemetry.js
</template>
</AposCodeBlock>

Now we'll need to refactor `app.js` a little bit to connect OpenTelemetry with Apostrophe:

<AposCodeBlock>

``` js
// The Apostrophe bootstrap
import apostrophe from 'apostrophe';
import telemetry from './telemetry.js';
import { trace } from '@opentelemetry/api';

const { sdk, shutdown } = telemetry;

// Move Apostrophe configuration to a variable, rather than directly
// invoking the apostrophe function

const config = {
  shortName: 'myApp',
  // Provide our shutdown handler
  beforeExit: process.env.APOS_OPENTELEMETRY ? shutdown : null,
  modules: {
    // ... Our regular module configuration comes here
  }
};

// Invoke based on APOS_OPENTELEMETRY environment variable
if (process.env.APOS_OPENTELEMETRY) {
  // Start the sdk
  sdk.start();
  console.log('opentelemetry started');
  // bootstrap apostrophe
  apostrophe(config);
} else {
  apostrophe(config);
}
```
<template v-slot:caption>
app.js
</template>
</AposCodeBlock>

The important bits of this change are:

1. Capture the apostrophe configuration in a variable
2. Provide a `shutdown` handler for `telemetry.js` as the value of the Apostrophe `beforeExit` configuration option 
3. Start Apostrophe after OpenTelemetry has been started

## 4. Start the application

Be sure that the Jaeger backend is running (step 2) and open http://localhost:16686 in the browser. 

Start the app:

```sh
APOS_OPENTELEMETRY=1 node app
```

After Apostrophe is fully started, refresh the Jaeger UI and you should see some data shown (give it some time).

Open http://localhost:3000 and go check the Jaeger UI for `GET` operations (again, give it some time and refresh).

You can trace command line tasks as well:

```sh
APOS_OPENTELEMETRY=1 node app @namespace/module:taskName
```

## Bonus - Developer's Quality of Life

You may optimize your development experience with a few CLI and npm scripts.

Create the file `jaeger` in your project root and make it executable:

```sh
chmod +x jaeger
```

Add contents to it:

```bash
#!/usr/bin/env bash

set -e

_ACTION="$1"
if [[ -z "$1" ]]; then
  _ACTION='help'
fi

# Start
function _start {
  docker run --rm --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 5778:5778 \
  -p 9411:9411 \
  cr.jaegertracing.io/jaegertracing/jaeger:2.8.0
}

# Stop
function _stop {
  docker stop jaeger
  docker rm jaeger
}

function _help()
{
  echo
  echo 'USAGE: '
  echo './scripts/jaeger COMMAND'
  echo
  echo 'COMMANDS:'
  echo '  start'
  echo '      Start Jaeger in Docker container'
  echo '  stop'
  echo '      Stop Jaeger container and cleanup'
  echo '  help'
  echo '      Show help'
  return 1
}

if [[ $_ACTION = 'start' ]]; then
  echo "Start Jaeger"
  _start
  echo "Jaeger is running at http://localhost:16686"
elif [[ $_ACTION = 'stop' ]]; then
  echo "Shut down Jaeger"
  _stop
else
  _help
fi
```

Open your `package.json` and add the following scripts at the end of the `scripts` section:

``` json
  "scripts": {
    "start:telemetry": "APOS_OPENTELEMETRY=1 node app",
    "jaeger:start": "./jaeger start",
    "jaeger:stop": "./jaeger stop"
  },
```

Now you can start it:

```sh
npm run jaeger:start
npm run start:telemetry
```

and stop it:

```sh
npm run jaeger:stop
```

## Bonus - trace your own application

You can use the tracing API of the OpenTelemetry to trace your own code. Apostrophe exposes `self.apos.telemetry`. It contains the OpenTelemtry API, some useful helpers and the tracer used internally by the Apostrophe core. You could use it or you could add application level OpenTelemetry API dependency and trace your code as you see fit.

A common scenario using an Apostrophe helper:
``` js
// Somewhere in your application code or module.
const telemetry = self.apos.telemetry;
// Create an OpenTelemetry span, that is "connected" (child) to
// the current active context
const span = telemetry.startSpan('yourSpanName');
span.setAttribute('some', 'attribute');

// Do some work...

// Create a child span of the span above
const child = telemetry.startSpan('yourChildSpanName', span);
child.setAttribute('another', 'attribute');
child.addEvent('some event');

// Do some wore work ...

// End the child span with appropriate status code
child.setStatus({ code: telemetry.api.SpanStatusCode.OK });
child.end();

// End the parent span with appropriate status code
span.setStatus({ code: telemetry.api.SpanStatusCode.OK });
span.end();
```

You can inspect [the telemetry namespace exports here](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/lib/opentelemetry.js).

An example of [an internal implementation is available here](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/module/lib/events.js#L29).
