<template>
  <div class="video-sidebar" v-if="hasVideos">
    <ul>
      <li v-for="video in videos" :key="video.id">
        <a :href="video.link">
          <span>{{ video.title }}</span>
          <img :src="videoThumbnail(video.id)" :alt="video.title">
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { computed, onMounted, shallowRef, watchEffect } from 'vue';
import { useData, onContentUpdated } from 'vitepress';

export default {
  setup() {
    const { frontmatter } = useData();
    const videos = shallowRef([]);

    const hasVideos = computed(() => videos.value.length > 0);

    const updateVideos = () => {
      videos.value = frontmatter.value.videoList || [];
    };

    const videoThumbnail = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    watchEffect(() => {
      updateVideos();
    });

    //onContentUpdated(updateVideos);

    onMounted(() => {
      updateVideos();  // Initial load
    });

    return { videos, hasVideos, videoThumbnail };
  },
};
</script>
