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
        beforeMount() {
            this.addResizerScript();
        },
        methods: {
            addResizerScript() {
                if (document.getElementById('h5p-resizer') != null) return;
                
                let resizer = document.createElement('script');
                resizer.setAttribute('id',"h5p-resizer");
                resizer.setAttribute('src',"https://h5p.org/sites/all/modules/h5p/library/js/h5p-resizer.js");
                document.head.appendChild(resizer);
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