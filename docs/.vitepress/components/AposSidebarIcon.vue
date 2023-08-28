<template>
  <span class="icon">
    <InlineSvg :src="`/images/icons/${name}.svg`" />
  </span>
</template>

<script setup>
  import InlineSvg from 'vue-inline-svg';
  import { withBase } from 'vitepress'
  const props = defineProps({
    name: {
      type: String,
      required: true
    }
  });
</script>

<style lang="scss" scoped>
  .icon {
    margin-right: 6px;

    img {
      max-width: 14px;
    }
  }
</style>
