<template lang="pug">
    div.custom__layout
        .mode-switch-container
            .mode-switch-container__wrapper
                tm-mode-switch
        .custom__layout__header
            .custom__layout__header__nav
                .custom__layout__header__nav__logo
                    a(:href="$themeConfig.footer.textLink.url" target="_blank" rel="noreferrer noopener" tag="div").logo__image
                        component(:is="`logo-${$themeConfig.label}-text`" v-if="$themeConfig.label" fill="black")
                        img(:src="$themeConfig.footer.logo" v-else-if="$themeConfig.custom")
                .custom__layout__header__nav__actions
                    .custom__layout__header__nav__actions__item(v-for="item in $frontmatter.nav.items")
                        a.overline-label(:href="item.url") {{item.name}}
                .custom__layout__header__nav__links
                    a.overline-label Get ATOM
                    icon-arrow(type="right").custom__layout__header__nav__links__icon
                .custom__layout__header__nav__mobile__menu
                    icon-menu
            .custom__layout__header__search
                search-bar
        .custom__layout__content
            h1 Developer Portal
            card(imageUrl="/graphics-sdk-course.png" mobileImageUrl="/graphics-sdk-course-mobile.png")
                .overline-label beginner
                h2.custom__layout__content__intro__title Cosmos Academy
                .info-label ~126 Hours

                .custom__layout__content__intro__desc A complete and comprehensive course that enables you to use the Cosmos SDK to build and extend blockchains.
                .custom__layout__content__intro__link Start learning
                    icon-arrow(type="right").custom__layout__content__intro__link__icon
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
                        h2.tutorials__item__large__title Build a chain in minutes


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
                card(imageUrl="/support-image.png" mobileImageUrl="/support-image-mobile.png")
                    .overline-label custom support
                    h2.custom__layout__content__support__title Looking for help bringing your project to life?
                    .custom__layout__content__support__desc Apply for support and get help with funding applications, grants, technology, architechture,  and introductions to ecosystem insiders.
                    .custom__layout__content__support__action 
                        a Talk to us
                            icon-arrow(fill="var(--background-color-primary)" type="top-right").link__icon

        .custom__layout__footer
            tm-footer(full="true")
</template>

<style lang="stylus" scoped>
    .mode-switch-container
        position absolute
        padding-top 1rem
        top 3rem
        left 50%
        margin-inline auto

        &__wrapper
            position relative
            left -50%

    .custom__layout

        &__header
            
            &__nav
                display flex
                justify-content space-between
                border-bottom 1px solid var(--semi-transparent-color-2)
                padding-inline 128px
                padding-block 24px

                @media screen and (max-width: 480px)
                    padding-inline 24px
                
                @media screen and (min-width: 480px) and (max-width: 1024px)
                    padding-inline 48px

                &__logo
                    filter var(--img-filter)

                &__links
                    display flex
                    margin-block auto

                    &__icon
                        margin-block auto
                        margin-left 10px
                        width 15px
                        height 15px

                    .overline-label
                        text-transform none
                        color var(--color-text-strong)
                        width max-content

                &__actions
                    display flex
                    justify-content center
                    width 100%

                    &__item
                        padding-inline 16px
                        margin-block auto

                    .overline-label
                        text-transform none
                        color var(--color-text-strong)

                &__mobile__menu
                    display none

            &__search
                padding-inline 128px

                @media screen and (max-width: 480px)
                    padding-inline 24px
                
                @media screen and (min-width: 480px) and (max-width: 1024px)
                    padding-inline 48px


        &__footer
            padding-inline 128px

            @media screen and (max-width: 480px)
                padding-inline 24px
            
            @media screen and (min-width: 480px) and (max-width: 1024px)
                padding-inline 48px

            @media screen and (min-width: 1025px)
                padding-inline 124px

        &__content
            padding-inline 128px

            @media screen and (max-width: 480px)
                padding-inline 24px
            
            @media screen and (min-width: 480px) and (max-width: 1024px)
                padding-inline 48px

            margin-top 32px
        
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

                    &__icon
                        margin-block auto
                        margin-left 10px
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
                margin-top 50px
                margin-left: 32px
                display flex
                flex-direction column
                justify-content end

                @media screen and (min-width: 481px) and (max-width: 1024px)
                    width 50%
                    margin-left: 16px

                @media screen and (max-width: 480px)
                    width 100%
                    margin-left: 0px
                    padding 24px
                    padding-top 192px

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

    .articles
        padding-top: 20px
        display flex
        overflow hidden
        overflow-x auto
        -ms-overflow-style none
        scrollbar-width none

        &::-webkit-scrollbar
            display none

        margin-inline -128px
        padding-inline 113px

        @media screen and (max-width: 480px)
            margin-inline -24px
            padding-inline 9px
        
        @media screen and (min-width: 480px) and (max-width: 1024px)
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
                width 25vw

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
            margin-left 10px
            width 10px
            height 10px
    
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

    @media screen and (max-width: 480px)
        .custom__layout__header__nav

            &__actions
                display none
                
            &__links
                display none

            &__mobile__menu
                display flex

</style>