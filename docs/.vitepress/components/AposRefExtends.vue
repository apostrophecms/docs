<template>
  <p>
    <strong>Extends:</strong> <code>{{ module }}</code> <a href="/docs/guide/modules.html#module-inheritance">ℹ️</a>
  </p>
</template>

<script setup>
import { ref, computed } from 'vue';
  
const props = defineProps({
    module: {
      type: String,
      required: true
    }
  });

</script>

<style lang="stylus"  scoped>
  p
    position: relative;
  a
    position: absolute;
    left: 0;
    transform: translateX(-130%);
    opacity: .8;
    transition: opacity 0.25s;
  .theme-default-content a:hover,
  .theme-default-content a:focus
    text-decoration: none;
    opacity: 1;

</style>