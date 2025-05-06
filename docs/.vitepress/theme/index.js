// https://vitepress.dev/guide/custom-theme
import { h, onMounted } from 'vue';
import Theme from 'vitepress/theme';
import './style.css';
import './styles/index.styl';
import AposCodeBlock from '../components/AposCodeBlock.vue';
import AposTooltip from '../components/AposTooltip.vue';
import AposTag from '../components/AposTag.vue';
import AposRefExtends from '../components/AposRefExtends.vue';
import AposFeedback from '../components/AposFeedback.vue';
import EditOrIssue from '../components/EditOrIssue.vue';
import AposTwoColumns from '../components/AposTwoColumns.vue';
import AposCtaButton from '../components/AposCtaButton.vue';
import AposVideoSidebar from '../components/AposVideoSidebar.vue';
import { createEventBus } from './eventBus';
import { setupUpdateChecker } from '../helpers/updateChecker';

export const eventBus = createEventBus();
export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'aside-outline-after': () => [
        h(AposVideoSidebar),
        h(AposFeedback),
        h(EditOrIssue)
      ]
    });
  },
  // In your enhanceApp function:
  enhanceApp({ app, router, siteData }) {
    // Your existing component registrations
    app.component('AposCodeBlock', AposCodeBlock);
    app.component('AposTooltip', AposTooltip);
    app.component('AposTag', AposTag);
    app.component('AposRefExtends', AposRefExtends);
    app.component('AposTwoColumns', AposTwoColumns);
    app.component('AposCtaButton', AposCtaButton);
    if (typeof window !== 'undefined') {
      setupUpdateChecker();
    }
  }
};
