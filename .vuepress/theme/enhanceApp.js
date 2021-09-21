import TmCodeBlock from "./global-components/TmCodeBlock.vue";
import TmSidebarContent from "./global-components/TmSidebarContent.vue";

export default ({ Vue }) => {
  Vue.component("TmCodeBlock", TmCodeBlock);
  Vue.component("TmSidebarContent", TmSidebarContent);
};
