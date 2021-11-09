<template lang="pug">
    .module__wrapper
        .module
            .overline-label module {{this.module.number}}
            .module__content
                h4.module__content__title {{this.module.title}}
                .module__content__desc {{this.module.description}}
            .module__actions
                .module__actions__toggle(v-on:click="toggleContent")
                    .module__actions__toggle__label(v-text="expanded ? 'Hide contents' : 'Show contents'")
                    icon-arrow(type="right" :class="expanded ? 'hide-icon' : 'show-icon'")
                a.module__actions__start(:href="this.module.url") Start here
                    icon-arrow(type="right").start-icon
        .module__submodules(v-show="expanded")
            .module__submodules__item(v-for="submodule in this.module.submodules")
                .module__submodules__item__badge(v-if="submodule.tag && $themeConfig.tags[submodule.tag]" v-bind:style="{'background': $themeConfig.tags[submodule.tag].color || ''}") {{$themeConfig.tags[submodule.tag].label || ''}}
                .module__submodules__item__content
                    a(:href="submodule.url")
                        h5.module__submodules__item__content__title {{submodule.title}}
                            icon-arrow(type="right").start-icon
                    .module__submodules__item__content__desc {{submodule.description}}
</template>

<script>
    export default {
        props: ['module'],
        data() {
            return {
                expanded: false
            };
        },
        methods: {
            toggleContent(event) {
                this.expanded = !this.expanded;
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .start-icon
        margin-left 5px
        width 15px
        height 15px

    .module
        display flex
        justify-content space-between

        &__wrapper
            display flex
            flex-direction column
            border-radius 20px
            background-color var(--background-color-secondary)
            padding 48px

        &__submodules
            display flex
            flex-direction column
            margin-top 16px

            &__item
                display flex
                padding-block 32px
                border-bottom 1px solid var(--semi-transparent-color-2)

                &:last-child
                    border-bottom none
                    padding-bottom 0px

                &__badge
                    border-radius 8px
                    margin-block auto
                    padding 8px
                    flex-shrink 0

                &__content
                    margin-left 32px
                    display flex
                    flex-direction column

                    &__title
                        display flex
                        color var(--color-text-strong)
                        margin-bottom 8px

        &__actions
            display flex
            align-items center
            justify-content space-between
            color var(--color-text-strong)

            &__toggle
                display flex
                height fit-content
                cursor pointer

                .show-icon
                    margin-block auto
                    margin-left 5px
                    margin-right 16px
                    width 15px
                    height 15px
                    transform rotate(90deg)
                    -webkit-transform rotate(90deg)
                    -ms-transform rotate(90deg)
                    transition: transform 0.2s linear;
                
                .hide-icon
                    margin-block auto
                    margin-left 5px
                    margin-right 16px
                    width 15px
                    height 15px
                    transform rotate(-90deg)
                    -webkit-transform rotate(-90deg)
                    -ms-transform rotate(-90deg)
                    transition: transform 0.2s linear;

            &__start
                display flex
                height fit-content

                .start-icon
                    margin-block auto

        &__content
            flex-grow 1
            margin-left 16px

            &__desc
                margin-top 8px
                font-size 21px

    @media screen and (max-width: 480px)
        .module
            flex-direction column

            &__wrapper
                padding 32px

            &__submodules
                &__item
                    flex-direction column

                    &__content
                        margin-left 0px

                        &__title
                            margin-block 16px

                    &__badge
                        width fit-content

            &__content
                margin-left 0px

                &__title
                    margin-block 8px

            &__actions
                margin-top 40px

                &__toggle
                    .hide-icon
                        margin-right 8px
                    .show-icon
                        margin-right 8px


</style>