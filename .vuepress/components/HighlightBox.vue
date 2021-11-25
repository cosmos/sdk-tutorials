<template lang="pug">
    div.wrapper(v-bind:class="classType")
        div.icon(v-bind:class="classType")
            img.icon-image(v-bind:src="image")
        div.content(v-bind:class="classType") 
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
        padding: 20px;
        padding-top: 10px;
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

        .title {
            color: var(--color-text-strong);
            font-weight: bold;
            
            margin-top: 10px;
            margin-bottom: 0px;
            margin-right: 20px;
        }
    }

    .icon {
        margin-top: 10px;
        margin-right: 20px;
        align-items: center;
        display: flex;

        img {
            width: 20px;
            height: 20px;
            margin: 0;
        }
    }

    .content {
        margin-top: 10px;
        width: max-content;

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
