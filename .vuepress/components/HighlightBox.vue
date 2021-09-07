<template lang="pug">
    div.wrapper
        div.icon(v-bind:class="classType")
            img.icon-image(v-bind:src="image")
        div.content(v-bind:class="classType") 
            slot
</template>

<script>
    const imageUrl = (type) => {
        let icon = "/hi-info.svg"; // default

        if (type==="info") icon = "/hi-info.svg";
        if (type==="tip") icon = "/hi-tip.svg";
        if (type==="warn"|| type==="warning") icon = "/hi-warn.svg";
        if (type==="reading") icon = "/hi-reading.svg";

        return icon;
    }
    export default {
        props: ['type'],
        data() {
            return {
                classType: this.type,
                image: imageUrl(this.type)
            };
        },
    }
</script>

<style lang="stylus" scoped>
    .wrapper {
        background: #EDEDED;
        display: grid;
        width: 100%;
        grid-template-columns: 120px auto;
        align-items: center;
        margin: 1.5em 0px;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    }
    
    @media screen and (max-width: 600px) {
        .wrapper {
            display: block;
        }
    }

    .icon {
        padding: 20px;
        min-width: 120px;
        min-height: 120px;
        height: 100%;
        align-items: center;
        display: flex;

        img {
            width: 80px;
            margin: 0;
        }

        &.info {
            background: #2C7DF7;
        }

        &.tip {
            background: #DE7150;
        }

        &.warn, &.warning {
            background: #DD4F52;
        }

        &.reading {
            background: #389C66;
        }
    }

    .content {
        padding: 20px;
        overflow: auto;
        
        &::before {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
            display: block;
        }


        p {
            margin-bottom: 1.0rem;
        }

        &.info {
            &::before {
                content: "Info";
                color: #2C7DF7;
            }
        }

        &.tip {
            &::before {
                content: "Tip";
                color: #DE7150;
            }
        }

        &.warn, &.warning {
            &::before {
                content: "Warning";
                color: #DD4F52;
            }
        }

        &.reading {
            &::before {
                content: "Further Reading";
                color: #389C66;
            }
        }

    }

</style>
