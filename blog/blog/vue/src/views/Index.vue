<template>
  <div>
    <div class="sp-container">
      <sp-sign-in />
      <sp-bank-balances />
      <sp-token-send />
      <!-- this line is used by starport scaffolding # 4 -->
      <sp-type-form path="example.blog.blog" type="post" :fields="[ ['creator', 1, 'string'] , ['body', 2, 'string'] , ['postID', 3, 'string'] ]" />
    </div>
  </div>
</template>

<script>
import * as sp from "@tendermint/vue";

export default {
  components: { ...sp },
};
</script>
