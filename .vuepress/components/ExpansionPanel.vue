<template lang="pug">
    div.container
        div.inner-container
            button.styled-button(v-on:click="toggleContent")
                img(:src="expandIcon" :class="this.expanded ? 'expanded' : 'collapsed'")
                p {{this.title}}
            div.content(v-show="expanded")
                slot
</template>

<script>

import expandIcon from '../public/expand-more-icon.svg'

export default {
    props: ['title'],
    data() {
        return {
            expanded: false,
            expandIcon
        };
    },
    methods: {
        toggleContent(event) {
            this.expanded = !this.expanded;
        }
    }
}
</script>

<style lang="stylus" scoped>
    .container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        background: var(--background-color-secondary);
        border-radius: 20px;
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
        padding: 20px;
        border-radius: 20px;
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

        img {
            width: auto;
            margin-block: auto;
            margin-right: 1.5rem;
            filter: var(--img-filter);
        }

        p {
            margin: 0;
        }
    }
    .content {
        padding-inline: 32px;
        padding-bottom: 1rem;
        color: var(--color-text);

        p {
            margin-top: 0.5rem;
            margin-bottom: 0;
        }
    }
</style>
