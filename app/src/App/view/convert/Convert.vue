<template>
  <div class="convert_container" v-loading="tradeBuyLoading || tradeSellLoading">
    <el-button
      size="mini"
      @click="showBalance"
      style="position: absolute;left: 30px;top: 20px;z-index: 1000"
    >查余额</el-button>
    <asset-back title="兑换" backPath="/coin?coin=game"></asset-back>
    <section class="ope">
      <div class="left">
        <img v-if="convert=='B2G'" src="../../../assets/images/btyLogo.png" alt />
        <img v-else src="../../../assets/images/gameLogo.png" alt />
        <p class="coin">{{convert=='B2G'?'BTY':'GAME'}}</p>
        <input
          :class="isInput?'error':''"
          v-model="exportVal"
          @input.prevent="inputHandle($event,'from')"
          type="number"
          placeholder="转出数量"
        />
        <p class="balance">余额{{asset.amt| numFilter(2)}}{{convert=='B2G'?'BTY':'GAME'}}</p>
      </div>
      <img @click="exchangeHandle" src="../../../assets/images/exchange.png" alt />
      <div class="right">
        <img v-if="convert=='B2G'" src="../../../assets/images/gameLogo.png" alt />
        <img v-else src="../../../assets/images/btyLogo.png" alt />
        <p class="coin">{{convert=='G2B'?'BTY':'GAME'}}</p>
        <input
          :class="isInput?'error':''"
          v-model="receiptVal"
          @input.prevent="inputHandle($event,'to')"
          type="number"
          placeholder="收到数量"
        />
      </div>
    </section>
    <section class="desc">
      <div>
        <p>汇率</p>
        <p>1{{convert=='B2G'?'BTY':'GAME'}}={{convert=='B2G'?rate:1/rate}}{{convert=='G2B'?'BTY':'GAME'}}</p>
      </div>
      <div>
        <p>手续费</p>
        <p>0.01</p>
      </div>
      <div>
        <p>最小</p>
        <p>{{BUY_LIMIT.minAmt | longFilter(2)}}</p>
      </div>
      <div>
        <p>最大</p>
        <p>{{BUY_LIMIT.maxAmt | longFilter(2)}}</p>
      </div>
      <div>
        <p>每手数量</p>
        <p>{{BUY_LIMIT.amtPerBoardlot | longFilter(2)}}</p>
      </div>
      <p>温馨提示：跨链兑换支持使用BTY兑换GAME，也可将GAME兑换成BTY。</p>
    </section>
    <p @click="convertHandle">{{isOperatoring?'兑换中，请稍后...':'跨链兑换'}}</p>
  </div>
</template>

<script>
import AssetBack from "@/components/AssetBack.vue";
import walletAPI from "@/mixins/walletAPI.js";
import parallelAPI from "@/mixins/parallelAPI.js";
import { createNamespacedHelpers } from "vuex";
import Long from "long";
const accountHelpers = createNamespacedHelpers("Account");
const nodeHelpers = createNamespacedHelpers("Node");

