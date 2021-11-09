<template lang="pug">
  div
    .links
      .links__wrapper
        .overline-label(v-if="$page.frontmatter.prev || (linkPrevNext && linkPrevNext.prev && linkPrevNext.prev.frontmatter && linkPrevNext.prev.frontmatter.order !== false)") previous
        .links__content(v-if="$page.frontmatter.prev || (linkPrevNext && linkPrevNext.prev && linkPrevNext.prev.frontmatter && linkPrevNext.prev.frontmatter.order !== false)")
          router-link.links__item(:to="$page.frontmatter.prev || linkPrevNext.prev.regularPath")
            .links__item__icon.links__item__icon__previous
              icon-arrow(type="right")
            h5 {{$page.frontmatter.prev || linkPrevNext.prev.title}}
      .links__wrapper
        .overline-label(v-if="$page.frontmatter.next || (linkPrevNext && linkPrevNext.next && linkPrevNext.next.frontmatter && linkPrevNext.next.frontmatter.order !== false)") up next
        .links__content(v-if="$page.frontmatter.next || (linkPrevNext && linkPrevNext.next && linkPrevNext.next.frontmatter && linkPrevNext.next.frontmatter.order !== false)")
          router-link.links__item(:to="$page.frontmatter.next || linkPrevNext.next.regularPath")
            h5 {{$page.frontmatter.next || linkPrevNext.next.title}}
            .links__item__icon
              icon-arrow(type="right")
</template>

<style lang="stylus" scoped>
.links
  display flex

  &__wrapper
    display flex
    flex-direction column
    width 100%
    margin-bottom 2rem
    justify-content space-between

    &:first-child
      margin-right 32px

  &__content
    width 100%
    height 100%
    display flex
    flex-direction column

  &__item
    height 100%
    margin-top 1rem
    padding-inline 24px
    padding-block 48px
    background var(--background-color-secondary)
    border-radius 8px
    display flex
    align-items: center
    justify-content space-between
    transition box-shadow 0.25s ease-out, transform 0.25s ease-out, opacity 0.4s ease-out

    h5
      width 100%

    &:hover:not(:active)
      transform translateY(-2px)
      transition-duration 0.1s

    &__icon
      margin-block auto
      margin-left 32px
      width 20px
      height 20px

      &__previous
        transform rotate(180deg)
        margin-right 32px
        margin-left 0px

@media screen and (max-width: 480px)
  .links
    flex-direction column


</style>

<script>
import { findIndex, find } from "lodash";

export default {
  props: ["tree"],
  methods: {
    shorten(string) {
      let str = string.split(" ");
      str =
        str.length > 20 ? str.slice(0, 20).join(" ") + "..." : str.join(" ");
      return this.md(str);
    }
  },
  computed: {
    linkPrevNext() {
      if (!this.tree) return;
      let result = {};
      const search = tree => {
        return tree.forEach((item, i) => {
          const children = item.children;
          if (children) {
            const index = findIndex(children, ["regularPath", this.$page.path]);
            if (index >= 0 && children[index - 1]) {
              result.prev = children[index - 1];
            }
            if (index >= 0 && children[index + 1]) {
              result.next = children[index + 1];
            } else if (index >= 0 && tree[i + 1] && tree[i + 1].children) {
              result.next = find(tree[i + 1].children, x => {
                return x.frontmatter && x.frontmatter.order !== false;
              });
            }
            return search(item.children);
          }
        });
      };
      search(this.tree);
      return result;
    }
  }
};
</script>
