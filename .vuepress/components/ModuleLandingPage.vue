<template lang="pug">
	.home__content(:class="$frontmatter.main ? 'mt-10' : ''")
		.home__content__intro(v-if="$frontmatter.intro" v-for="intro in $frontmatter.intro").mb-10
			.home__content__intro__content(:class="intro.image ? 'home__content__intro__content__small' : ''")
				.tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted(v-if="intro.overline") {{intro.overline}}
				h2.home__content__intro__content__title {{intro.title}}
				.home__content__intro__content__desc(v-html="intro.description" :class="intro.image ? 'tm-measure-narrower' : ''")
				.home__content__intro__content__links
					a.home__content__intro__content__link.tm-button.tm-button-disclosure.mt-7(v-if="intro.action" :href="intro.action.url")
						span {{intro.action.label}}
					a.home__content__intro__content__link.tm-button.tm-button-disclosure.mt-7.resources-link(href="/#developer-resources") Resources
			.home__content__overview(v-if="$frontmatter.overview" id="overview")
				.tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted(v-if="$frontmatter.overview.overline") {{$frontmatter.overview.overline}}
				h2.home__content__overview__title(v-if="$frontmatter.overview.title") {{$frontmatter.overview.title}}
				.home__content__overview__content(v-if="$frontmatter.overview.items")
					tm-faq.home__content__overview__content__item(v-for="item in $frontmatter.overview.items" :title="item.title" :description="item.description")

		.modules(v-if="!$frontmatter.customModules && this.modules && this.modules[0].submodules && this.modules[0].submodules.length > 1")
			h2(:id="$frontmatter.weekly ? 'weekly-path' : 'course-modules'") {{$frontmatter.weekly ? "Weekly Plan" : "Course Modules"}}
			card-module(v-for="module in this.modules" v-if="module.title && module.number" :module="module" :main="$frontmatter.main" :weekly="$frontmatter.weekly || false").modules__item
		.modules-intro__wrapper.mt-10(v-if="$frontmatter.customModules")
			.modules-intro.mb-10(v-for="(customModule, key) in $frontmatter.customModules" :class="{'custom-module-background-image': customModule.image}" :style="{'--custom-module-background-image-url': `url(${customModule.image})`, '--custom-module-background-image-light-url': `url(${customModule.imageLightMode || customModule.image})`}")
				h2(v-if="customModule.title") {{customModule.title}}
				.modules-intro__description.mt-5(v-if="customModule.description") {{customModule.description}}
				a.tm-button.tm-button-disclosure.mt-7(v-if="customModule.action" :href="customModule.action.url")
					span {{customModule.action.label}}
				.tags-filter(v-if="$themeConfig.sidebar.filterByTagEnabled && customModule.sections && !customModule.hideFilter")
					.tags-filter__item(
						v-if="$themeConfig.tags" 
						v-for="(tag, tagKey) in $themeConfig.tags"
						v-on:click="onTagFiltersChange(key, tagKey)"
					)
						tag(
							:label="tag.label" 
							:color="tag.color" 
							:active="isTagActive(key, tagKey)"
							:bright="tag.isBright"
						)
				.cards
					.cards__wrapper(:class="customModule.useNarrowCards ? 'cards__narrow' : ''" v-for="card in customModule.sections")
						card-links.cards__item(
							:image="card.image" 
							:title="card.title" 
							:description="card.description" 
							:tags="card.tags || null"
							:links="card.links"
							:href="card.href"
							:overline="card.overline"
							:filterTags="filterTags[key]"
						)
		.image-section(v-if="$frontmatter.image")
			h2(v-if="$frontmatter.image.title") {{$frontmatter.image.title}}
			tm-image.image-section__image(:src="$frontmatter.image.src")

		.articles__wrapper.mt-10(v-if="$frontmatter.articles")
			.articles__wrapper__title
				h3.tm-title.tm-lh-title.tm-rf3.tm-bold Articles
			.articles.mt-8
				.articles__item(v-for="article in $frontmatter.articles")
					a.articles__item__container(:href="article.url" target="_blank")
						.articles__item__image(v-bind:style="{'background-image': `url(${article.image})`}")
						.articles__item__content
							.tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted.articles__item__content__date {{article.date}}
							h4.articles__item__content__title.mx-5 {{article.title}}
							.info-label.articles__item__content__time.tm-rf-1.tm-muted.tm-lh-title {{article.time}} minutes read

		.tools__wrapper.mt-10(v-if="$frontmatter.tools && $frontmatter.tools.length > 0")
			h3.tm-title.tm-lh-title.tm-rf3.tm-bold(id="developer-resources") Developer Resources
			.tools.mt-8
				.tools__item(v-for="tool in $frontmatter.tools")
					.tools__item__container
						.tools__item__icon
							img(:src="tool.image" :alt="tool.title")
						.tools__item__content
							h5 {{tool.title}}
							.mt-3 {{tool.description}}
							.mt-6.tools__item__content__links
								a(v-for="link in tool.links" :href="link.url" target="_blank").tm-link.tm-lh-solid.tm-medium.tm-link-external
									span {{link.name}}

		.resources__wrapper(v-if="$themeConfig.resources && !$frontmatter.hideResources")
			h3.resources__title(id="developer-resources") Developer Resources
			.resources
				.resources__item(v-for="resource in $themeConfig.resources" :class="$frontmatter.main && 'resources__item__main'")
					resource(:title="resource.title" :description="resource.description" :links="resource.links" :image="resource.image")
