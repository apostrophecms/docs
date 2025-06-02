<template>
  <div id="swagger-ui"></div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  const SwaggerUI = (await import('swagger-ui-dist/swagger-ui-bundle.js')).default
  
  SwaggerUI({
    dom_id: '#swagger-ui',
    url: '/apostrophecms-openapi.yaml',
    presets: [
      SwaggerUI.presets.apis,
      SwaggerUI.presets.standalone
    ],
    layout: "BaseLayout",
    deepLinking: true,
    showExtensions: true,
    showCommonExtensions: true
  })
})
</script>

<style>
@import 'swagger-ui-dist/swagger-ui.css';
</style>