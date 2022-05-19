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
            case "prerequisite":
                icon = "/hi-prerequesite-icon.svg";
                break;
            case "learning":
                icon = "/hi-target-icon.svg";
                break;
            case "best-practice":
                icon = "/hi-star-icon.svg";
                break;
            case "remember":
                icon = "/hi-tip-icon.svg";
                break;
            case "note":
                icon = "/hi-note-icon.svg";
                break;
            case "docs":
                icon = "/hi-coffee-icon.svg";
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
            background: linear-gradient(78.06deg, #336667 1.14%, #00B067 98.88%);
            color: #E3E3E3;
        }

        &.tip {
            background: var(--background-color-primary);
            border: 1px solid var(--color-light-gray);
        }

        &.warn, &.warning {
            background: linear-gradient(78.06deg, #00B067 0.2%, #FFD303 97.95%);
            color: #4D4D4D;
        }

        &.reading {
            background: var(--background-color-primary);
            border: 1px solid var(--color-light-gray);
        }

        &.synopsis {
            background: var(--background-color-secondary);
            color: var(--semi-transparent-color-3);
        }

        &.prerequisite {
            background: var(--color-text-strong);
            color: var(--background-color-secondary);
        }
        &.prerequisite a {
            color: var(--background-color-secondary);
        }

        &.learning {
            background: linear-gradient(78.06deg, #6836D0 1.14%, #05BDFC 98.88%);
            color: #E3E3E3;
        }

        &.best-practice {
            background: #6836D0;
            color: #E3E3E3;
        }

        &.remember {
            background: linear-gradient(78.06deg, #6D0000 1.14%, #F66800 98.88%);
            color: #E3E3E3;
        }

        &.note {
            background: linear-gradient(78.06deg, #F69900 1.14%, #FFCE15 98.88%);
            color: #4D4D4D;
        }

        &.docs {
            background: linear-gradient(78.06deg, #6836D0 1.14%, #F44CF6 98.88%);
            color: #E3E3E3;
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

        &.prerequisite {
            filter: var(--img-filter-reverse);
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
