<template>
  <div class="cta-button tip custom-block" @click="navigate" @keydown.enter.prevent="handleEnter"
    @keydown.space.prevent="handleSpace" :class="{ 'clickable': url }" role="button" tabindex=0>
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
    <p class="cta-button__content">{{ content }}<span v-if="url" class="cta-button__arrow"> &#8594</span> </p>
    
    <!-- Series indicator (if applicable) -->
    <div v-if="isSeries" class="series-indicator">
      <div class="series-stack">
        <div class="series-card"></div>
        <div class="series-card"></div>
        <div class="series-count">{{ seriesCount }}</div>
      </div>
    </div>
    
    <!-- Empty space to push effort indicator to bottom -->
    <div class="spacer"></div>
    
    <!-- Experience level with dots -->
    <div class="effort-indicator">
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
</template>

<script>
export default {
  props: {
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
  },
  // created() {
  //   console.log('Props received in child component:', {
  //     cardType: this.cardType,
  //     cardTopic: this.cardTopic,
  //     cardEffort: this.cardEffort,
  //     title: this.title,
  //     content: this.content,
  //     url: this.url,
  //     isSeries: this.isSeries,
  //     seriesCount: this.seriesCount
  //   })
  // },
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
    getLevelDots(cardEffort) {
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
    }
  }
}
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
.tags-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

// Tag styles
.tag {
  border-radius: 9999px; // rounded-full
  padding: 0.25rem 0.5rem; // px-2 py-1
  font-size: 0.875rem; // text-sm
  font-weight: 600; // font-semibold
  
  &--type {
    background-color: rgba(219, 234, 254, 1); // bg-blue-100
    color: rgba(30, 58, 138, 1); // text-blue-900
  }
  
  &--topic {
    background-color: rgba(254, 243, 199, 1); // bg-yellow-100
    color: rgba(146, 64, 14, 1); // text-yellow-800
  }
}

// Series indicator styling
.series-indicator {
  margin-top: 1rem;
  align-self: flex-start;
}

.series-stack {
  position: relative;
  width: 3rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.series-card {
  position: absolute;
  width: 2rem;
  height: 1.5rem;
  background-color: rgba(237, 233, 254, 1); // bg-purple-100
  border: 1px solid rgba(91, 33, 182, 1); // border-purple-800
  border-radius: 0.25rem;
  
  &:nth-child(1) {
    transform: rotate(-10deg);
    z-index: 1;
    left: 0;
  }
  
  &:nth-child(2) {
    transform: rotate(5deg);
    z-index: 2;
    left: 0.5rem;
  }
}

.series-count {
  position: absolute;
  z-index: 3;
  width: 1.5rem;
  height: 1.5rem;
  background-color: rgba(91, 33, 182, 1); // bg-purple-800
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  right: 0;
  bottom: 0;
}

// Spacer to push content to the bottom
.spacer {
  flex-grow: 1;
}

// Effort indicator
.effort-indicator {
  margin-top: 1rem;
  font-size: 0.875rem; // text-sm
  color: rgba(17, 24, 39, 1); // text-gray-900
  display: flex;
  align-items: center;
  gap: 0.5rem; // gap-2
  
  .effort-badge {
    background-color: rgba(229, 231, 235, 1); // bg-gray-200
    border-radius: 9999px; // rounded-full
    padding: 0.25rem 0.5rem; // px-2 py-1
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
        border: 1px solid black; // border border-black
        
        &--filled {
          background-color: rgba(16, 185, 129, 1); // bg-green-500
        }
        
        &--empty {
          background-color: transparent; // bg-transparent
        }
      }
    }
  }
}
</style>