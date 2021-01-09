import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import _ from "lodash";

Vue.config.productionTip = false;

Object.defineProperty(Vue.prototype, "$lodash", { value: _ });

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
