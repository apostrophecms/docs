<template>
  <div class="local-page-edit">
    <p class="local-edit-link outline-link" v-if="editLink">
      <a :href="editLink" target="_blank" rel="noopener noreferrer">{{
        editLinkText
      }}</a>
      <span v-if="openIssueLink">
        on GitHub or
        <a :href="openIssueLink" target="_blank" rel="noopener noreferrer">open an issue</a>
      </span>
    </p>
  </div>
</template>

<script>
export const endingSlashRE = /\/$/;
export const outboundRE = /^[a-z]+:/i;
import { computed, onMounted, ref, watch } from 'vue';
import { useData, onContentUpdated } from 'vitepress';

export default {
  name: 'EditOrIssue',
  setup() {
    const dataObject = useData()
    const pageData = dataObject.page.value
    const siteData = dataObject.site.value
    const themeConfig = siteData.themeConfig

    const relativePath = ref('')
    const title = ref('')

    onMounted(() => {
      relativePath.value = pageData.relativePath
      title.value = pageData.title
    })

    const openIssueLink = computed(() => {
      return `https://github.com/apostrophecms/a3-docs/issues/new?assignees=&labels=OKR+3%3A+Content+Improvement%2C+docs-ipfs&template=documentation-issue.md&title=%5BDOCS+ISSUE%5D+Page:+${title.value}`;
    })

    function createEditLink(docsRepo, docsDir, docsBranch, path) {
      const base = outboundRE.test(docsRepo)
        ? docsRepo
        : `https://github.com/${docsRepo}`;
      return (
        base.replace(endingSlashRE, '') +
        `/edit` +
        `/${docsBranch}/` +
        (docsDir ? docsDir.replace(endingSlashRE, '') + '/' : '') +
        path
      );
    }

    const editLink = computed(() => {
      const {
        docsDir = '',
        docsBranch = 'main',
        docsRepo
      } = themeConfig

      if (docsRepo && pageData.relativePath) {
        return createEditLink(
          docsRepo,
          docsDir,
          docsBranch,
          relativePath.value
        )
      }
      return null
    })

    const editLinkText = computed(() => {
      return (
        siteData.editLinkText ||
        `Edit this page`
      )
    })

    return {
      editLink,
      editLinkText,
      openIssueLink,
      createEditLink
    }
  },
  watch: {
  'relativePath.value': function() {
      relativePath.value = pageData.relativePath
      title.value = pageData.title
    }
  }
}
</script>


<style lang="stylus" scoped>
.local-page-edit {
  margin-top: 2rem;
  margin-left: 1rem;
  font-size: 12px;

  }

.local-edit-link {
  margin: 0;
  padding: 0;

  a {
    color: var(--vp-c-brand);
    text-decoration-style: dotted;
    transition: color 0.25s;

      &:hover {
        color: var(--vp-c-brand-hover);
      }
    }
}
</style>
