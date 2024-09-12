<template>
  <div :class="['ai-responses', { 'has-asked': hasAsked }]">
    <div v-if="isConnecting && !hasAsked" class="connecting-message-container">
      <p class="connecting-message">Connecting...</p>
    </div>
    <div v-if="!hasAsked" class="ai-empty-state">
      <div class="ai-mode">
        <div class="ai-content">
          <div class="ai-icon-group">
            <img src="../theme/images/ai-web.svg" alt="AI Icon" class="ai-icon" />
          </div>
          <p class="detail">More than just a list of links</p>
          <h2>Answers with context</h2>
          <p class="explainer">Documentation, code samples, community Q&A, and more goes into our AI-powered assistant.
            Fire away!</p>
        </div>
      </div>
    </div>
    <div v-else class="anchor-links-container">
      <div class="anchor-links">
        <button v-for="(result, index) in reversedAiResults" :key="index" @click="scrollToChatItem(index, true)">
          <InlineSvg src="/images/icons/question.svg" height="16" stroke="#6236ff" />
          {{ result.question }}
        </button>
      </div>
      <div class="anchor-mask"></div>
    </div>
    <div class="results-container">
      <ul class="results">
        <AposAINote v-if="hasAsked && aiResults.length === 1" />
        <li v-for="(result, index) in aiResults" :key="index" class="result" :id="'result-' + index">
          <div class="question">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" class="icon-svg">
              <circle cx="12" cy="12" r="11" stroke="#54636D" stroke-width="0.4px" fill="none" />
              <path fill="#b2adad"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            {{ result.question }}
          </div>
          <div class="answer-container">
            <div v-html="apostropheSvg" class="icon-svg"></div>
            <div class="content">
              <div v-if="result.loading" class="loading-animation">
                <svg width="60px" height="33px" viewBox="0 0 60 33" version="1.1" xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink">
                  <defs>
                    <path
                      d="M12.2162652,30.8264704 C14.4835771,32.2056926 17.1454299,33 19.9926547,33 L45.0073453,33 C53.2834356,33 60,26.2827956 60,17.996704 L60,15.003296 C60,6.71781857 53.2875598,0 45.0073453,0 L19.9926547,0 C11.7165644,0 5,6.71720443 5,15.003296 L5,17.996704 C5,19.7846283 5.31256736,21.499554 5.88600667,23.0897305 C4.73745897,24.0058789 4,25.4170337 4,27 C4,29.7558048 6.23857625,32 9,32 C10.2234619,32 11.3460861,31.5587793 12.2162652,30.8264704 Z M0,31 C0,29.8954305 0.887729645,29 2,29 C3.1045695,29 4,29.8877296 4,31 C4,32.1045695 3.11227036,33 2,33 C0.8954305,33 0,32.1122704 0,31 Z"
                      id="path-1"></path>
                    <mask id="mask-2" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="0" y="0"
                      width="60" height="33" fill="white">
                      <use xlink:href="#path-1"></use>
                    </mask>
                  </defs>
                  <g id="iOS" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="Newsbot---Asking-for-News" transform="translate(-10.000000, -312.000000)">
                      <g id="Chat" transform="translate(10.000000, -214.000000)">
                        <g id="Chat/Typing-Indicator" transform="translate(0.000000, 526.000000)">
                          <g id="Typing-Indicator">
                            <use id="Typing-indicator" stroke="#E4E9EC" mask="url(#mask-2)" stroke-width="2"
                              fill="#FFFFFF" xlink:href="#path-1"></use>
                            <g id="Dots" transform="translate(18.000000, 13.000000)" fill="#54636D">
                              <circle class="dot" cx="3.5" cy="3.5" r="3.5"></circle>
                              <circle class="dot" cx="14.5" cy="3.5" r="3.5"></circle>
                              <circle class="dot" cx="25.5" cy="3.5" r="3.5"></circle>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <div v-else v-html="result.answer"></div>
            </div>
          </div>
        </li>
        <li v-if="filterText && !aiResults.length && enableNoResults" class="no-results">
          {{ translate('modal.noResultsText') }} "<strong>{{ filterText }}</strong>"
        </li>
      </ul>
    </div>
    <div class="discord-link">
      <a href="https://discord.com/invite/HwntQpADJr" target="_blank">
        <span v-html="discordSvg"></span>
          More questions? Have something to show off? Join the ApostropheCMS Discord
      </a>
    </div>
    <div class="disclaimer">This feature is experimental and can make errors. To improve our service, the Apostrophe team reviews questions regularly. We kindly ask that you avoid sharing any sensitive information, such as API keys, credentials, or personal data.</div>
  </div>
