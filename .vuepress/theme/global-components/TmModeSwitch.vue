<template lang="pug">
  div
    input(@change="toggleTheme" id="checkbox" type="checkbox" class="switch-checkbox")
    label(for="checkbox" class="switch-label")
      span ☀️
      span 🌙
      div(class="switch-toggle" :class="{ 'switch-toggle-checked': userTheme === 'dark-theme' }")
</template>

<script>
  export default {
    mounted() {
      let userThemeMode = localStorage.getItem("vuepress-theme-cosmos-user-theme");
      if (!userThemeMode) {
        userThemeMode = this.getMediaPreference();
      }
      this.setThemeMode(userThemeMode);
    },
    data() {
      return {
        userTheme: "light-theme",
      };
    },
    methods: {
      toggleTheme() {
        const activeTheme = localStorage.getItem("vuepress-theme-cosmos-user-theme");
        if (activeTheme === "light-theme") {
          this.setThemeMode("dark-theme");
        } else {
          this.setThemeMode("light-theme");
        }
      },
      setThemeMode(theme) {
        localStorage.setItem("vuepress-theme-cosmos-user-theme", theme);
        this.userTheme = theme;
        document.documentElement.className = theme;
      },
      getMediaPreference() {
        const hasDarkPreference = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (hasDarkPreference) {
          return "dark-theme";
        } else {
          return "light-theme";
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .switch-checkbox
    display none

  .switch-label
    align-items center
    background var(--color-text)
    border calc(var(--element-size) * 0.025) solid var(--accent-color)
    border-radius var(--element-size)
    cursor pointer
    display flex
    font-size calc(var(--element-size) * 0.3)
    height calc(var(--element-size) * 0.4)
    position relative
    padding calc(var(--element-size) * 0.1)
    transition background 0.5s ease
    justify-content space-between
    width var(--element-size)
    z-index 1

  .switch-toggle
    position absolute
    background-color: var(--background-color-primary)
    border-radius 50%
    left calc(var(--element-size) * 0.1)
    height calc(var(--element-size) * 0.3)
    width calc(var(--element-size) * 0.3)
    transform translateX(0)
    transition transform 0.3s ease, background-color 0.5s ease

  .switch-toggle-checked
    transform translateX(calc(var(--element-size) * 0.6)) !important
    left unset
    right calc(var(--element-size) * 0.7)

</style>
