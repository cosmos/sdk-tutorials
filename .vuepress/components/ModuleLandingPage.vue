<template lang="pug">
	custom-layout(:hideMobileMenu="true")
		.home__content
			.home__content__intro(v-if="$frontmatter.intro")
				.home__content__intro__content(:class="$frontmatter.intro.image ? 'home__content__intro__content__small' : ''")
					.tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted(v-if="$frontmatter.intro.overline") {{$frontmatter.intro.overline}}
					h2.home__content__intro__content__title {{$frontmatter.intro.title}}
					.home__content__intro__content__desc(v-html="$frontmatter.intro.description" :class="$frontmatter.intro.image ? 'tm-measure-narrower' : ''")
					a.tm-button.mt-7(v-if="$frontmatter.intro.action" :href="$frontmatter.intro.action.url")
						span {{$frontmatter.intro.action.label}} &rarr;
				.home__content__intro__image(v-if="$frontmatter.intro.image")
					img(:src="$frontmatter.intro.image")
			.home__content__get-started(v-if="$frontmatter.main")
				.home__content__get-started__image
					img(width="100%" src="/graphics-sdk-course-1.png")
				.home__content__get-started__content
					.tm-overline.tm-rf-1.tm-lh-title.tm-medium.tm-muted get started
					h2.home__content__get-started__content__title Ready to start?
					.home__content__get-started__content__desc
						div If you just want to get started right away, why not begin with the introductory chapter?
						div If you are unsure which sections to tackle, keep an eye out for the Deep dive and Fast track tags for orientation.
			.modules
				card-module(v-for="module in this.modules" :module="module" :startExpanded="!$frontmatter.main").modules__item
			.resources__wrapper(v-if="$frontmatter.resources")
				h3.resources__title Developer resources
				.resources
					.resources__item(v-for="resource in $frontmatter.resources")
						.resources__item__icon
							img(:src="resource.image" :alt="resource.title")
						h5.resources__item__title {{resource.title}}
						.resources__item__description {{resource.description}}
						.resources__item__links
							a(v-for="link in resource.links" :href="link.url" target="_blank").tm-link.tm-link-external.tm-medium
								span {{link.name}}
</template>


<style lang="stylus" scoped>
	.modules
		display flex
		flex-direction column

		&__item
			margin-top 64px

	.resources
		display flex
		margin-top 32px
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

		&__wrapper
			margin-top 96px

		&__item
			padding 32px
			margin 10px
			display flex
			flex-direction column
			justify-content space-between
			border-radius 16px
			background var(--background-color-secondary)

			@media screen and (min-width: 1025px)
				flex 1 1 0px

			@media screen and (min-width: 481px) and (max-width: 1024px)
				width 40vw
				flex-shrink 0

			@media screen and (max-width: 480px)
				width 60vw
				flex-shrink 0

			&:last-child
				margin-right 0px
			&:first-child
				margin-left 0px

			&__icon
				margin-right 20px
				margin-bottom 10px

				img
					width 50px
					height 50px
					margin 0
					filter var(--img-filter)

			&__title
				margin-bottom 10px

			&__description
				margin-bottom 20px

			&__links
				display flex

				&__item
					margin-block auto
					margin-right 20px
					cursor pointer
					font-weight 500
					color var(--color-text-strong)
					display flex

					&__icon
						margin-left 5px
						width 10px
						height 10px

	.home
		&__content
			margin-top 64px
			max-width var(--content-max-width)
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
				margin-bottom 32px

				&__image
					margin-left 16px
					margin-right calc(50% - 50vw)
					width 50%

					img
						width 100%

				&__content
					width 100%

					&__small
						width 50%

					&__title
						margin-block 10px

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
				.sort((a, b) => a.path.localeCompare(b.path));
			const modules = this.formatModules(submodules);
			
			return Object.values(modules).map(item => {
				item.submodules.sort((a, b) => a.order - b.order);
				return item;
			});
		},
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
