<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData } from 'vitepress/dist/client/theme-default/composables/data'
import type { DefaultTheme } from 'vitepress/theme'
import { useSidebarControl } from 'vitepress/dist/client/theme-default/composables/sidebar'
import VPIconChevronRight from 'vitepress/dist/client/theme-default/components/icons/VPIconChevronRight.vue'
import VPLink from 'vitepress/dist/client/theme-default/components/VPLink.vue'
import AposSidebarIcon from './AposSidebarIcon.vue'
import { onBeforeUnmount, onUnmounted } from 'vue'

const { page } = useData();

watch(page, newValue => {
  myIsActive.value = normalizePath(newValue.relativePath) === normalizePath(props.item.link);
  if (props.item.items) {
    const hasActiveChild = checkForActivePage(props.item.items, newValue);
    myCollapsed.value = (!hasActiveChild && !myIsActive.value);
    myHasActive.value = hasActiveChild;

    // if the item has been configured not to collapse, then don't collapse it
    if (props.item.collapsed === false) {
      myCollapsed.value = false;
    }
  }
})

onBeforeUnmount(() => {
  console.log('Component is about to be unmounted');
});
onUnmounted(() => {
  console.log('Component has been unmounted');
});

const props = defineProps<{
  item: DefaultTheme.SidebarItem & { break?: boolean }
  depth: number
}>()

const {
  collapsible,
  collapsed,
  isLink,
  isActiveLink,
  hasActiveLink,
  hasChildren,
  toggle
} = useSidebarControl(computed(() => props.item));
const myCollapsed = ref(false);
const myIsActive = ref(false);
const myHasActive = ref(false);
myIsActive.value = page.value.relativePath === props.item.link;

const sectionTag = computed(() => hasChildren.value ? 'section' : `div`)

const linkTag = computed(() => isLink.value ? 'a' : 'div')

const textTag = computed(() => {
  return !hasChildren.value
    ? 'p'
    : props.depth + 2 === 7 ? 'p' : `h${props.depth + 2}`
})

const itemRole = computed(() => isLink.value ? undefined : 'button')

function checkForActivePage(items, page) {
  let hasActiveChild = false;
  items.forEach(item => {
    if (page.relativePath === item.link) {
      hasActiveChild = true;
    }
    if (item.items) {
      hasActiveChild = hasActiveChild || checkForActivePage(item.items, page);
    }
  });
  return hasActiveChild;
}

let hasActiveChild = false;
if (props.item.items) {
  hasActiveChild = checkForActivePage(props.item.items, page.value);
}
myCollapsed.value = props.item.items ? (!hasActiveChild) : null;
myHasActive.value = hasActiveChild;

// if the item has been configured not to collapse, then don't collapse it
if (props.item.collapsed === false) {
  myCollapsed.value = false;
}

const classes = computed(() => [
  [`level-${props.depth}`],
  { collapsible: collapsible.value },
  { collapsed: myCollapsed.value },
  { 'is-link': isLink.value },
  { 'is-active': myIsActive.value },
  { 'has-active': myHasActive.value }
])

function onItemInteraction(e: MouseEvent | Event) {
  if ('key' in e && e.key !== 'Enter') {
    return
  }
  !props.item.link && myToggle()
}

function onCaretClick() {
  props.item.link && myToggle()
}

function onLinkClick(e: MouseEvent) {
  if (props.item.items) {
    // prevent following the link when the item can be toggled
    e.preventDefault()
    myToggle()
  }
}

function myToggle() {
  myCollapsed.value = !myCollapsed.value;
}

function normalizePath(path) {
  // Check for undefined, null, or empty string
  if (!path) return '';

  // Remove leading '/'
  if (path.startsWith('/')) {
    path = path.substring(1);
  }

  // Remove 'index.md' if it exists
  if (path.endsWith('index.md')) {
    path = path.substring(0, path.length - 'index.md'.length);
  }

  // Remove trailing '/'
  if (path.endsWith('/')) {
    path = path.substring(0, path.length - 1);
  }

  return path;
}

</script>

<template>
  <component :is="sectionTag" class="VPSidebarItem" :class="classes">
    <hr v-if="item.break || (item?.items && item.items[0] && item.items[0].break)">
    <div v-else>
      <div v-if="item.text" class="item" :role="itemRole"
        v-on="item.items ? { click: onItemInteraction, keydown: onItemInteraction } : {}" :tabindex="item.items && 0">
        <div class="indicator" />

        <div v-if="myCollapsed != null" class="caret" role="button" aria-label="toggle section" @click="onCaretClick"
          @keydown.enter="onCaretClick" tabindex="0">
          <VPIconChevronRight class="caret-icon" />
        </div>
        <div v-else class="apos-caret-placeholder" />
        <VPLink v-if="item.link" :tag="linkTag" :href="item.link" @click="onLinkClick" class="link">
          <AposSidebarIcon v-if="item.icon" :name="item.icon" />
          <component :is="textTag" class="text" v-html="item.text" />
        </VPLink>
        <span v-else class="item-wrapper">
          <AposSidebarIcon v-if="item.icon" :name="item.icon" />
          <component :is="textTag" class="text" v-html="item.text" />
        </span>

      </div>

      <div v-if="item.items && item.items.length" class="items">
        <template v-if="depth < 5">
          <AposSidebarItem v-for="i in item.items" :key="i.text" :item="i" :depth="depth + 1" />
        </template>
      </div>
    </div>
  </component>
