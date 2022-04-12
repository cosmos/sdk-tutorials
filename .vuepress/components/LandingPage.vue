<template lang="pug">
    .content
        h1.tm-title.tm-lh-title.tm-rf6.tm-bold Developer Portal
        a(href="/academy/0-welcome")
            card.mt-9(imageUrl="/graphics-sdk-course.png")
                .tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted beginner
                h2.mt-1 Cosmos Academy
                //- .info-label.tm-lh-title.tm-rf-1.tm-muted ~126 Hours

                .content__intro__desc.tm-measure-narrow.tm-lh-copy.tm-muted Want to discover how to use the Cosmos SDK to build application-specific blockchains? Take your first steps in the Cosmos universe with a look into this complete and comprehensive course.
                a(href="/academy/0-welcome").tm-button.mt-7.mb-5.tm-button-disclosure
                    span Start learning
        .tutorials__wrapper.mt-10
            h3.tm-title.tm-lh-title.tm-rf3.tm-bold Tutorials
            .tutorials
                a.tutorials__item__small(href="/tutorials/understanding-ibc-denoms/")
                    card
                        .tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted intermediate
                        h4.mt-7 Understand IBC denoms
                        .mt-7.tm-lh-copy.tm-muted In this tutorial, you learn what IBC denoms are, how to use the relayer, connect blockchains, and find the path to an unknown blockchain.
                        .mt-7.info-label.tm-rf-1.tm-muted 10 minute read
                a.tutorials__item__large(v-bind:style="{'background-image': `url(/tutorial-bg-image.png)`}" href="https://docs.ignite.com/" target="_blank")
                    .tm-measure
                        .tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted Ignite CLI
                        h2.mt-5 Build a chain in minutes


        .articles__wrapper.mt-10(v-if="$frontmatter.articles")
            .articles__wrapper__title
                h3.tm-title.tm-lh-title.tm-rf3.tm-bold Articles
                //- div
                //-     a(href="/").tm-link.tm-lh-solid.tm-rf1.tm-medium.tm-link-external
                //-         span More articles
            .articles.mt-8
                .articles__item(v-for="article in $frontmatter.articles")
                    a.articles__item__container(:href="article.url" target="_blank")
                        .articles__item__image(v-bind:style="{'background-image': `url(${article.image})`}")
                        .articles__item__content
                            .tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted.articles__item__content__date {{article.date}}
                            h4.articles__item__content__title.mx-5 {{article.title}}
                            .info-label.articles__item__content__time.tm-rf-1.tm-muted.tm-lh-title {{article.time}} minute read

        .tools__wrapper.mt-10
            h3.tm-title.tm-lh-title.tm-rf3.tm-bold Tools
            .tools.mt-8
                .tools__item(v-for="tool in $frontmatter.tools")
                    .tools__item__container
                        .tools__item__icon
                            img(:src="tool.image" :alt="tool.title")
                        .tools__item__content
                            h5 {{tool.title}}
                            .mt-3 {{tool.description}}
                            .mt-6.tools__item__content__links
                                a(v-for="link in tool.links" :href="link.url" target="_blank").tm-link.tm-lh-solid.tm-medium.tm-link-external
                                    span {{link.name}}

        //- .support__wrapper.mt-10
        //-     card(imageUrl="/support-image.png" :bigCard="true").support__card
        //-         .tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted custom support
        //-         h2.content__support__title.mt-6 Need help bringing your project to life?
        //-         .mt-5.tm-lh-copy.tm-muted.tm-measure-narrow Apply for support and get help with funding applications, grants, technology, architecture, and getting in touch with the ecosystem.
        //-         .mt-8
        //-             a.tm-button.tm-button-external 
        //-                 span Talk to us
</template>