export default {
  mixins: [walletAPI, parallelAPI],
  components: { AssetBack },
  computed: {
    ...accountHelpers.mapState(["currentAccount", "mainAsset", "paraAsset"]),
    ...nodeHelpers.mapState(["mainNode", "paraNode"]),
    percentFee(val) {
      // let value = parseFloat(val)
      // let str=Number(value*100).toFixed(1);
      // console.log(str)
      // str+="%";
      // return str;
    }
  },
  data() {
    return {
      convert: "B2G",
      exportVal: null,
      receiptVal: null,
      isInput: false,
      isOperatoring: false,
      asset: {
        amt: 10.0
      },
      rate: 1, //待删
      fee: 0.01,

      tradeBuyLoading: true,
      tradeSellLoading: true
    };
  },
  methods: {
    showBalance() {
      let addr = this.currentAccount.address;
      let mainUrl = this.mainNode.url;
      let paraUrl = this.paraNode.url;

      console.log("=====================================================");
      this.getAddrBalance(addr, "coins", mainUrl).then(res => {
        console.log("0.bty", res[0].balance);
      });

      this.getAddrBalance(addr, "paracross", mainUrl).then(res => {
        console.log("1.main para", res[0].balance);
      });

      this.$chain33Sdk.getTokenBalance;

      let paraName = this.paraNode.name;

      this.getAddrBalance(
        addr,
        "user.p." + paraName + ".paracross",
        paraUrl,
        "paracross",
        "coins.bty"
      ).then(res => {
        console.log("2.para para", res[0].balance);
      });

      this.getAddrBalance(
        addr,
        "user.p." + paraName + ".trade",
        paraUrl,
        "paracross",
        "coins.bty"
      ).then(res => {
        console.log("3.trade bty", res[0].balance);
      });

      this.getAddrBalance(addr, "user.p." + paraName + ".trade", paraUrl).then(
        res => {
          console.log("4.trade", res[0].balance);
        }
      );

      this.getAddrBalance(addr, "coins", paraUrl).then(res => {
        console.log("5.gbt", res[0].balance);
      });
    },

    inputHandle(e, v) {
      this.isInput = false;
      if (!e.target.value || e.target.value < 0) {
        this.exportVal = null;
        this.receiptVal = null;
        return;
      }
      let val = null;
      if (v == "to") {
        if (this.convert == "B2G") {
          val = this.asset.amt * this.rate;
          this.exportVal = this.receiptVal / this.rate;
        } else {
          val = this.asset.amt / this.rate;
          this.exportVal = this.receiptVal * this.rate;
        }
      } else {
        if (this.convert == "B2G") {
          this.receiptVal = this.exportVal * this.rate;
        } else {
          this.receiptVal = this.exportVal / this.rate;
        }
        val = this.asset.amt;
      }

      if (this.convert == "B2G") {
        let exportLong = Long.fromValue(parseInt(this.exportVal * 1e8));
        let errMsg = null;
        // if (e.target.value > val) {
        //   errMsg = "余额不足";
        // }
        // if (exportLong.lessThan(this.BUY_LIMIT.minAmt)) {
        //   errMsg = "兑换最小数量为 " + parseInt(this.BUY_LIMIT.minAmt / 1e8);
        // }
        // if (exportLong.greaterThan(this.BUY_LIMIT.maxAmt)) {
        //   errMsg = "可兑换最大数量为 " + parseInt(this.BUY_LIMIT.maxAmt / 1e8);
        // }
        // if (
        //   exportLong.modulo(this.BUY_LIMIT.amtPerBoardlot).notEquals(Long.ZERO)
        // ) {
        //   errMsg =
        //     "输入数量应为 " +
        //     parseInt(this.BUY_LIMIT.amtPerBoardlot / 1e8) +
        //     " 的倍数";
        // }
        if (errMsg) {
          this.isInput = true;
          this.$message.error(errMsg);
          setTimeout(() => {
            this.exportVal = null;
            this.receiptVal = null;
            this.isInput = false;
          }, 500);
        }
      } else {
      }
    },
    convertResHandle(res) {
      if (res === "success") {
        this.$alert("请关注收款地址的资金变动。", "兑换成功", {
          confirmButtonText: "确认",
          closeOnClickModal: true,
          center: true,
          showClose: false
        });
      } else {
        let resObject = JSON.parse(res);
        this.$alert(resObject.desc + " " + resObject.msg, "兑换失败", {
          confirmButtonText: "确认",
          closeOnClickModal: true,
          center: true,
          showClose: false
        });
      }
      this.isOperatoring = false;
      this.exportVal = "";
      this.receiptVal = "";
    },
    convertHandle() {
      if (this.isOperatoring) {
        return;
      }
      this.isOperatoring = true;
      if (this.exportVal) {
        if (this.currentAccount) {
          // B2G
          if (this.convert == "B2G") {
            this.transferBTY2GameCoin(
              this.currentAccount.hexPrivateKey,
              parseInt(this.exportVal * 1e8),
              this.convertResHandle
            );
          } else if (this.convert == "G2B") {
            this.transferGameCoin2BTY(
              this.currentAccount.hexPrivateKey,
              parseInt(this.exportVal * 1e8),
              this.convertResHandle
            );
          }
        } else {
          this.isOperatoring = false;
        }
      } else {
        this.isOperatoring = false;
        this.isInput = true;
        setTimeout(() => {
          this.isInput = false;
        }, 3000);
        this.$message.error("请输入兑换数量");
      }
    },
    exchangeHandle() {
      if (this.convert == "B2G") {
        this.convert = "G2B";
        this.asset = this.paraAsset;
      } else {
        this.convert = "B2G";
        this.asset = this.mainAsset;
      }
      this.exportVal = null;
      this.receiptVal = null;
    },

    requestTradeOrder() {
      this.getTradeBuyOrder(this.paraNode.url).then(res => {
        setTimeout(() => {
          this.tradeBuyLoading = false;
          if (res !== "success") {
            this.$message.error(JSON.parse(res).desc);
          }
        }, 600);
        console.log("BUY_ID:" + this.BUY_ID);
      });
      this.getTradeSellOrder(this.paraNode.url).then(res => {
        setTimeout(() => {
          this.tradeSellLoading = false;
          if (res !== "success") {
            this.$message.error(JSON.parse(res).desc);
          }
        }, 600);
        console.log("SELL_ID:" + this.SELL_ID);
      });
    }
  },
  mounted() {
    this.refreshMainAsset();
    this.refreshParaAsset();
    setTimeout(() => {
      this.asset = this.mainAsset;
    }, 0);

    this.tradeBuyLoading = false;
    this.tradeSellLoading = false;
    // this.requestTradeOrder();
  }
};
</script>

