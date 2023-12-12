<template>
    <div 
      class="cta-button tip custom-block" 
      @click="navigate" 
      @keydown.enter.prevent="handleEnter"
      @keydown.space.prevent="handleSpace"
      :class="{ 'clickable': url }"
      role="button"
      tabindex=0
    >
      <p class="cta-button__detail-heading">{{ detailHeading }}</p>
      <p class="cta-button__title">{{ title }}</p>
      <p>{{ content }}<span v-if="url"> &#8594</span> </p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      detailHeading: String,
      title: String,
      content: String,
      url: {
        type: String,
        default: null,
      }
    },
    methods: {
      navigate() {
        if (this.url) {
          window.location.href = this.url;
        }
      },
        handleEnter() {
        this.navigate();
      },
      handleSpace(event) {
        if (event.target === event.currentTarget) {
          this.navigate();
        }
      },
    }
  }
  </script>
  
<style scoped>
  .cta-button {
    height: 100%;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
    border: 1px solid var(--vp-c-divider);
    background-color: transparent;
    color: var(--vp-c-text-1);
    font-size: 14px;
  }

  .cta-button__detail-heading {
    color: var(--vp-c-text-2);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .cta-button__title {
    color: var(--vp-c-text-1); 
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .clickable {
    cursor: pointer;
  }
  
  .cta-button:not(.clickable) {
    cursor: default;
  }

  @media (min-width: 960px) {
    .cta-button.clickable:hover {
      border: 1px solid var(--vp-custom-block-tip-border);
      background-color: var(--vp-custom-block-tip-bg);
    }
  }

  @media (max-width: 959px) {
    .cta-button {
      margin-bottom: 0;
      margin-top: 0;
    }
  }

/* DARK */  
</style>
