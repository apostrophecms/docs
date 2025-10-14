// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
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
import AposTutorialFilter from '../components/AposTutorialFilter.vue';
import { setupUpdateChecker } from '../helpers/updateChecker';
import { setupYouTubeTracking } from '../helpers/youtubeTracking';
import { setupAnchorFix } from '../helpers/anchorFix';

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
  enhanceApp({
    app, router, siteData
  }) {
    app.component('AposCodeBlock', AposCodeBlock);
    app.component('AposTooltip', AposTooltip);
    app.component('AposTag', AposTag);
    app.component('AposRefExtends', AposRefExtends);
    app.component('AposTwoColumns', AposTwoColumns);
    app.component('AposCtaButton', AposCtaButton);
    app.component('AposTutorialFilter', AposTutorialFilter);

    let anchorFixCleanup = null;

    if (typeof window !== 'undefined') {
      setupUpdateChecker();
      anchorFixCleanup = setupAnchorFix();
    }
    // Initialize YouTube tracking after client-side navigation
    if (typeof window !== 'undefined') {
      // Setup tracking after initial page load
      window.addEventListener('DOMContentLoaded', () => {
        setupYouTubeTracking();
      });

      // Setup tracking after route changes
      router.onAfterRouteChanged = () => {
        setTimeout(setupYouTubeTracking, 200);

        // Re-setup anchor fix after route changes to handle new content
        if (anchorFixCleanup) {
          anchorFixCleanup();
        }
        anchorFixCleanup = setupAnchorFix();
      };
    }
  }
};
