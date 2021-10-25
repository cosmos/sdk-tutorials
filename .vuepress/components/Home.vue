<template lang="pug">
	div.home
		.mode-switch-container
			.mode-switch-container__wrapper
				tm-mode-switch
		custom-header
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

		.home__footer
			tm-footer(full="true")
</template>


<style lang="stylus" scoped>
	.modules
		display flex
		flex-direction column

		&__item
			margin-top 32px

	.mode-switch-container
		position absolute
		padding-top 1rem
		top 3rem
		left 50%
		margin-inline auto

		&__wrapper
			position relative
			left -50%

	.home
		&__footer
			padding-inline 128px

		&__content
			padding-inline 128px
			margin-top 32px

			&__get-started
				display flex
				align-items center

				&__image
					width 50%
					margin-right 48px
					margin-bottom -100px
				
				&__content
					width 50%

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
			&__footer
				padding-inline 24px

			&__content
				padding-inline 24px

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
		
	@media screen and (min-width: 480px) and (max-width: 1024px)
		.home
			&__footer
				padding-inline 48px

			&__content
				padding-inline 48px
</style>
