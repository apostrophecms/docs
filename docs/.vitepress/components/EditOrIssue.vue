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
import { computed } from 'vue';
import { useData } from 'vitepress';

export default {
  name: 'EditOrIssue',
  setup() {
    const { page, site } = useData()
    const themeConfig = computed(() => site.value.themeConfig)

    const openIssueLink = computed(() => {
      const pageTitle = page.value.title || page.value.relativePath || 'Unknown';
      return `https://github.com/apostrophecms/docs/issues/new?assignees=&labels=OKR+3%3A+Content+Improvement%2C+docs-ipfs&template=documentation-issue.md&title=${encodeURIComponent('[DOCS ISSUE] Page: ' + pageTitle)}`;
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
      } = themeConfig.value

      if (docsRepo && page.value.relativePath) {
        return createEditLink(
          docsRepo,
          docsDir,
          docsBranch,
          page.value.relativePath
        )
      }
      return null
    })

    const editLinkText = computed(() => {
      return (
        site.value.editLinkText ||
        `Edit this page`
      )
    })

    return {
      editLink,
      editLinkText,
      openIssueLink,
      createEditLink
    }
  }
}
</script>


<style lang="stylus" scoped>
.local-page-edit {
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
