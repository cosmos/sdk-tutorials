<template>
  <div>
    <sp-input placeholder="Title" v-model="title" />
    <div v-for="option in options">
      <sp-input placeholder="Option" v-model="option.title" />
    </div>
    <sp-button @click.native="add">+ Add option</sp-button>
    <sp-button @click.native="submit">Create poll</sp-button>
  </div>
</template>

<script>
import * as sp from "@tendermint/vue";
export default {
  components: { ...sp },
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
        module: "voter",
        body: {
          title: this.title,
          options: this.options.map(o => o.title)
        }
      };
      await this.$store.dispatch("cosmos/entitySubmit", payload);
        await this.$store.dispatch("cosmos/entityFetch", payload);
    }
  }
};
</script>