<style lang='scss'>
.convert_container {
  width: 100%;
  height: 100vh;
  background-image: url("../../../assets/images/lightColorBg.png");
  background-size: 100% 100%;
  section.ope {
    margin: 35px 44px 24px 55px;
    display: flex;
    justify-content: space-between;
    > img {
      width: 32px;
      height: 24px;
      position: relative;
      top: 13px;
      cursor: pointer;
    }
    > div {
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 47px;
      }
      p.coin {
        font-size: 18px;
        font-family: MicrosoftYaHei;
        font-weight: bold;
        color: rgba(22, 42, 84, 1);
        line-height: 1;
        margin: 7px 0 30px;
      }
      input {
        width: 100px;
        padding: 5px 11px 5px;
        border: 1px solid rgba(22, 42, 84, 0.61);
        font-size: 14px;
        font-family: MicrosoftYaHei;
        // color:rgba(223,223,223,1);
        &::-webkit-input-placeholder {
          /* Chrome/Opera/Safari */
          color: rgba(223, 223, 223, 1);
        }
        // ::focus{
        //     border: 1px solid red;
        // }
        &.error {
          border: 1px solid red;
        }
      }
      p.balance {
        font-size: 12px;
        font-family: MicrosoftYaHei;
        font-weight: 400;
        color: rgba(209, 209, 209, 1);
        line-height: 1;
        margin-top: 7px;
      }
    }
  }
  section.desc {
    margin: 0 56px 0 55px;
    div {
      margin-bottom: 9px;
      // &:nth-of-type(2) {
      //   margin: 17px 0 20px;
      // }
      display: flex;
      justify-content: flex-start;
      align-items: center;
      p {
        font-size: 16px;
        font-family: MicrosoftYaHei;
        font-weight: 400;
        color: rgba(22, 42, 84, 1);
        line-height: 1;
        &:nth-of-type(1) {
          width: 130px;
          opacity: 0.67;
        }
      }
    }
    > p {
      font-size: 16px;
      font-family: MicrosoftYaHei;
      font-weight: 400;
      color: rgba(22, 42, 84, 0.67);
      line-height: 24px;
    }
  }
  > p {
    margin: 12px 26px 0 29px;
    height: 66px;
    background-image: url("../../../assets/images/loginBtn.png");
    background-size: 100% 100%;
    text-align: center;
    padding: 12px 0 18px;
    font-size: 16px;
    font-family: MicrosoftYaHei;
    font-weight: 400;
    color: rgba(255, 255, 255, 1);
    line-height: 1;
    cursor: pointer;
  }
}
</style>
