<template lang="pug">
    div.custom__layout
        .mode-switch-container
            tm-mode-switch
        .custom__layout__header
            .custom__layout__header__logo
                
            .custom__layout__header__nav
        .custom__layout__content
            h1 Developer Portal
            card(imageUrl="/graphics-sdk-course.png" mobileImageUrl="/graphics-sdk-course-mobile.png")
                .overline-label beginner
                h2.custom__layout__content__intro__title Cosmos Academy
                .info-label ~126 Hours

                .custom__layout__content__intro__desc A complete and comprehensive course that enables you to use the Cosmos SDK to build and extend blockchains.
                .custom__layout__content__intro__link Start learning
            .tutorials__wrapper
                h3 Tutorials
                .tutorials
                    .tutorials__item(v-for="tutorial in $frontmatter.tutorials")

            .articles__wrapper
                .articles__wrapper__title
                    h3 Articles
                    a(href="/").link More articles
                .articles
                    .articles__item(v-for="article in $frontmatter.articles")
                        .articles__item__container
                            .articles__item__image(v-bind:style="{'background-image': `url(${article.image})`}")
                            .articles__item__content
                                .overline-label.articles__item__content__date {{article.date}}
                                h4.articles__item__content__title {{article.title}}
                                .info-label.articles__item__content__time {{article.time}} minute read
            .tools__wrapper
                h3 Tools
                .tools
                    .tools__item(v-for="tool in $frontmatter.tools")
                        .tools__item__container
                            .tools__item__icon
                                img(:src="tool.image" :alt="tool.title")
                            .tools__item__content
                                h5.tools__item__content__title {{tool.title}}
                                .tools__item__content__description {{tool.description}}
                                .tools__item__content__links
                                    a(v-for="link in tool.links" :href="link.url").link {{link.name}}

            .support__wrapper
                card(imageUrl="/support-image.png" mobileImageUrl="/support-image-mobile.png")
                    .overline-label custom support
                    h2.custom__layout__content__support__title Looking for help bringing your project to life?
                    .custom__layout__content__support__desc Apply for support and get help with funding applications, grants, technology, architechture,  and introductions to ecosystem insiders.
                    .custom__layout__content__support__action 
                        a Talk to us

            .newsletter__wrapper

        .custom__layout__footer
            tm-footer(full="true")
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

            @media screen and (min-width: 833px)
                padding-inline 124px

        &__content__intro

            &__title
                margin-block 10px

            &__desc
                margin-top 20px

            &__link
                font-weight 500
                color var(--color-text-strong)
                margin-top 20px
                
                &:after
                    content '\2192'
                    padding-left 0.1875em

        &__content__support

            &__title
                margin-block 10px

            &__desc
                margin-top 20px

            &__action
                background var(--color-text)
                font-weight 500
                color var(--background-color-primary)
                margin-top 40px
                border-radius 10px
                padding-block 20px
                padding-inline 60px
                width: fit-content;
                
                &:after
                    content '\2197'
                    padding-left 0.1875em

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

                @media screen and (max-width: 832px)
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

    .articles
        padding-top: 20px
        display flex
        overflow hidden
        overflow-x: auto;

        margin-inline -128px
        padding-inline 113px

        @media screen and (max-width: 480px)
            margin-inline -24px
            padding-inline 9px
        
        @media screen and (min-width: 480px) and (max-width: 832px)
            margin-inline -48px
            padding-inline 33px

        &__item
            padding-inline 15px

            &__container
                background var(--background-color-secondary)
                border-radius 20px
                display flex
                flex-direction column
                height 100%
                width 30vw

                @media screen and (min-width: 481px) and (max-width: 832px)
                    width 40vw

                @media screen and (max-width: 480px)
                    width 80vw

            &__image
                height 200px
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

                @media screen and (min-width: 481px) and (max-width: 832px)
                    padding 32px

                @media screen and (max-width: 480px)
                    padding 24px

                &__title
                    margin-block 20px


                    

    .link
        margin-block auto
        margin-right 20px
        cursor pointer
        font-weight 500
        color var(--color-text-strong)

        &:after
            content '\2197'
            padding-left 0.1875em
    
    .tools__wrapper
        margin-top 50px

    .tutorials__wrapper
        margin-top 50px

    .articles__wrapper
        margin-top 50px

        &__title
            display flex
            justify-content space-between

        .link
            margin-right 0px

</style>