<template>
  <div>
    <div class="sp-container">
      <sp-sign-in />
      <sp-bank-balances />
      <sp-token-send />
      <!-- this line is used by starport scaffolding # 4 -->
		<sp-type-form type="commit" :fields="['solutionHash', 'solutionScavengerHash', ]" module="scavenge" />
		<sp-type-form type="scavenge" :fields="['description', 'solutionHash', 'reward', 'solution', 'scavenger', ]" module="scavenge" />
    </div>
  </div>
</template>

<script>
import * as sp from "@tendermint/vue";

export default {
  components: { ...sp },
};
</script>
