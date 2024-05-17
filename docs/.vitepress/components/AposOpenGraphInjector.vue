<script>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vitepress';

export default {
  name: 'AposOpenGraphInjector',
  functional: true,
  render: () => null,
  setup() {
    const route = useRoute();

    const updateOpenGraphTags = () => {
      // Delay to ensure elements are rendered
      setTimeout(() => {
        const contentElement = document.querySelector('.main');

        if (contentElement) {
          // Remove existing Open Graph meta tags
          const existingMetaTags = document.querySelectorAll('meta[name="og:title"], meta[name="og:description"]');
          existingMetaTags.forEach(tag => tag.remove());

          // For the og:description
          let paragraphs = contentElement.querySelectorAll('p');
          let firstParagraph = paragraphs[0] ? paragraphs[0].textContent : '';
          let summary = firstParagraph.substring(0, 155).trim();

          const metaTagDescription = document.createElement('meta');
          metaTagDescription.name = 'og:description';
          metaTagDescription.content = summary;
          document.getElementsByTagName('head')[0].appendChild(metaTagDescription);

          // For the og:title
          let firstH1 = contentElement.querySelector('h1');
          if (firstH1) {
            const title = firstH1.textContent.trim().replace(/\u200B/g, '');  // Remove zero-width space

            const metaTagTitle = document.createElement('meta');
            metaTagTitle.name = 'og:title';
            metaTagTitle.content = title;
            document.getElementsByTagName('head')[0].appendChild(metaTagTitle);
          }
        }
      }, 0);  // Zero timeout to ensure execution after all other pending operations
    };


    onMounted(() => {
      updateOpenGraphTags();
    });

    watch(route, () => {
      updateOpenGraphTags();
    });

    return {};
  }
}
</script>