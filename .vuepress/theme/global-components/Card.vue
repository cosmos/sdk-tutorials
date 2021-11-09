<template lang="pug">
    .card(v-bind:style="this.imageUrl ? {'background-image': `url(${this.imageUrl})`} : {}")
        .card__content(:class="!this.imageUrl ? 'card__content__small' : ''")
            slot
</template>

<script>
export default {
    props: ['imageUrl', 'mobileImageUrl'],
}
</script>

<style lang="stylus" scoped>

    .card
        border-radius 20px
        background-color var(--background-color-secondary)
        background-repeat no-repeat
        background-position right
        background-size auto 120%
        padding 48px
        margin-top 50px
        display flex

        &__image
            display none

        &__content
            width 60%

            &__small
                width 100%

    @media screen and (max-width: 480px)
        .card
            padding 24px
            flex-direction column
            background-position bottom
            background-size auto 70%

            &__image
                display block
                margin -24px
                border-bottom-left-radius 20px
                border-bottom-right-radius 20px

            &__content
                padding-bottom 400px
                width 100%

                &__small
                    padding-bottom 0px

    @media screen and (min-width: 480px) and (max-width: 1024px)
        .card
            background-size auto 100%


</style>