</template>


<style lang="stylus" scoped>
	.resources-link
		margin-left var(--spacing-6)
		background-color var(--color-blue)
		color white

	.custom-module-background-image
		padding-block var(--spacing-10)
		margin-block var(--spacing-10)
		background-size cover
		background-image var(--custom-module-background-image-url)

	:root.light-theme
		.custom-module-background-image
			background-image var(--custom-module-background-image-light-url)

	@media screen and (max-width: 480px)
		.tools__wrapper
			margin-top 64px

		.articles__wrapper
			margin-top 64px

	.tools
		display flex
		flex-wrap wrap
		margin-left calc(-1 * var(--spacing-5))
		margin-right calc(-1 * var(--spacing-5))

		&__item
			padding-left var(--spacing-5)
			padding-right var(--spacing-5)
			margin-bottom var(--spacing-5)
			width 50%

			@media screen and (max-width: 480px)
				width 100%

			&__container
				padding-top var(--spacing-5)
				padding-bottom var(--spacing-5)
				border-bottom 1px solid var(--semi-transparent-color-2)
				display flex
				height 100%
				margin-block 22px

				@media screen and (max-width: 1024px)
					flex-direction column

			&__icon
				flex-shrink 0
				width 6.5rem
				margin-bottom 10px
				text-align center
				filter var(--img-filter)

				@media screen and (max-width: 1024px)
					text-align start

				img
					width 3.5rem
					height 3.5rem
					margin 0

			&__content
				padding-bottom var(--spacing-6)

				&__links
					display flex
					> *
						margin-left var(--spacing-6)
						&:first-child
							margin-left 0

					@media screen and (max-width: 480px)
						flex-direction column

						.tm-link
							margin-left 0
							margin-top 10px
							width fit-content

	.articles
		display flex
		overflow hidden
		overflow-x auto
		-ms-overflow-style none
		scrollbar-width none

		@media screen and (max-width: 1024px)
			width 100vw
			margin-left calc(50% - 50vw)
			padding-inline calc(50vw - 50%)

		&::-webkit-scrollbar
			display none

		&__item
			padding-inline 15px
			flex 1 1 0px

			&:last-child
				padding-right 0px

			&:first-child
				padding-left 0px

			&__container
				background var(--background-color-secondary)
				border-radius 20px
				display flex
				flex-direction column
				height 100%

				@media screen and (min-width: 481px) and (max-width: 1024px)
					width 40vw

				@media screen and (max-width: 480px)
					width 80vw

			&__image
				height 0
				padding-bottom 56%
				flex-grow 0
				background-size cover
				border-top-left-radius 20px
				border-top-right-radius 20px

			&__content
				padding 48px
				flex-grow 1
				display flex
				flex-direction column
				justify-content space-between

				@media screen and (min-width: 481px) and (max-width: 1024px)
					padding 32px

				@media screen and (max-width: 480px)
					padding 24px
	.tags-filter
		display flex
		margin-top 40px
		flex-wrap wrap

		&__item
			margin-right var(--spacing-4)
			margin-bottom var(--spacing-4)

		.tag-item
			border-radius 8px
			padding 8px
			flex-shrink 0
			height fit-content
			margin-right 8px
			margin-block auto
			margin-bottom 8px
			border 1px solid var(--semi-transparent-color-3)
			background none
			color var(--semi-transparent-color-3)
			font-size var(--font-size--1)
			cursor pointer
			border 1px solid var(--tag-color)
			color var(--tag-color)

			&__active
				background var(--tag-color)
				border-color var(--tag-color)
				color white !important

			&__bright
				color black !important

	.modules-intro__description
		font-style italic

	.cards
		display flex
		justify-content space-between
		flex-wrap wrap

		&__wrapper
			max-width 48%
			margin-top var(--spacing-8)
			flex-grow 1
			width 100%

			&:empty
				display none

		&__narrow
			max-width 31.5%

		@media screen and (max-width: 1024px)
			flex-direction column
			flex-wrap nowrap
			
			&__wrapper
				max-width none  
	h2
		margin-block 10px
	.modules
		margin-top 96px
		display flex
		flex-direction column

		&__item
			margin-top 64px

	.image-section
		margin-top 96px
		
		&__image
			margin-top 64px
			width 100%

	.resources
		display flex
		margin-top 32px
		flex-wrap wrap

		@media screen and (max-width: 480px)
			width 100vw
			margin-left calc(50% - 50vw)
			padding-inline calc(50vw - 50%)
			overflow hidden
			overflow-x auto
			-ms-overflow-style none
			scrollbar-width none
			flex-wrap nowrap

		&::-webkit-scrollbar
			display none

		&__wrapper
			margin-top 96px

		&__item
			padding 10px
			max-width 50%
			flex-grow 1

			&:nth-child(even)
				padding-right 0px
				padding-left 10px
			&:nth-child(odd)
				padding-left 0px
				padding-right 10px

			&__main
				padding 10px

				&:nth-child(even)
					padding-right 10px
					padding-left 10px
				&:nth-child(odd)
					padding-left 10px
					padding-right 10px
				&:last-child
					padding-right 0px
				&:first-child
					padding-left 0px

				@media screen and (min-width: 1313px)
					flex 1 0 0px

				@media screen and (min-width: 481px) and (max-width: 1312px)
					max-width 50%
					flex-grow 1

					&:nth-child(even)
						padding-right 0px
						padding-left 10px
					&:nth-child(odd)
						padding-left 0px
						padding-right 10px


			@media screen and (max-width: 480px)
				max-width unset
				width 60vw
				flex-shrink 0

	.home
		&__content
			max-width var(--content-max-width-big)
			margin-inline auto

			&__get-started
				display flex
				align-items center

				&__image
					width 50%
					margin-right 48px
					margin-bottom -100px
				
				&__content
					width 50%
					margin-bottom -80px

					&__title
						margin-block 10px

					&__desc
						margin-top 32px

			&__intro
				display flex
				align-items top
				justify-content space-between

				&__image
					margin-left 16px
					margin-right calc(50% - 50vw)
					width 50%

				&__content
					width 100%

					&__small
						width 50%

					&__desc
						margin-top 2rem
						font-size 21px

					&__links
						display flex

					&__link
						width 45%
						padding-inline unset

						&__icon
							margin-left 5px
							width 10px
							height 10px

			&__overview
				width 50%

				&__content
					margin-top 2rem 

					&__item
						&:first-child
							padding-top 0px

	@media screen and (max-width: 832px)
		.home
			&__content
				&__intro
					flex-direction column

					&__content
						&__small
							width 100%

						&__links
							flex-direction row

						&__link
							justify-content center
							width 100%
							margin-left 0

							&:last-child
								margin-left var(--spacing-6)

					&__image
						width 100%
						margin-inline calc(50% - 50vw)
						margin-bottom 32px

				&__overview
					margin-top var(--spacing-12)
					flex-direction column
					width 100%

					&__title
						width 100%
						margin-right 0

					&__content
						width 100%

						&__item
							&:first-child
								padding-top 32px
	
	@media screen and (max-width: 480px)
		.home
			&__content
			
				&__intro
					&__content
						&__links
							flex-direction column
						&__link
							&:last-child
								margin-left 0

				&__get-started
					flex-direction column

					&__image
						width 100vw
						margin-inline calc(50% - 50vw)
						margin-bottom -100px
					
					&__content
						width 100%
						margin-bottom 32px

		.resources
			&__wrapper
				margin-top 64px
