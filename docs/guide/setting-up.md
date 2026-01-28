---
title: Redirecting...
head:
  - - link
    - rel: canonical
      href: /docs/guide/development-setup.html
---

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, withBase } from 'vitepress'

const router = useRouter()
const targetPath = withBase('/guide/development-setup.html')

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