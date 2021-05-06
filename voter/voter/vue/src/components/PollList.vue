<template>
  <div>
    <SpH3> List of Polls </SpH3>
    <div v-for="poll in polls" v-bind:key="'poll' + poll.id">
      <SpH3> {{poll.id}}. {{ poll.title }} </SpH3>
      <app-radio-item
        class="option-radio"
        @click="submit(poll.id, option)"
        v-for="option in poll.options"
        v-bind:key="option"
        :value="option"
      />
      <app-text type="subtitle">Results: {{ results(poll.id) }}</app-text>
    </div>
  </div>
</template>
<style>
.option-radio > .button {
  height: 40px;
  width: 50%;
}
</style>
<script>
import AppRadioItem from "./AppRadioItem";
import AppText from "./AppText";
import { countBy } from "lodash";

export default {
  components: { AppText, AppRadioItem },
  data() {
    return {
      selected: "",
    };
  },
  computed: {

		currentAccount() {
			if (this._depsLoaded) {
				if (this.loggedIn) {
					return this.$store.getters['common/wallet/address']
				} else {
					return null
				}
			} else {
				return null
			}
		},
		loggedIn() {
			if (this._depsLoaded) {
				return this.$store.getters['common/wallet/loggedIn']
			} else {
				return false
			}
		},
    polls() {
      return (
        this.$store.getters["username.voter.voter/getPollAll"]({
          params: {}
        })?.Poll ?? []
      );
    },
    votes() {
      return (
        this.$store.getters["username.voter.voter/getVoteAll"]({
          params: {}
        })?.Vote ?? []
      );
    },
  },
  methods: {
    results(id) {
      const results = this.votes.filter((v) => v.pollID === id);
      return countBy(results, "option");
    },
    async submit(pollID, option) {
      
      const value = { creator: this.currentAccount, pollID, option };
      await this.$store.dispatch("username.voter.voter/sendMsgCreateVote", {
        value,
        fee: [],
      });
      await this.$store.dispatch("username.voter.voter/QueryPollAll", {
        options: { subscribe: true, all: true },
        params: {},
      });
    },
  },
};
</script>
