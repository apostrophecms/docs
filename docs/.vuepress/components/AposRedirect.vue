<template></template>

<script>
export default {
  props: {
    path: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.$router.push(this.path);
  }
};
</script>