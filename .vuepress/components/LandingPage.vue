<template lang="pug">
    custom-layout
        .content
            h1 Developer Portal
            a(href="/b9lab-content/1-welcome")
                card(imageUrl="/graphics-sdk-course.png")
                    .overline-label beginner
                    h2.content__intro__title Cosmos Academy
                    .info-label ~126 Hours

                    .content__intro__desc Want to discover how to use the Cosmos SDK to build application-specific blockchains? Take your first steps in the Cosmos universe with a look into this complete and comprehensive course.
                    .content__intro__link Start learning
                        icon-arrow(type="right").content__intro__link__icon
            .tutorials__wrapper
                h3 Tutorials
                .tutorials
                    .tutorials__item__small
                        card
                            .overline-label intermediate
                            h4.tutorials__item__small__title Nullam id dolor id nibh ultricies vehicula ut id elit.
                            .tutorials__item__small__desc Contributors, assemble! <br/> We are always looking for content to help new Cosmosnauts understand and explore the cosmos.
                            .info-label 10 minute read
                    .tutorials__item__large(v-bind:style="{'background-image': `url(/tutorial-bg-image.png)`}")
                        .overline-label starport
                        h2.tutorials__item__large__title Build a chain in hours


            .articles__wrapper
                .articles__wrapper__title
                    h3 Articles
                    a(href="/").link More articles
                        icon-arrow.link__icon
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
                                        icon-arrow.link__icon

            .support__wrapper
                card(imageUrl="/support-image.png")
                    .overline-label custom support
                    h2.content__support__title Looking for help bringing your project to life?
                    .content__support__desc Apply for support and get help with funding applications, grants, technology, architechture,  and introductions to ecosystem insiders.
                    .content__support__action 
                        a Talk to us
                            icon-arrow(fill="var(--background-color-primary)" type="top-right").link__icon
</template>

<style lang="stylus" scoped>
    .content
        margin-top 32px
        max-width var(--content-max-width)
        margin-inline auto

        &__intro

            &__title
                margin-block 10px

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
                width fit-content
                
                a
                    display flex

                    svg
                        fill var(--background-color-primary)
                        width 10px
                        height 10px

    .tutorials
        display flex

        @media screen and (max-width: 480px)
            flex-direction column

        &__item
            &__small
                width 25vw
                flex-grow 0

                &__title
                    margin-block 20px

                &__desc
                    margin-bottom 20px

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
        margin-top 32px
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
                margin-block 22px

                @media screen and (max-width: 1024px)
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

                &__links
                    display flex

                    @media screen and (max-width: 480px)
                        flex-direction column
                        
                        .link
                            margin-top 10px

    .articles
        padding-top: 32px
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

                @media screen and (min-width: 481px) and (max-width: 1024px)
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
        display flex

        &__icon
            margin-left 5px
            width 10px
            height 10px
    
    .tools__wrapper
        margin-top 96px

    .tutorials__wrapper
        margin-top 96px

    .support__wrapper
        margin-block 96px

    .articles__wrapper
        margin-top 96px

        &__title
            display flex
            justify-content space-between

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

</style>