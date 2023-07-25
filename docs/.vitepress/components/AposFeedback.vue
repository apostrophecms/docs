<template>
  <!-- Based on https://github.com/ipfs/ipfs-docs-v2/blob/2a019d7c8abe99c21a3150752915ed278a4592ff/docs/.vuepress/theme/components/Feedback.vue -->
  <div class="feedback">
    <p class="feedback-heading" v-if="!voteSubmitted">
      {{ titleTxt }}
    </p>
    <div v-if="!voteSubmitted" class="feedback-actions">
      <button class="feedback-button yes" :title="yesTxt"
        v-on:click="sendFeedback(evtYes)"
      >
        <span>{{ yesTxt }}</span>
      </button>
      <button class="feedback-button" :title="noTxt"
        v-on:click="sendFeedback(evtNo)"
      >
        <span>{{ noTxt }}</span>
      </button>
    </div>
    <div v-if="thanksMessage" class="feedback-result">
      <p>{{ thanksMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vitepress'

export default {
  name: 'AposFeedback',
  setup() {
    const route = useRoute()

    const voteSubmitted = ref(false)
    const currentPath = ref('')
    const thanksMessage = ref('')
    const thanksTxt = ref('Thank you for your feedback.')
    const issueRequest = ref('Please open a Github issue with the link below to let us know what should be improved.')

    onMounted(() => {
      currentPath.value = route.path
    })

    return {
      voteSubmitted,
      currentPath,
      thanksMessage,
      thanksTxt,
      issueRequest,
    }
  },
  methods: {
    sendFeedback: function(evtType) {
      this.voteSubmitted = true;
      this.showThanks(evtType);

      if (!window.ga) {
        return;
      }

      window.ga('send', 'event', {
        eventCategory: evtType,
        eventAction: 'click',
        eventLabel: this.currentPath
      });
    },
    showThanks: function (evtType) {
      this.thanksMessage = evtType === 'unhelpful' ?
        `${this.thanksTxt} ${this.issueRequest}` : this.thanksTxt;
    }
  },
  watch: {
    '$route.path': function(path) {
      this.voteSubmitted = false;
      this.thanksMessage = '';
      this.currentPath = path;
    }
  },
  props: {
    titleTxt: {
      type: String,
      default: 'Was this information helpful?'
    },
    evtYes: {
      type: String,
      default: 'helpful'
    },
    evtNo: {
      type: String,
      default: 'unhelpful'
    },
    yesTxt: {
      type: String,
      default: 'Yes'
    },
    noTxt: {
      type: String,
      default: 'No'
    }
  }
}
</script>

<style lang="stylus" scoped>
@keyframes fadein {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.feedback {
  margin-top: 2rem;
  @media (min-width: var(--mq-mobile-narrow)) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-left: -1rem;
    margin-right: -1rem;
  }

  &-result {
    animation: fadein 0.5s;
    min-height: 38px;
    display: flex;
    align-items: center;

    * {
      margin: 0;
    }
  }
}

.feedback-heading, .feedback-actions {
  margin-left: 1rem;
  margin-right: 1rem;
}

.feedback-heading {
  font-weight: 700;

  @media (min-width: var(--mq-mobile-narrow)) {
    flex-shrink: 0;
  }
}

.feedback-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  gap: 10px;

  .feedback-button {
    width: 40%;
  }

  @media (min-width: var(--mq-mobile-narrow)) {
    display: block;

    .feedback-button:last-child {
      margin-top: 0;
    }
  }
}

.feedback-button {
  padding: 10px;
  border-width: 0;
  border-radius: 5px;
  background-color: var(--neutral-color);
  font-size: 12px;
  font-weight: 400;
  line-height: 0.7;
  letter-spacing: -0.03em;
  text-decoration: none;
  color: var(--text-color);
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s;

  &.yes {
    background-color: var(--accent-color);
    color: #fff;
  }

  > span {
    display: inline-block;
    border-style: solid;
    border-width: 1px 0;
    border-color: transparent;
  }

  &:hover, &:focus, &.is-hover {
    background-color: var(--accent-dark-color);

    span {
      border-bottom: 1px solid #fff;
    }
  }
}

.feedback-result {
  /* Constrain the width to prevent overly long text. */
  max-width: 32em;
}
</style>
