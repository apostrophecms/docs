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
    // Only collapse if not configured to stay open and not active
    myCollapsed.value = (!hasActiveChild && !myIsActive.value && props.item.collapsed !== false);
    myHasActive.value = hasActiveChild;
  }
})

onBeforeUnmount(() => {
  console.log('Component is about to be unmounted');
});
onUnmounted(() => {
  console.log('Component has been unmounted');
});

const props = defineProps<{
  item: DefaultTheme.SidebarItem & { break?: boolean, customClass?: string }
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

const isFixed = computed(() => props.item.collapsed === 'fixed');

const sectionTag = computed(() => hasChildren.value ? 'section' : `div`)

const linkTag = computed(() => isLink.value ? 'a' : 'div')

const textTag = computed(() => {
  return !hasChildren.value
    ? 'p'
    : props.depth + 2 === 7 ? 'p' : `h${props.depth + 2}`
})

const itemRole = computed(() => isLink.value && !props.item.items ? undefined : 'button')

function checkForActivePage(items, page) {
  let hasActiveChild = false;
  items.forEach(item => {
    if (normalizePath(page.relativePath) === normalizePath(item.link)) {
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

// Initialize collapse state but respect 'fixed' option
if (props.item.collapsed === 'fixed') {
  // Fixed items are always open but not toggleable
  myCollapsed.value = false;
} else if (props.item.items) {
  // Regular items follow normal collapse logic
  myCollapsed.value = props.item.collapsed === false ? false : !hasActiveChild;
} else {
  myCollapsed.value = null;
}
myHasActive.value = hasActiveChild;

// Determine if we should show a caret
const showCaret = computed(() => {
  // Only show caret for items with children that aren't fixed
  return props.item.items && props.item.items.length > 0 && props.item.collapsed !== 'fixed';
});

const classes = computed(() => [
  [`level-${props.depth}`],
  { collapsible: collapsible.value || isFixed.value },
  { collapsed: myCollapsed.value },
  { 'is-link': isLink.value },
  { 'is-active': myIsActive.value },
  { 'has-active': myHasActive.value },
  { [`is-style-${props.item.style}`]: props.item.style },
  { 'is-fixed': isFixed.value },
  { 'parent-of-active': myHasActive.value },
  props.item.customClass
])

function onItemInteraction(e: MouseEvent | Event) {
  if ('key' in e && e.key !== 'Enter') {
    return
  }
  
  // If item is fixed, don't toggle
  if (isFixed.value) {
    return;
  }
  
  // For items without links or with both link and items, toggle
  if (!props.item.link) {
    myToggle();
  }
}

function onCaretClick(e: MouseEvent) {
  // Prevent the event from bubbling to parent handlers
  e.preventDefault();
  e.stopPropagation();
  
  // If fixed, do nothing
  if (isFixed.value) {
    return;
  }
  
  myToggle();
}

function onLinkClick(e: MouseEvent) {
  // If fixed, just follow the link
  if (isFixed.value) {
    return;
  }
  
  // For regular collapsible items with links and children
  if (props.item.items) {
    e.preventDefault();
    myToggle();
  }
}

function myToggle() {
  // Only toggle if not fixed
  if (!isFixed.value) {
    myCollapsed.value = !myCollapsed.value;
  }
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
        v-on="(item.items && !isFixed.value) ? { click: onItemInteraction, keydown: onItemInteraction } : {}" 
        :tabindex="(item.items && !isFixed.value) ? 0 : undefined">
        <div class="indicator" />

        <!-- Show caret for regular collapsible items -->
        <div v-if="showCaret" class="caret" role="button" aria-label="toggle section" @click="onCaretClick"
          @keydown.enter="onCaretClick" tabindex="0">
          <VPIconChevronRight class="caret-icon" />
        </div>
        <!-- For fixed items, show a bullet -->
        <div v-else-if="props.item.collapsed === 'fixed'" class="fixed-bullet" aria-hidden="true">
          <div class="bullet-icon"></div>
        </div>
        <!-- Placeholder for items without children -->
        <div v-else class="apos-caret-placeholder" />
        
        <VPLink v-if="item.link" :tag="linkTag" :href="item.link" 
          @click="!isFixed.value && item.items ? onLinkClick : undefined" class="link">
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

.collapsible:not(.collapsed):not(.is-fixed) .VPSidebarItem {
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

.VPSidebarItem.collapsible:not(.is-fixed)>.item {
  cursor: pointer;
}

.VPSidebarItem.is-fixed>.item {
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

.VPSidebarItem.is-active>div>.item .link {

  &,
  .text {
    color: var(--vp-c-brand);
    font-weight: 600;
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
  line-height: 1.4;
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

/* Always show items for fixed items */
.VPSidebarItem.is-fixed > div > .items {
  display: block !important;
}

/* Only hide items for regular collapsible items that are collapsed */
.VPSidebarItem.collapsed.collapsible:not(.is-fixed) > div > .items {
  display: none;
}

.VPSidebarItem.is-fixed.parent-of-active > div > .item .text {
    color: color-mix(in srgb, var(--vp-c-brand), white 30%);
    font-weight: 600;
}

.fixed-bullet {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
}

.bullet-icon {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--vp-c-text-3);
}

.VPSidebarItem.is-fixed.parent-of-active .bullet-icon,
.VPSidebarItem.is-fixed.is-active .bullet-icon {
  background-color: var(--vp-c-brand);
}

.VPSidebarItem.is-fixed .item:hover .bullet-icon {
  background-color: var(--vp-c-text-2);
}

.VPSidebarItem.is-fixed .apos-caret-placeholder {
  width: 32px;
}

.is-style-cta {
  background-color: var(--neutral-color);
  border-radius: 5px;
  padding: 10px 16px;
  width: calc(var(--vp-sidebar-width) - 32px);
  transition: all 0.25s ease;

  &:hover {
    background-color: var(--neutral-color-dark);
  }

  .text, .icon {
    color: var(--accent-dark-color);
  }

  & .link:hover {
    .text { color: var(--vp-c-text-1) !important; }
    :deep(svg) {
      path, polyline, circle, g, rect {
        stroke: var(--vp-c-text-1);
        color: var(--vp-c-text-1);
      } 
    }
  }
  
  .text {
    padding: 0;
    font-weight: 500;
  }
}
</style>