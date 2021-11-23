<template lang="pug">
    .player__wrapper(v-if="videoId")
        iframe.player__content(
            :src="videoUrl"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            frameBorder="0"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            allowFullScreen)
</template>

<script>
    export default {
        props: ['videoId'],
        data() {
            return {
                videoUrl: "https://www.youtube-nocookie.com/embed/" + this.videoId + "?noref=true"
            };
        },
    }
</script>

<style lang="stylus" scoped>
    .player
        &__wrapper
            position relative
            padding-top 56.25%
            margin 20px 0

        &__content
            position absolute
            top 0
            left 0
            width 100%
            height 100%
</style>
