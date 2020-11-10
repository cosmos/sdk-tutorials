<template>
  <div>
    
    <div v-for="poll in polls" v-bind:key="poll.id">
      <app-text type="h2">Poll {{ poll.title }}</app-text>
      <app-radio-item
        @click.native="submit(poll.id, option)"
        v-for="option in poll.options"
        v-bind:key="option"
        :value="option"
      />
      <app-text type="subtitle">Results: {{ results(poll.id) }}</app-text>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selected: ""
    };
  },
  computed: {
    polls() {
      return this.$store.state.data.poll || [];
    },
    votes() {
      return this.$store.state.data.vote || [];
    }
  },
  methods: {
    results(id) {
      const results = this.votes.filter(v => v.pollID === id);
      return this.$lodash.countBy(results, "value");
    },
    async submit(pollID, value) {
      const type = { type: "vote" };
      const body = { pollID, value };
      await this.$store.dispatch("entitySubmit", { ...type, body });
      await this.$store.dispatch("entityFetch", type);
    }
  }
};
</script>
