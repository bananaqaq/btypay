<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import {
  getChromeStorage,
  setChromeStorage,
  clearChromeStorage
} from "@/libs/chromeUtil.js";
import { createNamespacedHelpers } from "vuex";

const accountHelpers = createNamespacedHelpers("Account")
const nodeHelpers = createNamespacedHelpers("Node")

export default {
  methods: {
    ...nodeHelpers.mapActions({
      firstInitMainNode: "FIRST_INIT_MAIN_NODE",
      firstInitParaNode: "FIRST_INIT_PARA_NODE"
    }),
    ...nodeHelpers.mapMutations({
      updateMainNodeList: "UPDATE_MAIN_NODE_LIST",
      updateMainNode: "UPDATE_MAIN_NODE",
      updateParaNodeList: "UPDATE_PARA_NODE_LIST",
      updateParaNode: "UPDATE_PARA_NODE"
    }),
    initDataFromChromeStorage() {
      let keys = ["mainNodeList", "paraNodeList", "mainNode", "paraNode"];
      getChromeStorage(keys).then(data => {
        let mList = data.mainNodeList;
        let pList = data.paraNodeList;
        let mNode = data.mainNode;
        let pNode = data.paraNode;

        if (mList && mList.length !== 0) {
          this.updateMainNodeList(mList);
        } else {
          this.firstInitMainNode();
        }

        if (pList && pList.length !== 0) {
          this.updateParaNodeList(pList);
        } else {
          this.firstInitParaNode();
        }

        if (mNode) {
          this.updateMainNode(mNode);
        }

        if (pNode) {
          this.updateParaNode(pNode);
        }
      });
    },
    initDataFromBackgroundRuntime() {}
  },
  mounted() {
    clearChromeStorage();
    this.initDataFromChromeStorage();
  }
};
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  width: 400px;
  height: 600px;
}
#app {
  width: 400px;
  height: 600px;
  min-height: 600x;
  // background: #dfe7f3;
  background-image: url("../assets/images/indexBg.png");
  background-size: 100% 100%;
  box-sizing: border-box;
  /* 设置滚动条的样式 */
  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
  }
  // /* 滚动槽 */
  // &::-webkit-scrollbar-track {
  // //   border-radius: $--border-radius-base;
  //   background: transparent;
  // }
  // /* 滚动条滑块 */
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 0px;
    opacity: 0.2;
  }
}
</style>
