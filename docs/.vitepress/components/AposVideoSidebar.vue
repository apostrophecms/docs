<template>
  <section class="video-sidebar" v-if="hasVideos">
    <h3 class="video-sidebar__header">Videos on this page</h3>
    <ul class="video-sidebar__items">
      <li class="video-sidebar__item" v-for="video in videos" :key="video.id">
        <a class="video-sidebar__link" :href="video.link">
          <p class="video-sidebar__title">{{ video.title }}</p>
          <img class="video-sidebar__thumb"  :src="videoThumbnail(video.id)" :alt="video.title">
        </a>
      </li>
    </ul>
  </section>
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

    onMounted(() => {
      updateVideos();  // Initial load
    });

    return { videos, hasVideos, videoThumbnail };
  },
};
</script>

<style lang="stylus" scoped>

  .video-sidebar__header {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .video-sidebar__items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .video-sidebar__title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 0.15rem;
  }

  .video-sidebar__link:hover {
    color: var(--vp-c-brand);

    .video-sidebar__thumb {
      outline: 4px solid var(--vp-c-brand);
      outline-offset: -4px;
    }
  }
</style>
