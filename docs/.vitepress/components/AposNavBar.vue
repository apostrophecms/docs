<script lang="ts" setup>
import { computed } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import { useSidebar } from 'vitepress/theme'
import VPNavBarTitle from 'vitepress/dist/client/theme-default/components/VPNavBarTitle.vue'
import VPNavBarSearch from 'vitepress/dist/client/theme-default/components/VPNavBarSearch.vue'
import VPNavBarMenu from 'vitepress/dist/client/theme-default/components/VPNavBarMenu.vue'
import VPNavBarTranslations from 'vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue'
import VPNavBarAppearance from 'vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue'
import VPNavBarSocialLinks from 'vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue'
import VPNavBarExtra from 'vitepress/dist/client/theme-default/components/VPNavBarExtra.vue'
import VPNavBarHamburger from 'vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue'

defineProps<{
  isScreenOpen: boolean
}>()

defineEmits<{
  (e: 'toggle-screen'): void
}>()

const { y } = useWindowScroll()
const { hasSidebar } = useSidebar()

const classes = computed(() => ({
  'has-sidebar': hasSidebar.value,
  fill: y.value > 0
}))
</script>

<template>
  <div class="VPNavBar" :class="classes">
    <div class="container">
      <div class="title">
        <VPNavBarTitle>
          <template #nav-bar-title-before><slot name="nav-bar-title-before" /></template>
          <template #nav-bar-title-after><slot name="nav-bar-title-after" /></template>
        </VPNavBarTitle>
      </div>

      <div class="content">
        <div class="curtain" />
        <div class="content-body">
          <div class="apos-custom-navbar apos-top-navbar">
              <VPNavBarSearch class="search" />
              <VPNavBarMenu class="menu" />
              <VPNavBarAppearance class="appearance" />
              <VPNavBarSocialLinks class="social-links" />
              <VPNavBarTranslations class="translations" />
              <VPNavBarExtra class="extra" />
              <slot name="nav-bar-content-after" />
              <VPNavBarHamburger class="hamburger" :active="isScreenOpen" @click="$emit('toggle-screen')" />
            <!-- <div class="apos-top-navbar-group apos-top-navbar-group--left">
              
              <slot name="nav-bar-content-before" />
            </div>
            <div class="apos-top-navbar-group apos-top-navbar-group--right">

            </div> -->
          </div>
          <div class="apos-custom-navbar apos-bottom-navbar">
            <slot name="apos-bottom-navbar-before" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPNavBar {
  position: relative;
  /* border-bottom: 1px solid transparent; */
  padding: 0 8px 0 24px;
  height: calc(var(--vp-nav-height) + 30px);
  pointer-events: none;
  white-space: nowrap;
  /* padding-top: 30px; */
}

@media (min-width: 640px) {
  .VPNavBar {
    padding-top: 15px;
  }
}

@media (min-width: 768px) {
  .VPNavBar {
    padding: 0 32px;
  }
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar {
    padding: 0;
  }

  .VPNavBar.fill:not(.has-sidebar) {
    border-bottom-color: var(--vp-c-gutter);
    background-color: var(--vp-nav-bg-color);
  }
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: calc(var(--vp-layout-max-width) - 64px);
  height: calc(var(--vp-nav-height) + 30px);
  pointer-events: none;
}

.container > .title,
.container > .content {
  pointer-events: none;
}

.container :deep(*) {
  pointer-events: auto;
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .container {
    max-width: 100%;
    background-color: var(--vp-sidebar-bg-color);
    border-bottom: 1px solid var(--vp-c-divider);
  }
}

.apos-spacing-bar {
  height: 30px;
}

.title {
  flex-shrink: 0;
  height: var(--vp-nav-height);
  transition: background-color 0.5s;
}

.VPNavBar .title {
  margin-top: 15px;
}

@media (min-width: 640px) {
  .VPNavBar .title {
    margin-top: 0;
  }
}

@media (min-width: 768px) {
  .VPNavBar .title {
    margin-top: 15px;
  }
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .title {
    position: absolute;
    top: 15px;
    left: 0;
    margin-top: 0;
    z-index: 2;
    padding: 0 32px;
    width: var(--vp-sidebar-width);
    height: var(--vp-nav-height);
    background-color: transparent;
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .title {
    padding-left: max(32px, calc((100% - (var(--vp-layout-max-width) - 64px)) / 2));
    width: calc((100% - (var(--vp-layout-max-width) - 64px)) / 2 + var(--vp-sidebar-width) - 32px);
  }
}

.content {
  flex-grow: 1;
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .content {
    position: relative;
    z-index: 1;
    /* padding-right: 32px; */
    padding-left: var(--vp-sidebar-width);
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .content {
    padding-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
  }
}

/* @media (min-width: 640px) { */
.VPNavBar .content {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
/* } */

@media (min-width: 640px) {
  .VPNavBar .content {
    margin-top: 0;
  }
}

@media (min-width: 960px) {
  .content-body {
    border-bottom: 1px solid var(--vp-c-divider);
  }
}

@media (min-width: 768px) {
  .content-body {
    width: 100%;
  }
}

.content-body {
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  align-items: center;
  height: calc(var(--vp-nav-height) + 30px);
  transition: background-color 0.5s;
  padding-top: 30px;
  padding-right: 32px;
  padding-bottom: 10px;
}

.apos-custom-navbar {
  display: flex;
  /* flex: 1 0; */
  width: 100%;
  justify-content: flex-end;
}

.apos-top-navbar {
  height: 40px;
}

.menu + .translations::before,
.menu + .appearance::before,
.menu + .social-links::before,
.translations + .appearance::before,
.appearance + .social-links::before {
  margin-right: 8px;
  margin-left: 8px;
  width: 1px;
  height: 24px;
  background-color: var(--vp-c-divider);
  content: "";
}

.menu + .appearance::before,
.translations + .appearance::before {
  margin-right: 16px;
}

.appearance + .social-links::before {
  margin-left: 16px;
}

.social-links {
  margin-right: -8px;
}
@media (min-width: 960px) {
  .VPNavBar.has-sidebar .content-body,
  .VPNavBar.fill .content-body {
    position: relative;
    background-color: var(--vp-nav-bg-color);
  }
}

@media (max-width: 768px) {
  .content-body {
    column-gap: 0.5rem;
    padding: 0;
    height: var(--vp-nav-height);
    flex-direction: row;
  }

  .apos-custom-navbar {
    display: flex;
    flex-direction: row;  /* change from column to row */
  }

  .apos-top-navbar {
    display: flex;
    justify-content: center;  /* center the content */
    width: 30%;  /* take up 30% of the navbar */
    height: auto;
  }

  .apos-bottom-navbar {
    display: flex;
    justify-content: center;  /* center the content */
    width: 70%;  /* take up 70% of the navbar */
  }
}

@media (min-width: 960px) {
  .VPNavBar.has-sidebar .curtain {
    position: absolute;
    right: 0;
    bottom: -31px;
    width: calc(100% - var(--vp-sidebar-width));
    height: 32px;
  }

  .VPNavBar.has-sidebar .curtain::before {
    display: block;
    width: 100%;
    height: 32px;
    background: linear-gradient(var(--vp-c-bg), transparent 70%);
    content: "";
  }
}

@media (min-width: 1440px) {
  .VPNavBar.has-sidebar .curtain {
    width: calc(100% - ((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width)));
  }
}

.apos-top-navbar-group {
  display: flex;
  align-items: center;
  height: 40px;
  align-content: center;
}



</style>
