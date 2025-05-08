<template>
  <div class="cta-button tip custom-block" @click="navigate" @keydown.enter.prevent="handleEnter"
    @keydown.space.prevent="handleSpace" :class="{ 'clickable': url }" :role="url ? 'button' : undefined" :tabindex="url ? 0 : undefined">
    <!-- Tags at the top -->
    <div class="tags-container">
      <span class="tag tag--type" v-if="cardType">
        {{ cardType }}
      </span>
      <span class="tag tag--topic" v-if="cardTopic">
        {{ cardTopic }}
      </span>
    </div>

    <p class="cta-button__title">{{ title }}</p>
    <p class="cta-button__content">{{ content }}</p>

    <div class="details">
      <!-- Series indicator -->
      <span class="tag tag--series" v-if="isSeries">
        <InlineSvg src="/images/icons/stack.svg" class="icon" />
        {{ seriesCount }} Part Series
      </span>
      <!-- Experience level with dots -->
      <div class="tag tag--effort effort-indicator">
        <span class="effort-badge">
          <span class="effort-dots">
            <span v-for="n in 3" :key="n" class="effort-dot" :class="{
              'effort-dot--filled': n <= getLevelDots(cardEffort),
              'effort-dot--empty': n > getLevelDots(cardEffort)
            }"></span>
          </span>
          {{ cardEffort }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import InlineSvg from 'vue-inline-svg';
  const props = defineProps({
    cardType: String,
    cardTopic: String,
    cardEffort: String,
    title: String,
    content: String,
    url: {
      type: String,
      default: null,
    },
    isSeries: {
      type: Boolean,
      default: false
    },
    seriesCount: {
      type: Number,
      default: 1
    }
  });

  const navigate = () => {
    if (props.url) {
      window.location.href = props.url;
    }
  };
  const handleEnter = () => {
    navigate();
  };
  const handleSpace = (event) => {
    if (event.target === event.currentTarget) {
        navigate();
      }
  };
  const getLevelDots = (cardEffort) => {
    switch (cardEffort?.toLowerCase()) {
        case 'beginner':
        case 'easy':
          return 1;
        case 'medium':
        case 'intermediate':
          return 2;
        case 'advanced':
          return 3;
        default:
          return 0;
      }
  };
</script>

<style lang="scss" scoped>
.cta-button {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  border: 1px solid var(--vp-c-divider);
  background-color: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  position: relative;

  &__detail-heading {
    color: var(--vp-c-text-2);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  &__title {
    color: var(--vp-c-text-1);
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  &__content {
    margin: 0;
    flex: 1;
  }

  &__arrow {
    display: inline-block;
  }

  &.clickable {
    cursor: pointer;
  }

  &:not(.clickable) {
    cursor: default;
  }

  @media (min-width: 960px) {
    &.clickable:hover {
      border: 1px solid var(--vp-custom-block-tip-border);
      background-color: var(--vp-custom-block-tip-bg);
    }
  }

  @media (max-width: 959px) {
    margin-bottom: 0;
    margin-top: 0;
  }
}

// Tags container
.tags-container,
.details {
  display: flex;
  gap: 8px;
  margin-bottom: 0.5rem;
}

// Tag styles
.tag {
  display: flex;
  gap: 5px;
  border-radius: 5px;
  padding: 0 0.5rem; // px-2 py-1
  height: 24px;
  font-size: 0.6rem;
  font-weight: 600; // font-semibold
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: rgb(238, 238, 238);
  border-width: 1px;
  border-style: solid;
  border-color: oklch(87% 0 0); // bg-neutral-300

  .icon {
    width: 12px;
  }
  
  &--type {
    background-color: rgba(219, 234, 254, 1); // bg-blue-100
    color: rgba(30, 58, 138, 1); // text-blue-900
    border-color: oklch(88.2% 0.059 254.128); // bg-blue-200
  }
  
  &--topic {
    background-color: rgba(254, 243, 199, 1); // bg-yellow-100
    color: rgba(146, 64, 14, 1); // text-yellow-800
    border-color: oklch(94.5% 0.129 101.54); // bg-yellow-200
  }
}

// Effort indicator
.effort-indicator {
  color: rgba(17, 24, 39, 1); // text-gray-900
  display: flex;
  align-items: center;
  gap: 0.5rem; // gap-2
  
  .effort-badge {
    display: flex;
    align-items: center;
    
    .effort-dots {
      margin-right: 0.5rem; // mr-2
      display: flex;
      align-items: center;
      gap: 0.25rem; // gap-1
      
      .effort-dot {
        width: 0.5rem; // w-2
        height: 0.5rem; // h-2
        border-radius: 9999px; // rounded-full
        
        &--filled {
          background-color: rgba(16, 185, 129, 1); // bg-green-500
          background-color: oklch(69.6% 0.17 162.48); // bg-emerald-600
        }
        
        &--empty {
          background-color: oklch(70.7% 0.022 261.325); // bg-gray-400
        }
      }
    }
  }
}
</style>