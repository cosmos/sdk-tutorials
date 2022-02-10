<template lang="pug">
    div.expansion__container
        div.inner-container
            button.styled-button(v-on:click="toggleContent")
                icon-arrow.icon(type="bottom" :class="this.expanded ? 'expanded' : 'collapsed'")
                p {{this.title}}
            div.expansion__content(ref="content")
                slot
</template>

<script>
export default {
    props: ['title'],
    data() {
        return {
            expanded: false
        };
    },
    methods: {
        toggleContent(event) {
            this.$refs.content.classList.toggle('visible');
            this.expanded = this.$refs.content.classList.contains('visible')
        }
    }
}
</script>

<style lang="stylus" scoped>
    .expansion__container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        background: var(--background-color-secondary);
        border-radius: 16px;
        margin-top: 3rem;
        margin-bottom: 3rem;

        &:hover:not(:active) {
            transform translateY(-2px);
            transition-duration 0.1s;
        }
    }
    .inner-container {
        width: 100%;
    }
    .styled-button {
        padding: 24px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        width: 100%;
        border: 0;
        font-size: 20;
        line-height: 1.6;
        text-align: left;
        background: none;
        outline: none;
        cursor: pointer;
        color: var(--color-text-strong);
        font-weight: bold;

        .expanded {
            transform: rotate(180deg);
            -webkit-transform: rotate(180deg);
            -ms-transform: rotate(180deg);
            transition: transform 0.2s linear;
        }

        .collapsed {
            transform: rotate(0deg);
            -webkit-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transition: transform 0.2s linear;
        }

        .icon {
            flex-shrink: 0;
            display: block;
            margin-block: auto;
            margin-right: 15px;
            width: 15px;
            height: 15px;
        }

        p {
            margin: 0;
        }
    }
    .expansion__content {
        padding-inline: 24px;
        padding-bottom: 1rem;
        color: var(--color-text);
        display: none;

        p {
            margin-top: 0.5rem;
            margin-bottom: 0;
        }
    }
    .visible {
        display: block;
    }
    >>> .codeblock > .container {
        background: var(--background-color-primary)
    }
    >>> .theme-code-group__nav {
        background: var(--background-color-primary) !important
    }
</style>
