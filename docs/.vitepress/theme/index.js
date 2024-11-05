// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import './style.css';
import './styles/index.styl';
import AposCodeBlock from '../components/AposCodeBlock.vue';
import AposTag from '../components/AposTag.vue';
import AposRefExtends from '../components/AposRefExtends.vue';
import AposFeedback from '../components/AposFeedback.vue';
import EditOrIssue from '../components/EditOrIssue.vue';
import AposTwoColumns from '../components/AposTwoColumns.vue';
import AposCtaButton from '../components/AposCtaButton.vue';
import AposVideoSidebar from '../components/AposVideoSidebar.vue';
import { createEventBus } from './eventBus';

export const eventBus = createEventBus();
export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'aside-outline-after': () => [h(AposVideoSidebar), h(AposFeedback), h(EditOrIssue)]
    });
  },
  enhanceApp({ app, router, siteData }) {
    // register your custom global components
    app.component('AposCodeBlock', AposCodeBlock);
    app.component('AposTag', AposTag);
    app.component('AposRefExtends', AposRefExtends);
    app.component('AposTwoColumns', AposTwoColumns);
    app.component('AposCtaButton', AposCtaButton);
  }
};
