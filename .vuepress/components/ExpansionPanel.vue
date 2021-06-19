<template lang="pug">
    div.container
        div.inner-container
            button.styled-button(v-on:click="toggleContent")
                img(:src="this.expanded ? expandLessIcon : expandMoreIcon")
                p {{this.title}}
            div.content(v-show="expanded")
                slot
</template>

<script>

import expandLessIcon from '../public/expand-less.svg'
import expandMoreIcon from '../public/expand-more.svg'

export default {
    props: ['title'],
    data() {
        return {
            expanded: false,
            expandLessIcon,
            expandMoreIcon
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
        background-color: rgba(176,180,207,0.09);
        border-radius: 0.5rem;
        margin-top: 3rem;
        margin-bottom: 3rem;
        color: rgba(22,25,49,0.9);
        font-size: 1rem;
        line-height: 1.625rem;
    }
    .styled-button {
        padding: 1rem;
        border-radius: 0.5rem;
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
        font-weight: 600;

        &:hover {
            background-color #F1F2F7;
        }

        img {
            width: auto;
            margin-block: auto;
            margin-right: 0.5rem;
        }

        p {
            margin: 0;
        }
    }
    .content {
        padding-inline: 1.5rem;
        padding-bottom: 1rem;
        color: black;

        p {
            margin-top: 0.5rem;
            margin-bottom: 0;
        }
    }
</style>
