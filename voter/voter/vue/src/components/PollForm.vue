<template>
      <div>
        <div class="sp-voter__main sp-box sp-shadow sp-form-group">
            <form class="sp-voter__main__form">
              <div class="sp-voter__main__rcpt__header sp-box-header">
                Create a Poll
              </div>

              <input class="sp-input" placeholder="Title" v-model="title" />
              <div v-for="(option, index) in options" v-bind:key="'option' + index">
                <input class="sp-input" placeholder="Option" v-model="option.title" />
              </div>
              <sp-button @click="add">+ Add option</sp-button>
              <sp-button @click="submit">Create poll</sp-button>
            </form>
        </div>
      </div>
</template>

<script>
export default {
      name: "PollForm",
      data() {
        return {
          title: "",
          options: [{
            title: "",
          }],
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
        }
      },
      methods: {
        add() {
          this.options = [...this.options, { title: "" }];
        },
        async submit() {
          const value = {
            creator: this.currentAccount,
            title: this.title,
            options: this.options.map((o) => o.title),
          };
          await this.$store.dispatch("cosmonaut.voter.voter/sendMsgCreatePoll", {
            value,
            fee: [],
          });
        },
      },
    };
</script>
