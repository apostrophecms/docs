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
import { computed, onMounted, ref, watch } from 'vue';
import { useData, onContentUpdated } from 'vitepress';
export default {
  setup() {
    const dataObject = useData()
    const pageData = dataObject.page.value

    watch(
      () =>
    )
  },
  data() {
    return {
      videos: []
    };
  },
  created() {
    this.updateVideos();
  },
  computed: {
    hasVideos() {
      console.log(this.videos.length)
      return this.videos.length > 0;
    }
  },
  methods: {
    updateVideos() {
      this.videos = this.$frontmatter.videoList || [];
    },
    videoThumbnail(id) {
      return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }
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