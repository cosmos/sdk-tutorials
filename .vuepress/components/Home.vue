<template lang="pug">
  div
    .search__container
      .search(@click="$emit('search', true)")
        .search__icon
          icon-search
        .search__text Search
    .h1 {{$frontmatter.title}}
    .intro
      .p__alt Learn how to use #[a(href="https://github.com/cosmos/cosmos-sdk" target="_blank" rel="noreferrer noopener") Cosmos SDK], the world’s most popular framework for building application-specific blockchains.
    .sections__wrapper
      .sections
        router-link.sections__item(tag="a" :to="section.url" v-for="section in $frontmatter.sections")
          .sections__item__difficulty
            .sections__item__difficulty__item(:style="{'--tag-text-color': `${tagColor[section.difficulty][0]}`, '--tag-background-color': `${tagColor[section.difficulty][1]}`}") {{ section.difficulty }}
          .sections__item__wrapper
            .sections__item__title {{section.title}}
            .sections__item__desc {{section.desc}}
          .sections__item__tags
            .sections__item__tags__item(v-for="tag in section.tags") {{tag}}
    .h2 Videos
    .stack
      a.stack__item(:href="item.url" target="_blank" rel="noreferrer noopener" v-for="item in $frontmatter.stack")
        img(:src="item.imgSrc" alt="Image").stack__item__image
        .stack__item__text
          .stack__item__h1 {{item.title}}
          .stack__item__p {{item.duration}}
    .h2 Articles
    .stack
      a.stack__item(:href="item.link" target="_blank" rel="noreferrer noopener" v-for="item in articlesList")
        img(:src="item.image" alt="Image").stack__item__image
        .stack__item__text
          .stack__item__h1 {{item.title}}
          .stack__item__p {{ format(parseISO(item.date), 'MMM d, yyyy') }}
    tm-help-support
</template>

<script>
import axios from "axios";
import { format, parseISO } from 'date-fns';

export default {
  data() {
    return {
      format,
      parseISO,
      tagColor: {
        beginner: ["#5064FB", "#FFFFFF"],
        intermediate: ["#FFFFFF", "#5064FB"],
        advanced: ["#FFFFFF", "rgba(0, 2, 36, 0.928)"],
        launchpad: ["#FFFFFF", "#3D60A4"],
        stargate: ["#FFFFFF", "#AC454C"],
        starport: ["#FFFFFF", "#7A236C"],
      },
      articlesList: []
    };
  },
  async mounted() {
    this.articlesList = (await axios.get(
      "https://backend.tendermint.com/cosmos/tag/tutorial"
    )).data.map(item => ({
        date: new Date(item.date).toISOString().substr(0, 10),
        title: item.title,
        link: item.link,
        image: item.image.replace('/max/1024/', '/max/768/')
      }))
      .slice(0, 6);
  }
};
</script>

<style lang="stylus" scoped>
a
  color var(--color-link)
  text-decoration none
  cursor pointer

.search {
  display: flex;
  align-items: center;
  color: rgba(22, 25, 49, 0.65);
  padding-top: 1rem;
  width: calc(var(--aside-width) - 6rem);
  cursor: pointer;
  transition: color 0.15s ease-out;

  &:hover {
    color: var(--color-text, black);
  }

  &__container {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  &__icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: #aaa;
    margin-right: 0.5rem;
    transition: fill 0.15s ease-out;
  }

  &:hover &__icon {
    fill: var(--color-text, black);
  }
}

.intro {
  width: 100%;
  max-width: 800px;
}

.h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 3.25rem;
  letter-spacing: -0.02em;
  padding-top: 2.5rem;
}

.h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 4.5rem;
  margin-bottom: 1rem;
  line-height: 2.25rem;
  letter-spacing: -0.01em;
  padding: 1.5rem 0;
}

.p {
  font-size: 1.5rem;
  line-height: 2.25rem;

  &__alt {
    margin-top: 0.75rem;
    margin-bottom: 2rem;
    font-size: 1.5rem;
    line-height: 2.25rem;
  }
}