</template>

<script setup>
import { defineProps, defineComponent, createApp, reactive, onMounted, inject, nextTick, ref, watch, computed, onBeforeUnmount } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import io from 'socket.io-client'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/base16/framer.css'
import { v4 as uuidv4 } from 'uuid'
import AposOGLink from './AposOGLink.vue'
import InlineSvg from 'vue-inline-svg';
import AposAINote from './AposAINote.vue'

const props = defineProps({
  filterText: String,
  enableNoResults: Boolean
})

const emit = defineEmits(['close'])

const hasAsked = ref(false)
const isConnecting = ref(true)
const initialQuery = ref('')

const aiResults = reactive([])

const reversedAiResults = computed(() => {
  return [...aiResults].reverse();
});

const state = reactive({
  socket: null,
  messages: []
})

// Get isAISearchActive from the parent component
const isAISearchActive = inject('isAISearchActive')

// Function to handle Enter key press
const handleKeyPress = (event) => {
  if (event.key === 'Enter' && isAISearchActive.value) {
    const query = event.target.value
    sendQuery(query)
    event.target.value = ''
    event.preventDefault() // Prevent default action to avoid normal search result selection
  }
}

// Helper function to get the correct element ID
const getElementId = (index, reversed = false) => {
  const actualIndex = reversed ? (aiResults.length - 1 - index) : index
  return 'result-' + actualIndex
}

const replaceLinksWithOgCards = (htmlContent, index) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const links = doc.querySelectorAll('a');

  links.forEach((link, linkIndex) => {
    const url = link.href;
    const placeholder = `OG-CARD-${index}-${linkIndex}`;
    const container = document.createElement('div');
    container.setAttribute('data-placeholder', placeholder);
    container.style.display = 'none';  // Hide the original link, optional based on your design

    // Replace link with the container
    link.parentNode.replaceChild(container, link);

    const updatedOgLinks = [
      ...(aiResults[index].ogLinks || []),
      { url, placeholder },
    ]

    // Store the URL and placeholder in the result object
    aiResults[index] = {
      ...aiResults[index],
      ogLinks: updatedOgLinks
    }
  })

  return doc.body.innerHTML;
}

const renderOgCards = (index) => {
  nextTick(() => {
    const result = aiResults[index]
    if (result && result.ogLinks) {
      result.ogLinks.forEach(({ url, placeholder }) => {
        const container = document.querySelector(`[data-placeholder="${placeholder}"]`)
        if (container) {
          const ogCard = document.createElement('div')
          const OgCardConstructor = defineComponent(AposOGLink)
          const ogCardInstance = createApp(OgCardConstructor, { url })
          ogCardInstance.mount(ogCard)
          container.replaceWith(ogCard)
        }
      })
    }
  })
}

const highlightSyntax = (index) => {
  nextTick(() => {
    const messageElement = document.getElementById('result-' + index)
    if (messageElement) {
      messageElement.querySelectorAll('pre code').forEach((block) => {
        // Check if the block is using the 'nunjucks' language
        if (block.classList.contains('language-nunjucks')) {
          // Change the class to use 'twig' for highlighting
          block.classList.replace('language-nunjucks', 'language-twig')
        }
        hljs.highlightElement(block)
      });
    }
  });
};

// Function to send query to the server
function sendQuery(query) {
  if (state.socket && query.trim() !== '') {
    hasAsked.value = true
    const index = appendQuestion(query)
    state.socket.emit('query', { query, index })
    nextTick(() => {
      scrollToChatItem(index)
    });
  }
}

// Function to append question to the results
const appendQuestion = (question) => {
  const newLength = aiResults.push({
    question,
    loading: true,
    answer: '',
    ogLinks: []
  })
  return newLength - 1
}

// Function to append messages to the chat
const appendAnswer = (answer, index) => {
  const htmlContent = marked.parse(answer)
  const modifiedHtmlContent = replaceLinksWithOgCards(htmlContent, index)
  aiResults[index].loading = false
  aiResults[index].answer = modifiedHtmlContent

  highlightSyntax(index)
  renderOgCards(index)
}

