<template>
  <figure>
    <slot></slot>
    <figcaption v-if="hasCaption">
      <slot name="caption"></slot>
    </figcaption>
  </figure>
</template>

<script>
export default {
  computed: {
    hasCaption() {
      return !!this.$slots.caption;
    }
  }
};
</script>

<style lang="stylus"  scoped>
figure {
  position: relative;
  margin: 0;
  padding: 0;
}

figcaption {
  z-index: 1;
  position: absolute;
  top: 0.85em;
  left: 3em;
  width: calc(100% - 6em);
  color: #fff;
  font-family: Hack, monospace;
  font-size: 0.85rem;
  text-align: center;
}
</style>