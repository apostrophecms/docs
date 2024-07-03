import { ref } from 'vue';
import axios from 'axios';
import { load } from 'cheerio';

export function useOgData() {
  const ogData = ref(null);
  const isLoading = ref(false);
  const ogError = ref(null);

  const fetchOgData = async (url) => {
    isLoading.value = true;
    ogError.value = null;
    // Use the AllOrigins proxy to bypass CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    try {
      const response = await axios.get(proxyUrl);
      const content = response.data.contents;
      const $ = load(content);
      const parsedData = {
        ogTitle: $('meta[property="og:title"]').attr('content') || '',
        ogDescription: $('meta[property="og:description"]').attr('content') || '',
        ogImage: $('meta[property="og:image"]').attr('content') || '',
        url
      };

      ogData.value = parsedData;
    } catch (err) {
      ogError.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    ogData,
    isLoading,
    error: ogError,
    fetchOgData
  };
};
