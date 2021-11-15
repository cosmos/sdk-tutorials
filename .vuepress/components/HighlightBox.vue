<template lang="pug">
    div.wrapper(v-bind:class="classType")
        div.icon(v-bind:class="classType")
            img.icon-image(v-bind:src="image")
        p.title {{title}}
        div.content(v-bind:class="classType") 
            slot
</template>

<script>
    const getImageUrl = (type) => {
        let icon;

        switch(type) {
            case "info":
                icon = "/hi-tip-icon.svg";
                break;
            case "tip":
            case "reading":
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
    const getTitle = (type) => {
        let title;

        switch(type) {
            case "tip":
                title = "Tip";
                break;
            case "info":
                title = "Info";
                break;
            case "reading":
                title = "Further reading";
                break;
            case "warn":
            case "warning":
                title = "Alert";
                break;
            default:
                title = "Info";
        }

        return title;
    }
    export default {
        props: ['type'],
        data() {
            return {
                classType: this.type,
                image: getImageUrl(this.type),
                title: getTitle(this.type)
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
            background: var(--color-primary);
        }

        &.tip {
            background: var(--background-color-secondary);
        }

        &.warn, &.warning {
            background: var(--color-danger);
        }

        &.reading {
            background: var(--background-color-secondary);
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
            filter: var(--img-filter);
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
