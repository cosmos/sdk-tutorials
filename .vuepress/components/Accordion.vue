<template lang="pug">
    .accordion__wrapper
        .accordion(v-for="(item, index) in items")
            button.accordion__header(v-on:click="onAccordionClick(index)")
                icon-arrow.accordion__header__icon(type="bottom" :class="selectedAccordion == index ? 'expanded' : 'collapsed'")
                p {{item.title}}
            div.accordion__content(ref="content" v-html="md(item.description)")
</template>

<script>
export default {
    props: ['items'],
    data: function() {
        return {
            selectedAccordion: null,
        };
    },
    methods: {
        onAccordionClick(index) {
            this.$refs.content.forEach((item, i) => item.classList.toggle('visible', i == index && !(this.selectedAccordion == index)));
            if (this.selectedAccordion == index) {
                this.selectedAccordion = null;
            } else {
                this.selectedAccordion = index;
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
    .accordion
        width 100%

        &:hover:not(:active)
            transform translateY(-2px)
            transition-duration 0.1s

        &__wrapper
            display flex
            flex-direction column
            align-items flex-start
            background var(--background-color-secondary)
            border-radius 16px
            margin-top 3rem
            margin-bottom 3rem

        &__header
            padding 24px
            border-radius 16px
            display flex
            align-items center
            width 100%
            border 0
            font-size 20
            line-height 1.6
            text-align left
            background none
            outline none
            cursor pointer
            color var(--color-text-strong)
            font-weight bold

            .expanded
                transform rotate(180deg)
                -webkit-transform rotate(180deg)
                -ms-transform rotate(180deg)
                transition transform 0.2s linear

            .collapsed
                transform rotate(0deg)
                -webkit-transform rotate(0deg)
                -ms-transform rotate(0deg)
                transition transform 0.2s linear

            &__icon
                flex-shrink 0
                display block
                margin-block auto
                margin-right 15px
                width 15px
                height 15px

            p
                margin 0

        &__content
            padding-inline 24px
            padding-bottom 1rem
            color var(--color-text)
            display none

            p
                margin-top 0.5rem
                margin-bottom 0

    .visible
        display block

</style>
