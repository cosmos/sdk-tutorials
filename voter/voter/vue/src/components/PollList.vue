<template>
    <div>
    <h3> List of Polls </h3>
    <div v-for="poll in polls" v-bind:key="'poll' + poll.id">
        <h4> {{poll.id}}. {{ poll.title }} </h4>
        <AppRadioItem
        @click="submit(poll.id, option)"
        v-for="option in poll.options"
        v-bind:key="option"
        :value="option"
        />
        <AppText type="subtitle">Results: {{ results(poll.id) }}</AppText>
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
        this.$store.getters["cosmonaut.voter.voter/getPollAll"]({
            params: {}
        })?.Poll ?? []
        );
    },
    votes() {
        return (
        this.$store.getters["cosmonaut.voter.voter/getVoteAll"]({
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
        await this.$store.dispatch("cosmonaut.voter.voter/sendMsgCreateVote", {
        value,
        fee: [],
        });
        await this.$store.dispatch("cosmonaut.voter.voter/QueryPollAll", {
        options: { subscribe: true, all: true },
        params: {},
        });
    },
    },
};
</script>