// Save results to session storage whenever they are updated
watch(aiResults, (newResults) => {
  sessionStorage.setItem('aiResults', JSON.stringify(newResults))
}, { deep: true })

// Function to scroll to the specific answer
const scrollToChatItem = (index, reversed = false) => {
  const elementId = getElementId(index, reversed)
  const element = document.getElementById(elementId)

  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const apostropheSvg = `
<svg width="100%" height="100%" viewBox="0 0 162 161" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <g id="Page-1">
        <g id="Group-2" transform="matrix(1,0,0,1,0.5,0)">
            <circle id="Oval" cx="80.5" cy="80.5" r="80.5" style="fill:white;"/>
            <path id="Oval-Copy-84-Copy" d="M114.979,97.805C123.504,96.541 130.424,90.247 132.5,81.869C134.576,73.491 131.396,64.687 124.45,59.577C117.504,54.468 108.165,54.064 100.806,58.555C93.446,63.047 89.521,71.544 90.869,80.07C91.718,85.624 94.735,90.613 99.257,93.939C103.778,97.265 109.434,98.656 114.979,97.805ZM113.917,91.066C108.14,92.069 102.331,89.477 99.213,84.504C96.095,79.531 96.287,73.164 99.698,68.388C103.109,63.612 109.064,61.375 114.769,62.725C120.475,64.075 124.8,68.745 125.717,74.545C127.01,82.37 121.728,89.765 113.917,91.066Z" style="fill:url(#_Linear1);fill-rule:nonzero;"/>
            <path id="Rectangle-Copy-64-Copy" d="M46.34,72.621L77.881,67.619C78.773,67.479 79.573,66.989 80.105,66.257C80.636,65.525 80.855,64.611 80.714,63.718L75.708,32.071C75.566,31.178 75.076,30.378 74.346,29.847C73.615,29.316 72.704,29.097 71.813,29.239L40.266,34.247C39.375,34.389 38.576,34.88 38.046,35.612C37.516,36.343 37.297,37.256 37.439,38.149L42.445,69.796C42.743,71.653 44.486,72.917 46.34,72.621ZM48.633,65.359L44.695,40.452L69.514,36.514L73.457,61.427L48.633,65.359Z" style="fill:url(#_Linear2);fill-rule:nonzero;"/>
            <path id="Triangle-Copy-15-Copy" d="M66.369,84.122L52.684,122.52C52.279,123.654 52.501,124.918 53.269,125.845C54.037,126.772 55.236,127.224 56.423,127.035L94.938,120.927C96.124,120.736 97.122,119.934 97.565,118.815C98.008,117.697 97.831,116.428 97.099,115.474L72.269,83.202C71.511,82.214 70.276,81.719 69.047,81.911C67.818,82.102 66.791,82.95 66.369,84.122ZM70.684,92.292L88.204,115.065L61.027,119.382L70.684,92.292Z" style="fill:url(#_Linear3);fill-rule:nonzero;"/>
        </g>
        <g transform="matrix(1.20149,0,0,1.22901,-19.9254,-23.3511)">
            <ellipse cx="84" cy="84.5" rx="67" ry="65.5" style="fill:none;stroke:black;stroke-width:0.82px;"/>
        </g>
    </g>
    <defs>
        <linearGradient id="_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-21.0925,36.7388,-36.7388,-21.0925,122.201,58.4032)"><stop offset="0" style="stop-color:rgb(204,147,0);stop-opacity:1"/><stop offset="0.47" style="stop-color:rgb(234,67,58);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(179,39,191);stop-opacity:1"/></linearGradient>
        <linearGradient id="_Linear2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-17.1042,47.3137,-47.3137,-17.1042,67.6284,27.2795)"><stop offset="0" style="stop-color:rgb(204,147,0);stop-opacity:1"/><stop offset="0.26" style="stop-color:rgb(234,67,58);stop-opacity:1"/><stop offset="0.47" style="stop-color:rgb(179,39,191);stop-opacity:1"/><stop offset="0.76" style="stop-color:rgb(102,102,255);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(0,191,154);stop-opacity:1"/></linearGradient>
        <linearGradient id="_Linear3" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(30.4842,-31.4592,31.4592,30.4842,55.9312,128.311)"><stop offset="0" style="stop-color:rgb(179,39,191);stop-opacity:1"/><stop offset="0.47" style="stop-color:rgb(102,102,255);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(0,192,154);stop-opacity:1"/></linearGradient>
    </defs>
</svg>
`

const discordSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#6236ff" class="bi bi-discord" viewBox="0 0 16 16">
  <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
</svg>
`

onKeyStroke('Escape', () => {
  emit('close')
})


onMounted(() => {
  let sessionId = sessionStorage.getItem('user_session_id')
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('user_session_id', sessionId)
  }

  // Restore AI results from sessionStorage
  const storedResults = sessionStorage.getItem('aiResults')
  if (storedResults) {
    const results = JSON.parse(storedResults)
    results.forEach((result, index) => {
      aiResults.push(result)
      highlightSyntax(index)
      renderOgCards(index)
      hasAsked.value = true
    })
  }

  const websocketURLs = {
    'docs-staging.apos.dev': 'https://chatbot-staging.apos.dev',
    'docs.apostrophecms.org': 'https://chatbot.apos.dev'
  };

  // Get the current hostname
  const currentHostname = window.location.hostname;

  // Determine the WebSocket server URL based on the current hostname
  const socketURL = websocketURLs[currentHostname] || 'http://localhost:3000';

  // Connect to the socket.io server
  state.socket = io.connect(socketURL , {
    query: {
      user_session_id: sessionId
    }
  });

  state.socket.on('session_id', (data) => {
    sessionStorage.setItem('user_session_id', data.user_session_id)
  });

  state.socket.on('connect', () => {
    console.log('User connected with session: ', sessionId)
    isConnecting.value = false; // Update the connection status
    if (initialQuery.value && !hasAsked.value) {
      sendQuery(initialQuery.value)
      initialQuery.value = '';
    }
  });

  // Check if there's a filter text to send as an initial query
  if (props.filterText && !hasAsked.value) {
    isConnecting.value = true; // Show the connecting message
    initialQuery.value = props.filterText;
    props.filterText = ''; // Clear the filter text to avoid submitting "Connecting..."
  }

  state.socket.on('answer', (answer) => {
    appendAnswer(answer.text, answer.index)
  });

  state.socket.on('error', (error) => {
    console.error('Error:', error)
  });

  const searchBar = document.getElementById('query-input');
  if (searchBar) {
    searchBar.addEventListener('keypress', handleKeyPress);
  }
});

// Function to clear results
const clearResults = () => {
  aiResults.length = 0
  sessionStorage.removeItem('user_session_id')
  sessionStorage.removeItem('aiResults')
  sessionStorage.removeItem('vitepress:search-type')
  
  hasAsked.value = false
  // Emitting an event to clear the session on the server
  state.socket.emit('clear_session');
}

window.addEventListener('beforeunload', () => {
    clearResults()
  })

onBeforeUnmount(() => {
  console.log('Socket disconnected on component unmount');
})
</script>

<style scoped>
.bold {
  font-weight: bold;
}

.answer-container .content :deep(p) {
  margin-bottom: 15px;
}

.answer-container .content :deep(h3) {
  font-weight: 600;
  font-size: 20px;
  margin: 8px 0 5px;
}

.answer-container .content :deep(h4) {
  font-weight: 600;
  font-size: 16px;
  margin: 8px 0 5px;
}

.answer-container .content :deep(pre) {
  font-size: 14px;
  margin: 20px 0 40px;
}

.answer-container .content :deep(code:not(pre code)) {
  background-color: #F6F6F6;
  border: 1px solid #DADADA;
  color: #C01443;
  padding: 2px 4px;
  border-radius: 5px;
  font-size: 90%;
  font-weight: 400;
}

.dark .answer-container .content :deep(code:not(pre code)) {
  background-color: #414141;
  border-color: #616161;
  color: #ff5180;
}

/* Question container styles */
.answer-container {
  display: flex;
  align-items: flex-start;
  gap: 5px;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Question icon styles */
.icon-svg {
  vertical-align: middle;
  margin-right: 8px;
  width: 32px;
  height: 32px;
}

.question {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* loading animation styles */
.dot {
  fill: #54636D;
  position: relative;
  transform-origin: 50% 50%;
  animation: ball-beat 0.7s 0s infinite cubic-bezier(0.50, 0.05, 0.50, 0.95);
}

.dot:nth-child(2) {
  animation-delay: 0.2s !important;
}

.dot:nth-child(3) {
  animation-delay: 0.4s !important;
}

.dark .dot {
  fill: #e7eff4;
}

@keyframes ball-beat {
  0% {
    opacity: 0.7;
  }

  33.33% {
    opacity: 0.55;
  }

  66.67% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
}


.ai-responses {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.ai-mode {
  text-align: center;
  padding: 20px;
}

.ai-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ai-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex: 1;
}

.detail {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  margin-bottom: 5px;
}

.ai-icon-group {
  margin-bottom: 30px;
  max-width: 170px;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.explainer {
  font-size: 16px;
  line-height: 1.3;
  max-width: 440px;
}

.anchor-links-container {
  position: sticky;
  top: 0;
  padding: 10px 0;
  z-index: 10;
  /* High z-index to keep it above other content */
  display: flex;
  align-items: stretch;
}

.connecting-message-container {
  text-align: center;
  margin-top: 20px;
}

.connecting-message {
  font-size: 18px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    color: #000;
  }
  50% {
    color: #6236ff;
  }
  100% {
    color: #000;
  }
}

.results-container {
  overflow-y: auto;
  flex-grow: 1;
  height: calc(100% - 50px);
  padding: 0px 50px 20px;
  display: none;
}

.has-asked .results-container {
  display: block;
}

.has-asked .ai-empty-state {
  display: none;
}

.anchor-links {
  z-index: 10;
  position: relative;
  display: flex;
  top: 0;
  flex: 1;
  justify-content: start;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 2px 100px 10px 0;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}

.dark .anchor-links {
  border-color: #333;

}

.anchor-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  pointer-events: none;
  z-index: 20;
}

.dark .anchor-mask {
  background: linear-gradient(to right, rgb(0 0 0 / 0%), rgb(26 28 30));
}

.anchor-links button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 0 5px;
  height: 30px;
  cursor: pointer;
  border-radius: 40px;
  padding: 0 10px 0 8px;
  border: 1px solid #6236ff;
  color: black;
  font-weight: 500;
  line-height: 0.8;
  font-size: 12px;
  outline: 2px solid #6236ff31;
  transition: all 0.3s ease-in-out;
}

.dark .anchor-links button {
  color: white;
  background-color: #6236ff;
}

.dark .anchor-links button:hover {
  background-color: #481fd7;
}

.dark .anchor-links button svg {
  stroke: white;
}

.anchor-links button:hover {
  background-color: #e2d9ff4d;
}

.icon-svg.chat-bubble-icon {
  display: inline;
  vertical-align: middle;
  margin-right: 8px;
  width: 28px;
  height: 20px;
  /* Adjust dimensions if necessary */
  fill: transparent;
  /* Use the current font color */
  stroke: white;
  /* White stroke for the outline */
  stroke-width: 1;
  /* Adjust the stroke width as needed */
}

/* Clear history button */
.clear-button {
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.clear-button:hover {
  background-color: #c82333;
}

.results {
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
}

.result {
  margin-top: 50px;
  padding: 20px 10px 10px;
  border-top: 1px solid #ddd;
}

.result:first-child {
  margin-top: 10px;
  border-top: none;
}

.result .question {
  font-weight: 500;
  margin-bottom: 30px;
}

.loading-animation {
  text-align: center;
  font-style: italic;
}

.dark #Typing-indicator {
  fill: #3a3d40;
  stroke: #5e5e5e;
}

.no-results {
  padding: 10px;
  text-align: center;
  color: #666;
}

.discord-link {
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-top: 10px;
  /* Adjust margin as needed */
}

.discord-link a {
  display: flex;
  align-items: center;
  padding: 10px;
  /* Adjust the color to match your theme */
  border-radius: 30px;
  /* Optional: set a background color */
  color: black;
  /* Adjust the text color to match your theme */
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  background-color: #e2d9ff66;
  margin: 10px 0;
}

.discord-link a:hover {
  background-color: #d2c7f5;
}

.discord-link span {
  vertical-align: middle;
  margin-right: 8px;
  /* Space between icon and text */
}

.dark .discord-link a {
  background-color: #ded4fff0;
}

.bold {
  font-weight: bold;
  display: block;
  /* Makes the span take the full width as a block element */
  margin-bottom: 10px;
  /* Space between the text and the link */
}

.disclaimer {
  font-size: 12px;
  color: #595858;
  text-align: center;
  margin-top: 10px;
  max-width: 570px;
  margin: 10px auto 0;
  line-height: 1.2;
}
</style>
