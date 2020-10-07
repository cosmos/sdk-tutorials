<template>
  <div>
    <app-input placeholder="Title" v-model="title" />
    <div v-for="option in options">
      <app-input placeholder="Option" v-model="option.title" />
    </div>
    <app-button @click.native="add">Add option</app-button>
    <app-button @click.native="submit">Create poll</app-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "",
      options: []
    };
  },
  methods: {
    add() {
      this.options = [...this.options, { title: "" }];
    },
    async submit() {
      const payload = {
        type: "poll",
        body: {
          title: this.title,
          options: this.options.map(o => o.title)
        }
      };
      await this.$store.dispatch("entitySubmit", payload);
			await this.$store.dispatch("entityFetch", payload);
			await this.$store.dispatch("accountUpdate");
    }
  }
};
</script>
