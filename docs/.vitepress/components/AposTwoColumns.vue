<template>
  <div class="two-columns">
    <div class="column">
      <slot name="leftColumn"></slot>
    </div>
    <div class="column">
      <slot name="rightColumn"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    leftColumn: String,
    rightColumn: String
  }
};
</script>

<style scoped>
.two-columns {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.column {
  flex: 1;
}

@media (max-width: 959px) {
  .two-columns {
    flex-direction: column;
  }

  .two-columns + .two-columns {
    margin-top: 32px;
  }
}
</style>
