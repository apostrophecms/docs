<template>
  <aside class="sidebar">
    <NavLinks />

    <GithubStars />

    <slot name="top" />

    <SidebarLinks
      :depth="0"
      :items="items"
    />
    <slot name="bottom" />
  </aside>
</template>

<script>
import SidebarLinks from '@theme/components/SidebarLinks.vue'
import NavLinks from '@theme/components/NavLinks.vue'
import GithubStars from '@theme/components/GithubStars.vue'

export default {
  name: 'Sidebar',

  components: { SidebarLinks, NavLinks, GithubStars },

  props: ['items']
}
</script>

<style lang="stylus">
.sidebar {
  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  a {
    display: inline-block;
  }

  .nav-links {
    display: none;
    padding: 0.5rem 0 0.75rem;
    border-bottom: 1px solid $borderColor;

    a {
      font-weight: 600;
    }

    .nav-item,
    .repo-link {
      display: block;
      padding: 0.5rem 0 0.5rem 1.5rem;
      line-height: 1.25rem;
      font-size: 1.1em;
    }
  }

  & > .sidebar-links {
    padding: 1rem 0 1.5rem;

    & > li > a.sidebar-link {
      font-size: 1.1em;
      line-height: 1.7;
      font-weight: bold;
    }

    & > li:not(:first-child) {
      margin-top: 0.75rem;
    }
  }
}

@media (max-width: $MQMobile) {
  .sidebar {
    .nav-links {
      display: block;

      .dropdown-wrapper .nav-dropdown .dropdown-item a.router-link-active::after {
        top: calc(1rem - 2px);
      }
    }

    & > .sidebar-links {
      padding: 1rem 0;
    }
  }
}
</style>
