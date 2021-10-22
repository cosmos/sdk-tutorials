<template lang="pug">
	div.home
		.mode-switch-container
			.mode-switch-container__wrapper
				tm-mode-switch
		custom-header
		.home__content
			h1 Developer Portal
			card(imageUrl="/graphics-sdk-course.png" mobileImageUrl="/graphics-sdk-course-mobile.png").home__content__intro
				.overline-label welcome to
				h2.home__content__intro__title Cosmos Academy
				.home__content__intro__desc Cosmos is a network of interoperable blockchains build on BFT consensus. 
				.home__content__intro__desc The ever-expanding ecosystem provides SDKs, tokens and wallets, applications and services. Discover the Cosmos SDK to develop application-specific blockchains. 
				.home__content__intro__desc Are you ready to begin your journey through the Cosmos?
				.home__content__intro__link Start course
					icon-arrow(type="right").home__content__intro__link__icon
			.modules
				card-module(v-for="module in $frontmatter.modules" :module="module").modules__item

		.home__footer
			tm-footer(full="true")
</template>


<style lang="stylus" scoped>
	.modules
		display flex
		flex-direction column
		margin-top 48px

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

				@media screen and (max-width: 480px)
					padding-inline 24px
				
				@media screen and (min-width: 480px) and (max-width: 1024px)
					padding-inline 48px

				@media screen and (min-width: 1025px)
					padding-inline 124px

		&__content
			padding-inline 128px
			margin-top 32px

			@media screen and (max-width: 480px)
				padding-inline 24px
		
			@media screen and (min-width: 480px) and (max-width: 1024px)
				padding-inline 48px

			&__intro

				&__title
					margin-block 10px

				&__desc
					margin-top 20px

				&__link
					display flex
					font-weight 500
					color var(--color-text-strong)
					margin-top 20px

					&__icon
						margin-block auto
						margin-left 5px
						width 15px
						height 15px
</style>