</template>


<style scoped lang="scss">
hr {
  border: none;
  border-bottom: 1px solid var(--vp-c-divider);
}

.collapsible:not(.collapsed) .VPSidebarItem {
  &.level-1 .item .apos-caret-placeholder {
    width: 24px;
  }
}

.VPSidebarItem.level-0 {
  padding-bottom: 24px;
}

.item {
  position: relative;
  display: flex;
  width: 100%;
}

.VPSidebarItem.collapsible>.item {
  cursor: pointer;
}

.indicator {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: -17px;
  width: 1px;
  transition: background-color 0.25s;
}

.VPSidebarItem.level-2.is-active>.item>.indicator,
.VPSidebarItem.level-3.is-active>.item>.indicator,
.VPSidebarItem.level-4.is-active>.item>.indicator,
.VPSidebarItem.level-5.is-active>.item>.indicator {
  background-color: var(--vp-c-brand);
}

.VPSidebarItem.is-active:not(.level-0) .item .link {

  &,
  .text {
    color: var(--vp-c-brand) !important;
    font-weight: 600 !important;
  }
}

.VPSidebarItem.is-active.level-0>div>.item .link {

  &,
  .text {
    color: var(--vp-c-brand) !important;
    font-weight: 600 !important;
  }
}

.VPSidebarItem .link,
.VPSidebarItem .item-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;

  &:hover {

    &,
    .text,
    & :deep svg path {
      color: var(--vp-c-brand) !important;
      font-weight: 500 !important;
    }
  }
}

.text {
  flex-grow: 1;
  padding: 4px 0;
  line-height: 24px;
  font-size: 13px;
  transition: color 0.25s;
}

.VPSidebarItem .text {
  color: var(--vp-c-text-1);
}

.collapsible .VPSidebarItem.level-1 .text,
.collapsible .VPSidebarItem.level-2 .text,
.collapsible .VPSidebarItem.level-3 .text,
.collapsible .VPSidebarItem.level-4 .text,
.collapsible .VPSidebarItem.level-5 .text {
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.VPSidebarItem.level-0.is-link>.item>.link:hover .text,
.VPSidebarItem.level-1.is-link>.item>.link:hover .text,
.VPSidebarItem.level-2.is-link>.item>.link:hover .text,
.VPSidebarItem.level-3.is-link>.item>.link:hover .text,
.VPSidebarItem.level-4.is-link>.item>.link:hover .text,
.VPSidebarItem.level-5.is-link>.item>.link:hover .text {
  color: var(--vp-c-brand);
}

.VPSidebarItem.level-0.has-active>.item>.link>.text,
.VPSidebarItem.level-1.has-active>.item>.link>.text,
.VPSidebarItem.level-2.has-active>.item>.link>.text,
.VPSidebarItem.level-3.has-active>.item>.link>.text,
.VPSidebarItem.level-4.has-active>.item>.link>.text,
.VPSidebarItem.level-5.has-active>.item>.link>.text {
  color: var(--vp-c-text-1);
}

.VPSidebarItem.level-0.is-active>.item .link>.text,
.VPSidebarItem.level-1.is-active>.item .link>.text,
.VPSidebarItem.level-2.is-active>.item .link>.text,
.VPSidebarItem.level-3.is-active>.item .link>.text,
.VPSidebarItem.level-4.is-active>.item .link>.text,
.VPSidebarItem.level-5.is-active>.item .link>.text {
  color: var(--vp-c-brand);
}

.caret {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.25s;
}

.apos-caret-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 0;
  height: 32px;
}

.item:hover .caret {
  color: var(--vp-c-text-2);
}

.item:hover .caret:hover {
  color: var(--vp-c-text-1);
}

.caret-icon {
  width: 14px;
  height: 14px;
  fill: #8a8a8a;
  transform: rotate(90deg);
  transition: transform 0.25s;
}

.VPSidebarItem.collapsed .caret-icon {
  transform: rotate(0);
}

.VPSidebarItem.level-1 .items,
.VPSidebarItem.level-2 .items,
.VPSidebarItem.level-3 .items,
.VPSidebarItem.level-4 .items,
.VPSidebarItem.level-5 .items {
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
}

.collapsible .VPSidebarItem.level-1 .item,
.collapsible .VPSidebarItem.level-2 .item,
.collapsible .VPSidebarItem.level-3 .item,
.collapsible .VPSidebarItem.level-4 .item,
.collapsible .VPSidebarItem.level-5 .item {
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
}

.VPSidebarItem.collapsed.collapsible .items {
  display: none;
}
</style>
