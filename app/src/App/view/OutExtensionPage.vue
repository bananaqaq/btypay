<template>
  <div class="out_extension_page">
    <div v-if="successed=='waiting'">
      <i class="el-icon-loading"></i>
      <p>确认中...</p>
    </div>
    <div v-if="successed=='yes'">
      <i class="el-icon-check"></i>
      <p>投注成功</p>
    </div>
    <div v-if="successed=='no'">
      <i class="el-icon-close"></i>
      <p>投注失败,请稍后重试</p>
    </div>
  </div>
</template>
<script>
import { signRawTx, signGroupTx } from "@/libs/sign.js";
import parallelAPI from "@/mixins/parallelAPI.js"
// import { createNamespacedHelpers } from "vuex";
// const { mapState } = createNamespacedHelpers("Account");
export default {
  mixins:[parallelAPI],
  //   computed: {
  //     ...mapState(["currentAccount"])
  //   },
  data() {
    return {
      successed: "waiting"
    };
  },
  mounted() {
    window.chrome.runtime.getBackgroundPage(win => {
      let time = setTimeout(() => {
        if (this.successed != "yes") {
          this.successed = "no";
          setTimeout(() => {
            win.closeWindow(win.windowId);
          }, 800);
        }
      }, 10000);
      this.parallelCoins2Dice(win.currentAccount.hexPrivateKey,null,win.txObj.amount*1e8,0.001*1e8,win.txObj.url).then(res=>{
        // console.log('outExtension')
        // console.log(res)
        // console.log("xxxxxx", win.txObj.tx)
        let txs = [res,win.txObj.tx]
        return this.createRawTxGroup(txs)
      }).then(tx => {
        // console.log('createRawTxGroup')
        // console.log(tx)
        return signGroupTx(tx, win.currentAccount.hexPrivateKey)
      }).then(signedTx => {
        // console.log('signGroupTx')
        // console.log(signedTx)
        return this.sendTransaction(signedTx, win.txObj.url)
      }).then(res=>{
        // console.log('sendTransactionvvvvvvvv')
        // console.log(res)
        setTimeout(() => {
          this.successed = "yes";
          setTimeout(() => {
            win.closeWindow(win.windowId);
          }, 500);
        }, 300);
      }).catch(err=>{
        console.log('发生错误了')
        console.log(err)
        clearTimeout(time)
        setTimeout(() => {
          this.successed = "no";
          setTimeout(() => {
            win.closeWindow(win.windowId);
          }, 500);
        }, 300);
      })
      // return Promise.resolve()
      //   .then(() => {
      //     return signRawTx(win.txObj.tx, win.currentAccount.hexPrivateKey);
      //   })
      //   .then(signedTx => {
      //     return this.sendTransaction(signedTx, win.txObj.url);
      //   })
      //   .then(res => {
      //     setTimeout(() => {
      //       this.successed = "yes";
      //       setTimeout(() => {
      //         // win.closeWindow(win.windowId);
      //       }, 500);
      //     }, 100);
      //   });
    });
  }
};
</script>
<style lang='scss'>
.out_extension_page {
  > div {
    width: 100%;
    text-align: center;
    color: #fff;
    font-size: 20px;
    position: absolute;
    top: 200px;
    i {
      margin-bottom: 10px;
      font-size: 40px;
    }
  }
}
</style>