<template lang="pug">
    div.wrapper(v-bind:class="classType")
        div.content(v-bind:class="classType") 
            div.icon(v-bind:class="classType" v-if="image")
                img.icon-image.no-zoom(v-bind:src="image")
            .label.tm-overline.tm-rf-1.tm-lh-title.tm-medium(v-else) {{type}}
            slot
</template>

<script>
    const getImageUrl = (type) => {
        let icon;

        switch(type) {
            case "tip":
            case "reading":
                icon = "/hi-tip-icon.svg";
                break;
            case "info":
                icon = "/hi-info-icon.svg";
                break;
            case "warn":
            case "warning":
                icon = "/hi-warn-icon.svg";
                break;
            case "synopsis":
                icon = null;
                break;
            default:
                icon = "/hi-info-icon.svg";
        }

        return icon;
    }
    export default {
        props: ['type'],
        data() {
            return {
                classType: this.type,
                image: getImageUrl(this.type)
            };
        },
    }
</script>

<style lang="stylus" scoped>
    .wrapper {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: start;
        padding: 24px;
        margin-bottom: 20px;
        border-radius: 16px;
        font-size: 21px;
        flex-wrap: wrap;

        &.info {
            background: var(--background-color-primary);
            border: 1px solid #40B3FF;
        }

        &.tip {
            background: var(--background-color-primary);
            border: 1px solid var(--color-light-gray);
        }

        &.warn, &.warning {
            background: var(--color-warning);
            color: black
            fill: black

            .title {
                color: black
            }
        }

        &.reading {
            background: var(--background-color-primary);
            border: 1px solid var(--color-light-gray);
        }

        &.synopsis {
            background: var(--background-color-secondary);
            color: var(--semi-transparent-color-3);
        }
    }

    .label {
        width: 100%;
        margin-bottom: 12px
        color: var(--color-text-strong);
        font-size: 13px;
    }

    .icon {
        margin-right: 10px;
        margin-top: 4px;
        float: left;

        img {
            width: 20px;
            height: 20px;
            margin: 0;
        }

        &.tip, &.reading {
            filter: var(--img-filter);
        }
    }

    .content {
        width: 100%;

        p {
            margin: 0px;
        }

    }

    @media screen and (max-width: 600px) {
        .content {
            width: 100%;
        }
    }

</style>