</style>

<script>
import { scrollToHeader } from "../theme/utils/helpers";

export default {
	updated() {
		this.$nextTick(function () {
			scrollToHeader();
		});
	},
	data: () => {
		return {
			filterTags: {}
		}
	},
	computed: {
		modules() {
			let modules = null;

			if (this.$frontmatter.modules) {
				modules = this.$frontmatter.modules;
			} else {
				const path = this.$page.path.split("/").filter(item => item !== "");
				const folderPath = this.$frontmatter.main ? path[0] : path[1];
				const submodules = this.$site.pages
					.filter(page => page.path.includes(folderPath) && (this.$frontmatter.main ? page.path != this.$page.path : true))
					.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
				modules = Object.values(this.formatModules(submodules));
			}
			
			return modules.sort((a, b) => a.number - b.number);
		}
	},
	methods: {
		isTagActive(key, tagKey) {
			return this.filterTags[key]?.includes(tagKey);
		},
		onTagFiltersChange(key, tagKey) {
			const tags = this.filterTags[key] || [];
			if (this.isTagActive(key, tagKey)) {
				const index = tags.indexOf(tagKey)
				if (index !== -1) tags.splice(index, 1);
			} else {
				tags.push(tagKey);
			}

			this.$set(this.filterTags, key, tags);
		},
		formatModules(submodules) {
			return submodules.reduce((formattedModules, item) => {
				const index = item.path.split("/").filter(item => item !== "")[1];
				
				if (!formattedModules[index]) {
					formattedModules[index] = {
						title: item.frontmatter.parent?.title,
						description: item.frontmatter.parent?.description,
						number: item.frontmatter.parent?.number,
						submodules: [{
							title: item.title,
							description: item.frontmatter.description,
							tag: item.frontmatter.tag,
							url: item.path,
							order: item.frontmatter.order
						}]
					};
					if (item.path != this.$page.path) {
						formattedModules[index].url = item.path;
					}
				} else {
					formattedModules[index].submodules = (formattedModules[index].submodules || []).concat({
						title: item.title,
						description: item.frontmatter.description,
						tag: item.frontmatter.tag,
						url: item.path,
						order: item.frontmatter.order
					});
					if (!formattedModules[index].title && item.frontmatter.parent?.title) {
						formattedModules[index].title = item.frontmatter.parent?.title;
					}
					if (!formattedModules[index].description && item.frontmatter.parent?.description) {
						formattedModules[index].description = item.frontmatter.parent?.description;
					}
					if (!formattedModules[index].number && item.frontmatter.parent?.number) {
						formattedModules[index].number = item.frontmatter.parent?.number;
					}
					if (!formattedModules[index].url) {
						formattedModules[index].url = item.path;
					}
				}

				return formattedModules;
			}, {});
		}
	}
}
</script>
