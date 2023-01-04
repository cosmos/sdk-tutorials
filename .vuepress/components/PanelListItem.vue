<template lang="pug">
    .panel-list-item
        .panel-list-item__number {{this.number !== 'check' ? this.number : ''}}
            img.panel-list-item__number__icon.no-zoom(v-if="this.number == 'check'" src="/check-icon.svg")
        .panel-list-item__content(ref="content")
            slot
        .panel-list-item__last(v-if="this.last === true")
</template>

<script>
export default {
    props: ['number', 'last']
}
</script>

<style lang="stylus" scoped>
    .panel-list-item
        position relative
        padding-block 24px

        &:before
            content ''
            width 1px
            visibility var(--vline)
            position absolute
            top 24px
            bottom 0
            left 12px
            background var(--color-text-strong)
            transition background-color .15s ease-out
        
        &__number
            position absolute
            left 0
            top 0
            border-radius 50%
            border 1px solid var(--color-text-strong)
            width 24px
            height 24px
            padding auto
            display flex
            justify-content center

            &__icon
                width 16px
                height 16px
                margin auto
                filter var(--img-filter)

        &__content
            margin-left 50px

        &__last
            &:after
                content ''
                width 24px
                height 1px
                visibility var(--vline)
                position absolute
                bottom 0
                left 0
                background var(--color-text-strong)
                transition background-color .15s ease-out
            
</style>
