<template lang="pug">
  div(style="height: 100%; position: relative")
    .container
      .items(:class="[`footer__compact__${!!(compact === true)}`]")
        div(v-for="item in value" :style="{display: isVisible(item.title) ? 'block' : 'none'}").sidebar
          .overline-label.title {{item.title}}
          client-only
            tm-sidebar-tree(:value="item.children" v-if="item.children" :tree="tree" :level="0").section
        .sidebar.version
          tm-select-version
</template>

<style lang="stylus" scoped>
.container
  display flex
  flex-direction column
  height 100%

.logo
  padding 1.5rem 2rem
  display flex
  align-items center

  &:active
    outline none

  &__img
    width 2.5rem
    height 2.5rem
    margin-right 0.75rem

    &__custom
      width 100%
      height 2.5rem
      margin-right 0.75rem

      img
        max-width 100%
        max-height 100%

  &__text
    font-weight 600

.logo__container
  position sticky
  display block
  background var(--background-color-primary)
  z-index 1
  top 0

  &:after
    position absolute
    content ''
    top 100%
    left 0
    right 0
    background linear-gradient(to bottom, var(--background-color-primary), var(--background-color-primary))
    height 25px

.sidebar
  padding-right 24px
  overflow-x hidden
  margin-top 2rem

.version
  margin-top 2rem
  display none

.items
  flex-grow 1
  padding-bottom 2rem

  &.footer__compact__true
    flex-grow 0

.title
  margin-bottom 16px
  color var(--semi-transparent-color-3)

.footer.footer__compact__true
  padding-bottom 150px
  bottom initial
  margin-top 0
  position relative
  flex-grow 1

.footer
  height var(--sidebar-footer-height)
  padding-top 1rem
  padding-bottom 1rem
  background-color var(--sidebar-bg)
  position sticky
  bottom 0
  width 100%
  display grid
  grid-auto-flow column
  padding-left 0.75rem
  padding-right 0.75rem
  align-items center
  grid-auto-columns 1fr

  &:before
    content ''
    position absolute
    top -50px
    left 0
    right 0
    bottom 100%
    background linear-gradient(to top, var(--background-color-primary), var(--background-color-primary))
    pointer-events none

  &__item
    align-self flex-start
    display flex
    align-items center
    flex-direction column
    fill var(--color-text)

    &__icon
      height 32px
      margin-bottom 0.25rem

    &:hover
      fill var(--color)

    &__title
      text-align center
      font-size 0.6875rem
      line-height 0.875rem

@media screen and (max-width: 1135px)
  .version
    display block
</style>

<script>
import {
  includes,
  isString,
  isPlainObject,
  isArray,
  sortBy,
  last,
  find,
  omit,
} from "lodash";

export default {
  props: ["value", "tree", "compact"],
  data: function() {
    return {
      search: {
        query: null,
      },
      products: [
        {
          label: "sdk",
          name: "Cosmos<br>SDK",
          url: "https://docs.cosmos.network/",
          color: "#5064FB",
        },
        {
          label: "hub",
          name: "Cosmos<br>Hub",
          url: "https://hub.cosmos.network/",
          color: "#BA3FD9",
        },
        {
          label: "ibc",
          name: "IBC<br>Protocol",
          url: "https://ibcprotocol.org",
          color: "#E6900A",
        },
        {
          label: "core",
          name: "Tendermint<br>Core",
          url: "https://docs.tendermint.com/",
          color: "#00BB00",
        },
      ],
    };
  },
  computed: {
    searchResults() {
      return this.$site.pages.filter((page) => {
        const headers = page.headers ? page.headers.map((h) => h.title) : [];
        const title = page.title;
        return (
          title &&
          [title, ...headers]
            .join(" ")
            .toLowerCase()
            .match(this.search.query.toLowerCase())
        );
      });
    },
    logo() {
      return this.$themeConfig.logo;
    },
    sidebar() {
      return this.value;
    }
  },
  methods: {
    isVisible(title) {
      if (typeof window !== 'undefined') {
        const allowedOrigin = window.location.origin.includes("deploy-preview") || window.location.origin.includes("localhost:") || window.location.origin.includes("127.0.0.1");
        return title.includes("B9lab") ? allowedOrigin : !(this.$themeConfig.sidebar.auto == false && title === '');
      } else {
        return true;
      }
    }
  }
};
</script>
