<template lang="pug">
    div.custom__layout
        .mode-switch-container
            tm-mode-switch
        .custom__layout__header
            .custom__layout__header__logo
                
            .custom__layout__header__nav
        .custom__layout__content
            h1 Developer Portal
            .tutorials__wrapper
            .articles__wrapper
            .tools__wrapper
                h2 Tools
                .tools
                    .tools__item(v-for="tool in $frontmatter.tools")
                        .tools__item__container
                            .tools__item__icon
                                img(:src="tool.image" :alt="tool.title")
                            .tools__item__content
                                h4.tools__item__content__title {{tool.title}}
                                .tools__item__content__description {{tool.description}}
                                .tools__item__content__links
                                    a(v-for="link in tool.links" :href="link.url").link {{link.name}}

            .support__wrapper
            .newsletter__wrapper

        .custom__layout__footer
</template>

<style lang="stylus" scoped>
    .mode-switch-container
        position absolute
        padding-top 1rem
        top 1rem
        right 2rem

    .custom__layout
        padding-inline 128px

        @media screen and (max-width: 480px)
            padding-inline 24px
        
        @media screen and (min-width: 480px) and (max-width: 832px)
            padding-inline 48px

        &__header
            width 100%
            padding-inline 2rem
            padding-block 1rem

        &__footer
            width 100%
            padding-inline 4rem
            padding-block 1rem

    .tools
        margin-top 20px
        display flex
        flex-wrap wrap
        width 100%

        &__item
            padding 10px
            width 50%

            @media screen and (max-width: 480px)
                width 100%
            
            &__container
                border-bottom 1px solid var(--semi-transparent-color-2)
                display flex
                height 100%
                margin-block 10px

                @media screen and (max-width: 800px)
                    flex-direction column

            &__icon
                margin-right 20px
                margin-bottom 10px

                img
                    width 50px
                    height 50px
                    margin 0
                    filter var(--img-filter)
            
            &__content

                &__title
                    margin-bottom 10px

                &__description
                    margin-bottom 20px
                    

    .link
        margin-right 20px
        cursor pointer
        font-weight 500
        color var(--color-text-strong)

        &:after
            content '\2197'
            padding-left 0.1875em


</style>