<style lang="stylus" scoped>
    .content
        margin-top var(--spacing-9)
        max-width var(--content-max-width-big)
        margin-inline auto

        &__intro
            &__desc
                margin-top 20px

            &__link
                display flex
                font-weight 500
                color var(--color-text-strong)
                margin-top 20px
                cursor pointer

                &__icon
                    margin-block auto
                    margin-left 5px
                    width 15px
                    height 15px

        &__support

            &__title
                max-width: 35rem

            &__desc
                margin-top 20px

    .tutorials
        display flex

        @media screen and (max-width: 480px)
            flex-direction column

        &__item
            &__small
                width 25.8vw
                flex-grow 0

                .card
                    margin-top 32px

                @media screen and (min-width: 481px) and (max-width: 1024px)
                    width 50%
                    margin-right: 16px

                @media screen and (max-width: 480px)
                    width 100%

            &__large
                flex-grow 1
                border-radius 20px
                background-color var(--background-color-secondary)
                background-repeat no-repeat
                background-position right
                background-size cover
                padding 48px
                margin-left: 32px
                display flex
                flex-direction column
                justify-content end
                margin-top 32px

                @media screen and (min-width: 481px) and (max-width: 1024px)
                    width 50%
                    margin-left: 16px

                @media screen and (max-width: 480px)
                    width 100%
                    margin-left: 0px
                    padding 24px
                    padding-top 192px

    .tools
        display flex
        flex-wrap wrap
        margin-left calc(-1 * var(--spacing-5))
        margin-right calc(-1 * var(--spacing-5))

        &__item
            padding-left var(--spacing-5)
            padding-right var(--spacing-5)
            margin-bottom var(--spacing-5)
            width 50%

            @media screen and (max-width: 480px)
                width 100%
            
            &__container
                padding-top var(--spacing-5)
                padding-bottom var(--spacing-5)
                border-bottom 1px solid var(--semi-transparent-color-2)
                display flex
                height 100%
                margin-block 22px

                @media screen and (max-width: 1024px)
                    flex-direction column

            &__icon
                flex-shrink 0
                width 6.5rem
                margin-bottom 10px
                text-align center
                filter var(--img-filter)

                @media screen and (max-width: 1024px)
                    text-align start

                img
                    width 3.5rem
                    height 3.5rem
                    margin 0
            
            &__content
                padding-bottom var(--spacing-6)

                &__links
                    display flex
                    > *
                        margin-left var(--spacing-6)
                        &:first-child
                            margin-left 0

                    @media screen and (max-width: 480px)
                        flex-direction column
                        
                        .tm-link
                            margin-left 0
                            margin-top 10px
                            width fit-content

    .articles
        display flex
        overflow hidden
        overflow-x auto
        -ms-overflow-style none
        scrollbar-width none

        @media screen and (max-width: 1024px)
            width 100vw
            margin-left calc(50% - 50vw)
            padding-inline calc(50vw - 50%)

        &::-webkit-scrollbar
            display none

        &__item
            padding-inline 15px
            flex 1 1 0px

            &:last-child
                padding-right 0px
            
            &:first-child
                padding-left 0px

            &__container
                background var(--background-color-secondary)
                border-radius 20px
                display flex
                flex-direction column
                height 100%

                @media screen and (min-width: 481px) and (max-width: 1024px)
                    width 40vw

                @media screen and (max-width: 480px)
                    width 80vw

            &__image
                height 0
                padding-bottom 56%
                flex-grow 0
                background-size cover
                border-top-left-radius 20px
                border-top-right-radius 20px

            &__content
                padding 48px
                flex-grow 1
                display flex
                flex-direction column
                justify-content space-between

                @media screen and (min-width: 481px) and (max-width: 1024px)
                    padding 32px

                @media screen and (max-width: 480px)
                    padding 24px

    .link
        margin-block auto
        margin-right 20px
        cursor pointer
        font-weight 500
        color var(--color-text-strong)
        display flex

        &__icon
            margin-left 5px
            width 10px
            height 10px
    
    .tools__wrapper
        margin-top 96px

    .tutorials__wrapper
        margin-top 96px

    .support
        &__card
            background-position right bottom !important

        &__wrapper
            margin-block 96px

    .articles__wrapper
        margin-top 96px

        &__title
            display flex
            justify-content space-between
            align-items center

        .link
            margin-right 0px

    @media screen and (max-width: 480px)
        .tools__wrapper
            margin-top 64px

        .tutorials__wrapper
            margin-top 64px

        .support__wrapper
            margin-block 64px

        .articles__wrapper
            margin-top 64px
        
        .tm-button
            padding-inline 0px
            width 100%

</style>
