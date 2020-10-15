<template>
  <div>
    <sp-h3>Calculate Proof</sp-h3>
    <input type="file" @change="hash" id="file" />
    {{ hashed }}
    <sp-button
      @click="submit"
      :loading="flight"
      :disabled="hashed == '' || flight"
      >Submit Proof as a new Claim</sp-button
    >
  </div>
</template>

<script>
import { SpH3, SpButton } from "@tendermint/vue";
import { sha256 } from "js-sha256";

export default {
  components: {
    SpH3,
    SpButton,
  },
  data() {
    return {
      hashed: "",
      flight: false,
    };
  },
  methods: {
    hash(e) {
      const files = e.target.files
      if (!files.length) return;
      
      // Read the file and hash it
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.hashed = sha256(ev.target.result);
      };
      reader.readAsArrayBuffer(files[0]);
    },
    async submit() {
      // Submit
      this.flight = true;
      await this.$store.dispatch("cosmos/entitySubmit", {
        type: "claim",
        body: {
          proof: this.hashed,
        },
      });
      await this.$store.dispatch("cosmos/entityFetch", {
        type: "claim",
      });

      // Clear fields
      this.flight = false;
      this.hashed = "";
      document.getElementById("file").value = "";
    },
  },
};
</script>

<style scoped>
div {
  font-family: "Inter", "Helvetica", sans-serif;
}

input {
  font-size: inherit;
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>
