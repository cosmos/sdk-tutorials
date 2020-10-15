<template>
  <div>
    <div class="sp-container">
      <sp-sign-in />
      <sp-bank-balances />
      <sp-token-send />
      <upload-proof />
      <!-- this line is used by starport scaffolding # 4 -->
      <sp-type-form type="claim" :fields="['proof']" />
    </div>
  </div>
</template>

<script>
import * as sp from "@tendermint/vue";
import UploadProof from "@/components/UploadProof";

export default {
  components: { ...sp, UploadProof },
};
</script>
