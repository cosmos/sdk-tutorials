<template lang="pug">
  div
    .h1 Page Not Found
    .p The page you visited either does not exist or has been moved. We're sorry for the inconvenience.
    .p #[a(href="/") Back to home]
</template>

<style lang="stylus" scoped>
a
  color var(--color-link, blue)
  outline-color var(--color-primary, blue)
  border-radius 0.25rem
  transition opacity 0.3s ease-out

  &:hover
    text-decoration underline

  &:active
    opacity 0.65
    transition-duration 0s

.h1
  font-size 3rem
  margin-bottom 4rem
  line-height 3.5rem
  letter-spacing -0.02em
  font-weight 700

.h2
  font-size 2rem
  margin-top 3.75rem
  margin-bottom 1.25rem
  line-height 2.5rem
  letter-spacing -0.01em
  font-weight 700

.p
  font-size 1.125rem
  line-height 1.8125rem
  margin-top 1em
  margin-bottom 1em
</style>