.sections {
  display: grid;
  margin-top: 3rem;
  margin-bottom: 5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 14.75rem;
    position: relative;
    color: initial;
    border-radius: 0.5rem;
    padding: 1.5rem;
    background: linear-gradient(318.04deg, #FFFFFF 52.42%, #EBEDFF 81.42%);
    box-shadow: 0px 2px 4px rgba(22, 25, 49, 0.05), 0px 0px 1px rgba(22, 25, 49, 0.2), 0px 0.5px 0px rgba(22, 25, 49, 0.05);
    transition: box-shadow 0.25s ease-out, transform 0.25s ease-out, opacity 0.4s ease-out;

    &:hover:not(:active) {
      box-shadow: 0px 12px 24px rgba(22, 25, 49, 0.07), 0px 4px 8px rgba(22, 25, 49, 0.05), 0px 1px 0px rgba(22, 25, 49, 0.05);
      transform: translateY(-2px);
      transition-duration: 0.1s;
    }

    &:active {
      transition-duration: 0s;
      opacity: 0.7;
    }

    &__difficulty {
      flex-direction: row;

      &__item {
        display: inline-block;
        margin-right: 0.5rem;
        color: var(--tag-text-color);
        font-size: 0.875rem;
        line-height: 1.25rem;
        letter-spacing: 0.03em;
        text-transform: capitalize;
        background: var(--tag-background-color);
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem 0.125rem;
        width: fit-content;
      }

    }

    &__tags {
      flex-direction: row;

      &__item {
        display: inline-block;
        margin-right: 0.5rem;
        color: var(--color-text-dim, inherit);
        border: 1px solid rgba(0,0,0,0.07);
        font-size: 0.875rem;
        line-height: 1.25rem;
        letter-spacing: 0.03em;
        text-transform: capitalize;
        background: var(--tag-background-color);
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem 0.125rem;
        width: fit-content;
      }
    }

    &__title {
      font-weight: 600;
      font-size: 1.125rem;
      line-height: 1.6875rem;
      color: var(--color-text, inherit);
      margin-bottom: 0.5rem;
    }

    &__desc {
      font-size: 0.875rem;
      line-height: 1.25rem;
      letter-spacing: 0.03em;
      color: var(--color-text-dim, inherit);
    }
  }
}

.stack {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(3, minmax(300px, 1fr));
  margin-bottom: 4rem;

  &__item {
    color: var(--color-text, inherit);

    &:active {
      opacity: 0.7;
      transition-duration: 0s;
    }

    &__image {
      width: 100%;
      object-fit: cover;
    }

    &__h1 {
      font-size: 1rem;
      line-height: 1.5rem;
      font-weight: 600;
      margin-top: 0.5rem;
      margin-bottom: 0.25rem;
    }

    &__p {
      font-size: 0.875rem;
      color: var(--color-text-dim, inherit);
      line-height: 1.25rem;
    }

    &__text {
      text-align: left;
    }
  }
}

@media screen and (max-width: 1331px) {
  .stack {
    grid-template-columns: repeat(2, minmax(300px, 1fr));
  }
}

@media screen and (max-width: 1136px) {
  .p {
    font-size: 1.25rem;
    line-height: 1.75rem;

    &__alt {
      margin-top: 0.75rem;
      margin-bottom: 2rem;
      font-size: 1.5rem;
      line-height: 2.25rem;
    }
  }
}

@media screen and (max-width: 1007px) {
  .stack {
    grid-template-columns: repeat(1, minmax(300px, 1fr));
  }
}

@media screen and (max-width: 832px) {
  .h1 {
    padding-top: 3.5rem;
  }

  .search__container {
    display: none;
  }
}

@media screen and (max-width: 752px) {
  .search {
    display: none;
  }
}

@media screen and (max-width: 500px) {
  .h1 {
    font-size: 2rem;
    line-height: 2.25rem;
    margin-bottom: 1rem;
  }

  .h2 {
    font-size: 1.5rem;
    line-height: 2rem;
    margin-top: 3rem;
    margin-bottom: 0.75rem;
  }

  .p__alt {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .sections {
    margin-bottom: 0;
    margin-top: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    margin-left: -1rem;
    margin-right: -1rem;

    &__item {
      margin-bottom: 0;

      &:last-child .sections__item__wrapper {
        border-bottom: none;
      }
    }

    &__wrapper {
      position: relative;
      padding: 0.1px 1rem 1rem;
      background: white;
      border-radius: 0.5rem;
    }
  }
}
</style>
