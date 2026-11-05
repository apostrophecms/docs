---
title: Moved to Converting a premade HTML template for use in an ApostropheCMS Project
head:
  - - link
    - rel: canonical
      href: /docs/tutorials/html-conversion.html
  - - meta
    - name: robots
      content: noindex
---

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, withBase } from 'vitepress'

const router = useRouter()
const targetPath = withBase('/tutorials/html-conversion.html')

onMounted(() => {

  setTimeout(() => {
    window.location.href = targetPath
  }, 0)
})
</script>

  <div class="redirect-page">
    <h1>Redirecting...</h1>
    <p>
      You are being redirected to the new page.
      If you are not redirected automatically, 
      <a :href="targetPath">click here</a>.
    </p>
  </div>

<style scoped>
.redirect-page {
  padding: 2rem;
  text-align: center;
}
</style>