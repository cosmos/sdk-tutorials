<template>
  <div>
    <div class="sp-container">
      <sp-sign-in />
      <sp-bank-balances />
      <sp-token-send />
      <drop-zone />
      <!-- this line is used by starport scaffolding # 4 -->
      <sp-type-form type="claim" :fields="['proof']" />
    </div>
  </div>
</template>

<script>
import * as sp from "@tendermint/vue";
import DropZone from "@/components/DropZone";

export default {
  components: { ...sp, DropZone },
};
</script>
