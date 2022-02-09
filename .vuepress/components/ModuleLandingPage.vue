<template lang="pug">
	.home__content(:class="$frontmatter.main ? 'mt-10' : ''")
		.home__content__intro(v-if="$frontmatter.intro" v-for="intro in $frontmatter.intro").mb-10
			.home__content__intro__content(:class="intro.image ? 'home__content__intro__content__small' : ''")
				.tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted(v-if="intro.overline") {{intro.overline}}
				h2.home__content__intro__content__title {{intro.title}}
				.home__content__intro__content__desc(v-html="intro.description" :class="intro.image ? 'tm-measure-narrower' : ''")
				a.tm-button.tm-button-disclosure.mt-7(v-if="intro.action" :href="intro.action.url")
					span {{intro.action.label}}
			.home__content__intro__image(v-if="intro.image")
				tm-image(:src="intro.image")
		.home__content__overview(v-if="$frontmatter.overview")
			h2.home__content__overview__title {{$frontmatter.overview.title}}
			.home__content__overview__content(v-if="$frontmatter.overview.items")
				tm-faq.home__content__overview__content__item(v-for="item in $frontmatter.overview.items" :title="item.title" :description="item.description")

		.modules(v-if="this.modules && this.modules[0].submodules && this.modules[0].submodules.length > 1")
			h2 Course Modules
			card-module(v-for="module in this.modules" :module="module" :main="$frontmatter.main").modules__item
		.resources__wrapper(v-if="$themeConfig.resources")
			h3.resources__title Developer resources
			.resources
				.resources__item(v-for="resource in $themeConfig.resources" :class="$frontmatter.main && 'resources__item__main'")
					resource(:title="resource.title" :description="resource.description" :links="resource.links" :image="resource.image")
</template>


<style lang="stylus" scoped>
	h2
		margin-block 10px
	.modules
		margin-top 96px
		display flex
		flex-direction column

		&__item
			margin-top 64px

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
				align-items center

				&__image
					margin-left 16px
					margin-right calc(50% - 50vw)
					width 50%

				&__content
					width 100%

					&__small
						width 50%

					&__desc
						margin-top 20px
						font-size 21px

					&__link
						display flex
						font-weight 500
						color var(--background-color-primary)
						margin-top 32px
						background var(--color-text)
						border-radius 10px
						padding-block 20px
						padding-inline 60px
						width fit-content

						&__icon
							margin-left 5px
							width 10px
							height 10px

			&__overview
				margin-top 96px
				display flex

				&__title
					width 50%

				&__content
					width 50%

					&__item
						&:first-child
							padding-top 0px

					
	
	@media screen and (max-width: 480px)
		.home
			&__content
				&__intro
					flex-direction column-reverse

					&__content
						&__small
							width 100%

						&__link
							justify-content center
							width 100%

					&__image
						width 100%
						margin-inline calc(50% - 50vw)
						margin-bottom 32px

				&__overview
					flex-direction column

					&__title
						width 100%

					&__content
						width 100%

						&__item
							&:first-child
								padding-top 32px

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
export default {
	computed: {
		modules() {
			const path = this.$page.path.split("/").filter(item => item !== "");
			const folderPath = this.$frontmatter.main ? path[0] : path[1];
			const submodules = this.$site.pages
				.filter(page => page.path.includes(folderPath) && (this.$frontmatter.main ? page.path != this.$page.path : true))
				.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
			const modules = this.formatModules(submodules);
			
			return Object.values(modules).sort((a, b) => a.number - b.number);
		}
	},
	methods: {
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
