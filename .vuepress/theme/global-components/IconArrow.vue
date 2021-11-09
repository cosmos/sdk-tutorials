<template lang="pug">
  .icon
    svg(v-if="!this.iconType || this.iconType === 'top-right'" width="100%" height="100%" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg")
      path(d="M0.836491 13.7697C0.543598 14.0626 0.543598 14.5374 0.836492 14.8303C1.12939 15.1232 1.60426 15.1232 1.89715 14.8303L0.836491 13.7697ZM14.7729 1.95457C15.0658 1.66168 15.0658 1.1868 14.7729 0.893912C14.48 0.601019 14.0051 0.601019 13.7122 0.893913L14.7729 1.95457ZM14.6668 1H15.4168V0.25H14.6668V1ZM4.48498 0.25C4.07077 0.25 3.73498 0.585786 3.73498 1C3.73498 1.41421 4.07077 1.75 4.48498 1.75V0.25ZM13.9168 11.1818C13.9168 11.596 14.2526 11.9318 14.6668 11.9318C15.081 11.9318 15.4168 11.596 15.4168 11.1818H13.9168ZM1.89715 14.8303L14.7729 1.95457L13.7122 0.893913L0.836491 13.7697L1.89715 14.8303ZM14.6668 0.25H4.48498V1.75H14.6668V0.25ZM15.4168 11.1818V1H13.9168V11.1818H15.4168Z" :fill="this.fill || 'var(--color-text)'")

    svg(v-if="this.iconType === 'right'" width="100%" height="100%" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M21.4141 9.00009L12.9999 0.58588L11.5857 2.00009L17.5857 8.00006L0 8.00006L0 10.0001H17.5857L11.5857 16.0001L12.9999 17.4143L21.4141 9.00009Z" :fill="this.fill || 'var(--color-text)'")

    svg(v-if="this.iconType === 'bottom'" width="100%" height="100%" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M5.82395 4.53224L6.56259 3.82102L9.966 0.40625L11.0001 1.42898L5.82395 6.59375L0.65918 1.42898L1.67054 0.40625L5.08532 3.82102L5.82395 4.53224Z" :fill="this.fill || 'var(--color-text)'")

</template>

<script>
export default {
  props: [
    'type', // Arrow direction (top-right, right, bottom)
    'fill' // fill color
  ],
  data() {
    return {
        iconType: this.type || 'top-right'
    };
  }
}
</script>
