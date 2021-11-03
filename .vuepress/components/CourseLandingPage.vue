<template lang="pug">
	custom-layout
		.home__content
			.home__content__intro
				.home__content__intro__content
					.overline-label welcome to
					h2.home__content__intro__content__title Cosmos Academy
					.home__content__intro__content__desc Cosmos is a network of interoperable blockchains build on BFT consensus. 
					.home__content__intro__content__desc The ever-expanding ecosystem provides SDKs, tokens and wallets, applications and services. Discover the Cosmos SDK to develop application-specific blockchains. 
					.home__content__intro__content__desc Are you ready to begin your journey through the Cosmos?
					a.home__content__intro__content__link Start course
						icon-arrow(fill="var(--background-color-primary)" type="right").home__content__intro__content__link__icon
				.home__content__intro__image
					img(src="/graphics-sdk-course.png")
			.home__content__get-started
				.home__content__get-started__image
					img(width="100%" src="/graphics-sdk-course-1.png")
				.home__content__get-started__content
					.overline-label get started
					h2.home__content__get-started__content__title Ready to start?
					.home__content__get-started__content__desc Get started right away, begin with the introductory chapter.
			.modules
				card-module(v-for="module in $frontmatter.modules" :module="module").modules__item
			.resources__wrapper
				h3.resources__title Developer resources
				.resources
					.resources__item(v-for="resource in $frontmatter.resources")
						.resources__item__icon
							img(:src="resource.image" :alt="resource.title")
						h5.resources__item__title {{resource.title}}
						.resources__item__description {{resource.description}}
						.resources__item__links
							a(v-for="link in resource.links" :href="link.url").resources__item__links__item {{link.name}}
								icon-arrow.resources__item__links__item__icon
</template>


<style lang="stylus" scoped>
	.modules
		display flex
		flex-direction column

		&__item
			margin-top 32px

	.resources
		display flex
		margin-top 32px
		overflow hidden
		overflow-x auto
		-ms-overflow-style none
		scrollbar-width none
		width 100vw
		margin-left calc(50% - 50vw)
		padding-inline calc(50vw - 50%)

		&::-webkit-scrollbar
			display none

		&__wrapper
			margin-top 96px

		&__item
			padding 10px
			margin-block 10px
			display flex
			flex-direction column
			width 25vw
			justify-content space-between

			@media screen and (min-width: 481px) and (max-width: 1024px)
				width 40vw

			@media screen and (max-width: 480px)
				width 80vw

			&:last-child
				padding-right 0px
			&:first-child
				padding-left 0px

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

				&__image
					margin-left 16px
					margin-right calc(50% - 50vw)
					width 50%

					img
						width 100%

				&__content
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
