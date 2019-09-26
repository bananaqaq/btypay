<template>
  <div class="node_container">
    <home-header></home-header>
    <section class="header">
      <router-link :to="{ name: 'WalletIndex'}">
        <img src="../../../assets/images/close.png" alt />
      </router-link>
      <p>节点设置</p>
      <p></p>
    </section>
    <el-button
      size="mini"
      style="position: absolute;right: 30px;top: 20px;z-index: 1000"
      @click="showStorage"
    >查看</el-button>
    <ul>
      <li>
        <p>主链节点设置</p>
        <div class="main">
          <section class="up">
            <div
              v-for="(item,i) in mainNodeList"
              :key="i"
              @click="handleChangeNode(item, 'main')"
            >
              <p class="address">{{item.url}}</p>
              <img v-if="item.uid == mainNode.uid" src="../../../assets/images/selected.png" alt />
              <img
                v-else
                @click.stop="handleDelNode(item.uid, 'main')"
                src="../../../assets/images/deleteNode.png"
                style="width:17px;height:19px"
                alt
              />
              <span
                :style="mainConnectState==3?'color:#EF394A':mainConnectState==1?'color:#f4c36a':''"
                v-if="item.uid == mainNode.uid"
              >{{mainConnectState==1?'连接中':mainConnectState==2?'连接成功':mainConnectState==3?'连接失败':''}}</span>
              <p class="line"></p>
            </div>
          </section>
          <p class="add" @click="mainDialog = true">添加自定义节点</p>
        </div>
      </li>
      <li>
        <p>平行链节点设置</p>
        <div class="parallel">
          <section class="up">
            <div
              v-for="(item,i) in paraNodeList"
              :key="i"
              @click="handleChangeNode(item, 'para')"
            >
              <p class="name">{{item.name}}（{{item.coin}}）</p>
              <p class="address">{{item.url}}</p>
              <img v-if="item.uid == paraNode.uid" src="../../../assets/images/selected.png" alt />
              <img
                v-else
                @click.stop="handleDelNode(item.uid, 'para')"
                src="../../../assets/images/deleteNode.png"
                style="width:17px;height:19px"
                alt
              />
              <span
                :style="paraConnectState==3?'color:#EF394A':paraConnectState==1?'color:#f4c36a':''"
                v-if="item.uid == paraNode.uid"
              >{{paraConnectState==1?'连接中':paraConnectState==2?'连接成功':paraConnectState==3?'连接失败':''}}</span>
              <p class="line"></p>
            </div>
          </section>
          <p class="add" @click="paraDialog=true">添加自定义节点</p>
        </div>
      </li>
    </ul>
    <el-dialog
      title="主链节点设置"
      :visible.sync="mainDialog"
      width="324px"
      :show-close="false"
      class="mainNode"
    >
      <p>请输入您要添加的主链节点地址，建议您使用默认的主链节点</p>

      <el-form :model="mainForm" ref="mainForm" :rules="mainRules" style="margin-top: 20px;">
        <el-form-item prop="url" style="margin-bottom: 0">
          <el-input v-model="mainForm.url" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="mainDialog = false">取消</el-button>
        <el-button type="primary" @click="addMainSubmit">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="平行链节点设置"
      :visible.sync="paraDialog"
      width="324px"
      :show-close="false"
      class="paraNode"
    >
      <el-form :model="paraForm" :rules="paraRules" ref="paraForm">
        <el-form-item label="平行链名称" prop="name">
          <el-input
            v-model="paraForm.name"
            ref="paraName"
            autocomplete="off"
            @input="inputHandle($event,'para')"
          ></el-input>
        </el-form-item>
        <el-form-item label="代币名称" prop="coin">
          <el-input v-model="paraForm.coin" autocomplete="off" @input="inputHandle($event,'para')"></el-input>
        </el-form-item>
        <el-form-item label="节点地址" prop="url">
          <el-input v-model="paraForm.url" autocomplete="off" @input="inputHandle($event,'para')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="paraDialog = false">取消</el-button>
        <el-button type="primary" @click="addParaSubmit">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import HomeHeader from "@/components/HomeHeader.vue";
import walletAPI from "@/mixins/walletAPI.js";
import recover from "@/mixins/recover.js";
import { createNamespacedHelpers } from "vuex";
import { getChromeStorage, setChromeStorage } from "@/libs/chromeUtil";
import { testUrl } from "@/libs/common";

const accountHelpers = createNamespacedHelpers("Account");
const nodeHelpers = createNamespacedHelpers("Node")

