<template>
  <span :style="colorStyle">{{ text }}</span>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  tagStyle: {
    type: Number,
    default: null
  }
});

const styleSets = ref([
  {
    bgColor: '#2ecc71'
  },
  {
    bgColor: '#f1c40f',
    color: 'dark'
  }
]);

const colorStyle = computed(() => {
  let activeStyle = {};
  if (props.tagStyle !== null && styleSets.value[props.tagStyle]) {
    activeStyle = styleSets.value[props.tagStyle]
  }
  const styles = {
    backgroundColor: activeStyle.bgColor ? activeStyle.bgColor : false,
    color: activeStyle.color === 'dark' ? 'currentColor' : false
  };

  return styles;
});
</script>


<style lang="stylus" scoped>
  span
    background-color: #66F;
    color: #fff;
    font-size: 80%;
    padding: .25em;
    border-radius: 5px;
    white-space: nowrap;
</style>