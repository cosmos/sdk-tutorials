<template>
  <div>
    <div class="sp-container">
      <sp-sign-in />
      <sp-bank-balances />
      <sp-token-send />
      <!-- this line is used by starport scaffolding # 4 -->
        <SpH3>
    Polls
    </SpH3>
    <poll-form />
    <poll-list />
    </div>
  </div>
</template>

<script>
import * as sp from "@tendermint/vue";
import PollForm from "../components/PollForm";
import PollList from "../components/PollList";

export default {
  components: { PollForm, PollList, ...sp },
};
</script>
