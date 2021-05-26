<template>
  <span :style="colorStyle">{{ text }}</span>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    tagStyle: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      styleSets: [
        {
          bgColor: '#2ecc71'
        },
        {
          bgColor: '#f1c40f',
          color: 'dark'
        }
      ]
    }
  },
  computed: {
    colorStyle() {
      let activeStyle = {};
      if (this.tagStyle !== null && this.styleSets[this.tagStyle]) {
        activeStyle = this.styleSets[this.tagStyle]
      }
      const styles = {
        backgroundColor: activeStyle.bgColor ? activeStyle.bgColor : false,
        color: activeStyle.color === 'dark' ? 'currentColor' : false
      };

      return styles;
    }
  }
};
</script>

<style lang="stylus"  scoped>
  span
    background-color: #66F;
    color: #fff;
    font-size: 80%;
    padding: .25em;
    border-radius: 5px;
    white-space: nowrap;
</style>