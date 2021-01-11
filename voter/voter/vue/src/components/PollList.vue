<template>
  <div>
    
    <div v-for="poll in polls" v-bind:key="poll.id">
      <SpH3>
        Poll {{ poll.title }}
      </SpH3>
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
import * as sp from "@tendermint/vue";
import AppRadioItem from "./AppRadioItem";
import AppText from "./AppText";
import {countBy } from "lodash"
export default {
  components: { AppText, AppRadioItem, ...sp },
  data() {
    return {
      selected: ""
    };
  },
  computed: {
    polls() {
      return this.$store.state.cosmos.data["voter/poll"] || [];
    },
    votes() {
      return this.$store.state.cosmos.data["voter/vote"] || [];
    }
  },
  methods: {
    results(id) {
      const results = this.votes.filter(v => v.pollID === id);
      return countBy(results, "value");
    },
    async submit(pollID, value) {
      const type = { type: "vote" };
      const body = { pollID, value };
      await this.$store.dispatch("cosmos/entitySubmit", { ...type, module:"voter", body });
      await this.$store.dispatch("cosmos/entityFetch", {...type, module: "voter"});
    }
  }
};
</script>