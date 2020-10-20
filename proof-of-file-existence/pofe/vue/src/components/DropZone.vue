<template>
  <div>
    <sp-h3>Calculate Proof</sp-h3>
    <div id="drop-zone" @drop.prevent="hash" @dragover.prevent>
      {{ hashed || placeholderText }}
    </div>
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
      placeholderText: "Drag and drop a file here",
      hashed: "",
      flight: false,
    };
  },
  methods: {
    hash(e) {
      const files = e.dataTransfer.items;
      if (!files.length) return;
      // Read the file and hash it
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.hashed = sha256(ev.target.result);
      };
      reader.readAsArrayBuffer(files[0].getAsFile());
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
    },
  },
};
</script>

<style scoped>
#drop-zone {
  font-family: "Inter", "Helvetica", sans-serif;
  height: 20rem;
  line-height: 20rem;
  font-size: 1.25rem;
  background-color:rgb(247, 247, 247);
  text-align: center;
  margin-bottom: 2rem;
  border-radius: 0.5rem;
}
</style>
