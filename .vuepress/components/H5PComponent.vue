<template lang="pug">
    div
        div.h5p__wrapper(v-for="content in this.contents")
            h5p(class="h5p-iframe" :src="content" ref="h5p")
</template>

<script>
    import h5p from 'vue-h5p'

    export default {
        props: {
            contents: {
                type: Array,
                required: true
            }
        },
        components: {
            h5p
        },
        mounted() {
            this.$nextTick(function () {
                setTimeout(this.resizeH5P, 500);
                setTimeout(this.resizeH5P, 1000);
            })
            window.addEventListener("resize", this.resizeH5P);
        },
        updated() {
            this.resizeH5P();
        },
        destroyed() {
            window.removeEventListener("resize", this.resizeH5P);
        },
        methods: {
            resizeH5P() {
                var elements = document.getElementsByClassName('h5p-iframe');
                for (var element of elements) {
                    if (element.contentWindow) element.style.height = element.contentWindow.document.documentElement.scrollHeight + 'px';
                }
                console.log(this.$refs.h5p.contentDocument)
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .h5p__wrapper {
        width: 100%;
        margin-inline: -8px;
    }
    .h5p-iframe {
        min-height: 200px;
    }
</style>