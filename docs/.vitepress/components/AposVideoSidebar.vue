<template>
  <div class="video-sidebar" v-if="videos.length > 0">
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
import { onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';
export default {
  name: 'AposVideoSidebar',
  setup() {
    const dataObject = useData();
    const pageData = dataObject.page.value;
    // Reactive reference for videos array
    const videos = ref([]);

    // Function to generate thumbnail URL
    const videoThumbnail = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    // Function to update videos based on the page's frontmatter
    const updateVideos = () => {
      // Ensure that videoList exists and is an array
      if (pageData.frontmatter.videoList && Array.isArray(pageData.frontmatter.videoList)) {
        videos.value = pageData.frontmatter.videoList.map(video => ({
          ...video,
          thumbnail: videoThumbnail(video.id) // Add thumbnail property dynamically
        }));
      } else {
        videos.value = [];
      }
    };

    // On component mount and page data change
    onMounted(updateVideos);
    watch(
      () => dataObject.page.value.frontmatter.videoList,
      (newList, oldList) => {
        console.log('Old List:', oldList);
        console.log('New List:', newList);
        updateVideos();
      },
      { deep: true }
    );

    return { videos, videoThumbnail };
  }
}
</script>

<style scoped>
.video-sidebar ul {
  list-style: none;
  padding: 0;
}

.video-sidebar li {
  margin-bottom: 10px;
}

.video-sidebar img {
  width: 100px;
}

.video-sidebar a {
  text-decoration: none;
  color: black;
}
</style>
