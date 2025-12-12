<template>
  <span class="icon">
    <InlineSvg :src="`/docs/images/icons/${name}.svg`" />
  </span>
</template>

<script setup>
  import InlineSvg from 'vue-inline-svg';
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