export default {
  mixins: [walletAPI, recover],
  components: { HomeHeader },
  computed: {
    ...accountHelpers.mapState([
      "currentAccount",
      "mainAsset",
      "parallelAsset",
      "mainIsConnected",
      "parallelIsConnected"
    ]),
    ...nodeHelpers.mapState([
      "mainNodeList",
      "mainNode",
      "paraNodeList",
      "paraNode",
    ])
  },
  data() {
    var validateMainUrl = (rule, value, callback) => {
      if (!testUrl(value)) {
        callback(new Error("节点地址格式有误！"));
        return;
      }
      for (let node of this.mainNodeList) {
        if (value === node.url) {
          callback(new Error("该节点已经存在！"));
          return;
        }
      }
      callback();
    };
    var validateParaUrl = (rule, value, callback) => {
      if (!testUrl(value)) {
        callback(new Error("节点地址格式有误！"));
        return;
      }
      for (let node of this.paraNodeList) {
        if (value === node.url) {
          callback(new Error("该节点已存在！"));
          return;
        }
      }
      callback();
    };
    return {
      mainDialog: false,
      paraDialog: false,

      //1:连接中；2:连接成功；3:连接失败
      mainConnectState: 1,
      paraConnectState: 1,

      mainForm: {
        url: ""
      },
      mainRules: {
        url: [
          { required: true, message: "请输入节点地址", trigger: "blur" },
          { validator: validateMainUrl, trigger: "blur" }
        ]
      },

      paraForm: {
        name: "",
        coin: "",
        url: ""
      },
      paraRules: {
        name: [
          { required: true, message: "请输入平行链名称", trigger: "blur" }
        ],
        coin: [{ required: true, message: "请输入代币名称", trigger: "blur" }],
        url: [
          { required: true, message: "请输入节点地址", trigger: "blur" },
          { validator: validateParaUrl, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    ...nodeHelpers.mapActions({
      addMainNode: "ADD_MAIN_NODE",
      delMainNode: "DEL_MAIN_NODE",
      changeMainNode: "CHANGE_MAIN_NODE",
      addParaNode: "ADD_PARA_NODE",
      delParaNode: "DEL_PARA_NODE",
      changeParaNode: "CHANGE_PARA_NODE"
    }),

    showStorage() {
      getChromeStorage([
        "mainNode",
        "mainNodeList",
        "paraNode",
        "paraNodeList"
      ]).then(res => {
        console.log("chrome=====================");
        console.log(res);
      });
      console.log("vuex=======================");
      console.log(
        this.mainNode,
        this.mainNodeList,
        this.paraNode,
        this.paraNodeList
      );
    },

    handleChangeNode(node, target) {
      let p1 = target === "main" ? this.changeMainNode(node.uid) : this.changeParaNode(node.uid);
      let p2 = this.testNodeConnection();
      p1.then(res => {
        if (res === "success") {
          this.$message.success("已切换");
        }
      });
    },
    handleDelNode(uid, target) {
      let p = target === "main" ? this.delMainNode(uid) : this.delParaNode(uid);
      p.then(res => {
        if (res === "success") {
          this.$message.success("已删除");
        }
      });
    },
    addMainSubmit() {
      this.$refs.mainForm.validate(valid => {
        if (valid) {
          this.addMainNode(this.mainForm.url).then(res => {
            if (res === "success") {
              this.$message.success("添加成功！");
            }
          });
        }
      });
    },
    addParaSubmit() {
      this.$refs.paraForm.validate(valid => {
        if (valid) {
          let p1 = this.convertExecToAddr("paracross", this.mainNode.url);
          let p2 = this.convertExecToAddr(
            `user.p.${this.paraForm.name}.trade`,
            this.paraForm.url
          );
          Promise.all([p1, p2])
            .then(([paraAddr, tradeAddr]) => {
              this.addParaNode({
                ...this.paraForm,
                paraAddr,
                tradeAddr
              }).then(res => {
                if (res === "success") {
                  this.$message.success("添加成功！");
                } else {
                  this.$message.success("添加失败！");
                }
              });
            })
            .catch(err => {
              this.$message.error("添加失败！");
            });
        }
      });
    },
    testNodeConnection(url, target) {

    },

    inputHandle(e, node) {
      // if (node == "main") {
      //   this.getAndSet("mainData", e.target.value);
      // } else if (node == "para") {
      //   this.getAndSet("form", this.form);
      // }
    },
    setNode(val, target) {
      // console.log('setNode')
      if (target == "main") {
        this.$store.commit("Account/UPDATE_CURRENT_MAIN", val);
        this.$store.commit("Account/UPDATE_MAIN_CONNECT", 1);
        setChromeStorage("mainNode", val)
          .then(res => {
            if (res == "success") {
              this.$message.success("默认节点设置成功");
              this.getMainNode(); //更新视图
              this.refreshMainAsset().then(res => {});
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else if (target == "para") {
        this.$store.commit("Account/UPDATE_CURRENT_PARALLEL", val);
        this.$store.commit("Account/UPDATE_PARALLEL_CONNECT", 1);
        setChromeStorage("paraNode", val)
          .then(res => {
            if (res == "success") {
              this.$message.success("默认节点设置成功");
              this.getParaNode(); //更新视图
              this.refreshParaAsset().then(res => {});
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  },
  mounted() {
    // this.refreshMainAsset();
    // this.refreshParaAsset();
  },
  watch: {
    paraDialog(val) {
      // this.getAndSet("paraDialog", val);
      // if (!val) {
      //   this.$refs["ruleForm"].resetFields();
      // } else {
      //   setTimeout(() => {
      //     this.$refs["paraName"] && this.$refs["paraName"].focus();
      //   }, 50);
      // }
    },
    mainDialog(val) {
      // this.getAndSet("mainDialog", val);
      // if (val) {
      //   setTimeout(() => {
      //     this.$refs["mainName"] && this.$refs["mainName"].focus();
      //   }, 50);
      // }
    }
  }
};
</script>

<style lang='scss'>
.node_container {
  > section.header {
    margin: 9px 55px 43px 41px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    img {
      width: 22px;
    }
    p {
      color: #f5b947;
      font-family: MicrosoftYaHei-Bold;
      font-weight: bold;
      &:nth-of-type(1) {
        font-size: 18px;
      }
      &:nth-of-type(2) {
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
  ul {
    height: calc(100vh - 101px - 78px - 10px);
    overflow-y: scroll;
    margin: 0 26px 0 31px;
    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
      background: transparent;
    }
    li {
      margin-bottom: 36px;
      > p {
        font-size: 16px;
        font-family: MicrosoftYaHei;
        font-weight: 400;
        color: rgba(255, 255, 255, 1);
        margin-bottom: 11px;
      }
      > div {
        background: rgba(251, 251, 251, 1);
        border-radius: 10px;
        padding: 19px 51px 18px 24px;
        section.up {
          div {
            position: relative;
            cursor: pointer;
            p.address {
              width: 195px;
              font-size: 14px;
              font-family: MicrosoftYaHei;
              font-weight: 400;
              color: rgba(22, 42, 84, 1);
              overflow: hidden;
              text-overflow: ellipsis;
            }
            img {
              width: 18px;
              position: absolute;
              right: -37px;
              bottom: 10px;
            }
            span {
              font-size: 12px;
              font-family: MicrosoftYaHei;
              position: absolute;
              left: 204px;
              // right: calc(-37px - 18px - 35px);
              bottom: 12px;
              color: #1cc0db;
              // color: #EF394A;
            }
            p.name {
              font-size: 12px;
              color: rgba(22, 42, 84, 1);
              margin-bottom: 11px;
            }
          }
        }
        p.line {
          height: 1px;
          border: 0.1px solid rgba(230, 230, 230, 1);
          margin: 10px 0 17px;
        }
        p.add {
          font-size: 12px;
          font-family: MicrosoftYaHei;
          font-weight: 400;
          color: rgba(28, 192, 198, 1);
          &:hover {
            cursor: pointer;
          }
        }
        &.main {
        }
        &.parallel {
          padding-bottom: 18px;
          p.line {
            margin-top: 5px;
          }
          .up {
            img {
              bottom: 16px;
            }
            span {
              bottom: 18px;
            }
          }
        }
      }
    }
  }
  .el-dialog__wrapper {
    .el-dialog {
      // background:rgba(251,251,251,1);
      // box-shadow:0px 7px 17px 4px rgba(7,50,98,0.23);
      // border-radius:10px;
    }
    &.mainNode {
      .el-dialog {
        // background-image: url('../../../assets/images/addMainBg.png');
        p.main_error {
          font-size: 12px;
          margin-top: 4px;
          color: #f56c6c;
          position: absolute;
        }
      }
    }
  }
}
div.el-form-item__error {
  top: calc(100% - 11px);
}
</style>
