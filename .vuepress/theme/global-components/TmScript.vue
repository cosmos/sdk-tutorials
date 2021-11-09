<template lang="pug">
    script(v-if="shouldIncludeScript" :src="this.src" :async="this.async")
</template>

<script>
    export default {
        props: ["src", "async"],
        computed: {
            shouldIncludeScript() {
                return window.location.origin.includes("preview-5bxuue6kafu5ocp5.b9lab.com") || window.location.origin.includes("localhost:") || window.location.origin.includes("127.0.0.1");
            }
        }
    };
</script>