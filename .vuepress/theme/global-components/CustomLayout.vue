<template lang="pug">
    div.custom__layout
        .mode-switch-container
            .mode-switch-container__wrapper
                tm-mode-switch
        custom-header(@mobileSidebar="$emit('sidebar', $event)")
        .custom__layout__content
            slot

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

        &__footer
            padding-inline 128px
            max-width var(--content-max-width) 
            margin auto

            @media screen and (max-width: 480px)
                padding-inline 24px
                margin-top 96px
            
            @media screen and (min-width: 480px) and (max-width: 1024px)
                padding-inline 48px

        &__content
            padding-inline 128px
            margin auto

            @media screen and (max-width: 480px)
                padding-inline 24px
            
            @media screen and (min-width: 480px) and (max-width: 1024px)
                padding-inline 48px

</style>