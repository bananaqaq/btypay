import chain33API from '@/mixins/chain33API'
import Long from 'long'
import { seed, sign } from '@33cn/wallet-base'
import { createNamespacedHelpers } from "vuex";
import { DBHelper } from "@/libs/dbHelper"
import { TransactionsListEntry, formatTxType } from "@/libs/bitcoinAmount";
import { getChromeStorage, setChromeStorage } from "@/libs/chromeUtil"
import { CONNECT_STATE } from "@/dataTypes/GlobalEnum"

const accountHelpers = createNamespacedHelpers("Account");
const nodeHelpers = createNamespacedHelpers("Node")

let isDev = process.env.NODE_ENV === 'development'

const DB_NAME = "WalletDB"
const TABLE_NAME = "txs"
const TABLE_DATA = {
  keyPath: {
    keyPath: 'id',
    autoIncrement: true
  },
  index: [
    { name: "symbol", key: "symbol", payload: { unique: false } },
    { name: "symbol_typeTy", key: ['symbol', 'typeTy'], payload: { unique: false } }
  ]
}
const dbHelper = new DBHelper(DB_NAME, TABLE_NAME, TABLE_DATA)

function getBackgroundPage() {
  return new Promise((resolve) => {
    if (isDev) {
      resolve(window)
    } else {
      window.chrome.runtime.getBackgroundPage(win => {
        resolve(win)
      })
    }
  })
}

export default {
  mixins: [chain33API],
  computed: {
    ...accountHelpers.mapState([
      "currentAccount",
    ]),
    ...nodeHelpers.mapState([
      "mainNode",
      "paraNode",
    ])
  },
  methods: {
    ...accountHelpers.mapMutations({
      updateAccounts: "UPDATE_ACCOUNTS",
      updateCurrentAccount: "UPDATE_CURRENT_ACCOUNT",
      updateMainAsset: "UPDATE_MAIN_ASSET",
      updateParaAsset: "UPDATE_PARA_ASSET"
    }),
    ...nodeHelpers.mapMutations({
      updateMainConnect: "UPDATE_MAIN_CONNECT",
      updateParaConnect: "UPDATE_PARA_CONNECT"
    }),



    /* 账户相关 -- start */
    newMnemonic(lang) {
      if (lang === 1) {
        return seed.newMnemonicInCN()
      } else {
        return seed.newMnemonicInEN()
      }
    },
    createHDWallet(mnemonic) {
      const wallet = seed.newWalletFromMnemonic(mnemonic)
      // 保存登录时间
      setChromeStorage('loginTime', (new Date()).valueOf()).then(res => {
      })
      if (isDev) {
        window.myChain33WalletInstance = wallet
      } else {
        getBackgroundPage().then(win => {
          win.myChain33WalletInstance = wallet
        })
      }
      return wallet
    },
    getWallet() {
      return new Promise((resolve) => {
        if (isDev) {
          resolve(window.myChain33WalletInstance)
        } else {
          getBackgroundPage().then(win => {
            resolve(win.myChain33WalletInstance)
          })
        }
      })
    },
    newAccount(name) {
      return this.getWallet().then(wallet => {
        const account = wallet.newAccount(name)//生成公私钥地址等
        this.updateAccounts(wallet.accountMap)
        this.setCurrentAccount(account)
        setChromeStorage('accountIndexList', wallet.accountIndexList)
      })
    },

    recoverAccount() {
      this.getWallet().then(wallet => {
        //  获取索引恢复账户
        window.chrome.storage.local.get(['accountIndexList'], (result) => {
          if (result.accountIndexList) {
            if (wallet.recoverAccount) {
              wallet.recoverAccount(result.accountIndexList)
            }
            this.updateAccounts(wallet.accountMap)
            getChromeStorage(['currentAccountIndex']).then(result => {
              let currentAccount = wallet.accountMap[result['currentAccountIndex']]
              if (!currentAccount) {
                currentAccount = wallet.firstAccount
              }
              this.setCurrentAccount(currentAccount)
            })
          } else {
            this.newAccount('Account 1')
          }
        })
      })
    },
    setCurrentAccount(account) {
      return getBackgroundPage().then(win => {
        win.currentAccount = account
        this.updateCurrentAccount(account)
        return account
      }).then(account => {
        setChromeStorage('currentAccountIndex', account.index)
      })
    },
    getCurrentAccount() {
      return getBackgroundPage().then(win => {
        this.updateCurrentAccount(win.currentAccount)
        return win.currentAccount
      })
    },
    logout() {
      getBackgroundPage().then(win => {
        win.myChain33WalletInstance = null
        win.currentAccount = null
        this.updateCurrentAccount(null)
        this.$router.push('login')
      })
    },
    /* 账户相关 -- end */

    /* 交易相关 -- start */

    signRawTransaction(tx, privateKey) {
      return sign.signRawTransaction(tx, privateKey)
    },

    sendToAddr({ privateKey, to, amount, fee, note }, url) {
      return this.createRawTransaction({ to, amount, fee, note }, url)
        .then(tx => {
          return sign.signRawTransaction(tx, privateKey)
        }).then(signedTx => {
          return this.sendTransaction(signedTx, url)
        })
    },

    /* 交易相关 -- end */


    /* 资产相关 -- start */
    refreshMainAsset() {
      let addr = this.currentAccount.address
      let url = this.mainNode.url
      return this.getAddrBalance(addr, 'coins', url).then(res => {
        let payload = { amt: Long.fromString(res[0].balance) }
        this.updateMainAsset(payload)
        this.updateMainConnect(CONNECT_STATE.SUCCESS)
        return 'success'
      }).catch(err => {
        this.updateMainConnect(CONNECT_STATE.FAIL)
        return err.message
      })
    },

    refreshParaAsset() {
      let addr = this.currentAccount.address
      let url = this.paraNode.url
      return this.getAddrBalance(addr, 'coins', url).then(res => {
          let payload = { amt: Long.fromString(res[0].balance) }
          this.updateParaAsset(payload)
          this.updateParaConnect(CONNECT_STATE.SUCCESS)
          return 'success'
        }).catch(err => {
          this.updateParaConnect(CONNECT_STATE.FAIL)
          return err.message
        })
    },
    /* 资产相关 -- end */


    /* 交易记录相关 --start */
    initTxList(coin, callback) {
      let cNode = coin === "bty" ? this.mainNode : this.paraNode
      let updateMethod = coin === "bty" ? "Node/UPDATE_AND_SAVE_MAIN_NODE" : "Node/UPDATE_AND_SAVE_PARA_NODE"
      let symbol = cNode.name
      let count = 100

      // 拉取数据
      this.getAddrTx(
        this.currentAccount.address,
        this.TX_FLAG.ALL.val,
        count,
        this.TX_DIRECTION.ASC,
        cNode.txHeight,
        cNode.txIndex
      ).then(res => {
        if (res.txs) {
          for (let tx of res.txs) {
            // 过滤 存储
            if (!this.filterAndSaveTx(symbol, updateMethod, tx)) {
              continue
            }
          }

          // 重复调用拉取数据
          if (res.txs.length === count) {
            this.initTxList(coin)
          } else {
            callback("finish")
          }
        } else {
          this.getLastHeader(cNode.url).then(res => {
            this.$store.commit(updateMethod, { txHeight: res.height, txIndex: res.txCount })
          })
        }
      })
    },
    getTxList(coin, typeTy, advanceNum, refresh, callback) {
      let cNode = coin === "bty" ? this.mainNode : this.paraNode
      let updateMethod = coin === "bty" ? "Node/UPDATE_AND_SAVE_MAIN_NODE" : "Node/UPDATE_AND_SAVE_PARA_NODE"
      let symbol = cNode.name
      let keyName = typeTy === -1 ? TABLE_DATA.index[0].name : TABLE_DATA.index[1].name
      let keyData = typeTy === -1 ? symbol : [symbol, typeTy]

      // 拉取数据
      if (refresh) {
        this.getAddrTx(
          this.currentAccount.address,
          this.TX_FLAG.ALL.val,
          0,
          this.TX_DIRECTION.ASC,
          cNode.txHeight,
          cNode.txIndex,
          cNode.url
        ).then(res => {
          if (res.txs) {
            for (let tx of res.txs) {
              // 过滤 存储
              if (!this.filterAndSaveTx(coin, updateMethod, tx)) {
                continue
              }
            }
          }
          // console.log(keyName, keyData)
          dbHelper.getCursorByIndex(TABLE_NAME, keyName, keyData, advanceNum, callback)
        })
      } else {
        dbHelper.getCursorByIndex(TABLE_NAME, keyName, keyData, advanceNum, callback)
      }
    },

    filterAndSaveTx(coin, updateMethod, tx) {
      let cNode = coin === "bty" ? this.mainNode : this.paraNode
      let symbol = cNode.name
      let lastTx = null
      let createNewTx = false
      let blockHeight = tx.height;
      let txIndex = tx.index;
      const paraName = "gbttest"
      const execerPrefix = "user.p." + paraName + "."

      let amount = tx.amount;
      let strToAddr = tx.tx.to;
      let strFromAddr = tx.fromAddr;
      let strTxHash = tx.txHash;
      let nTime = tx.blockTime;
      let nFee = tx.tx.fee;
      let strExecer = tx.tx.execer;
      let strActionname = tx.actionName;
      let nTy = tx.receipt.ty;

      let strNote = "";
      if (tx.tx && tx.tx.payload && tx.tx.payload.Value && tx.tx.payload.Value.Transfer) {
        strNote = tx.tx.payload.Value.Transfer.note;
      }

      let strError = "unKnow";
      if (nTy === 1) {
        let errors = tx.receipt.logs;
        if (errors) {
          for (let err of errors) {
            if (err.ty === 1) {
              strError = err.log;
              break;
            }
          }
        }
      }

      if (coin === "bty") {
        if (tx.tx.execer === "coins" && tx.actionName === "transfer" && strError === "unKnow") {
          createNewTx = true
        }
      } else {
        if (tx.tx.execer === execerPrefix + "coins" && tx.actionName === "transfer") {
          createNewTx = true
        } else if (tx.tx.execer === execerPrefix + "coins" && tx.actionName === "withdraw") {
          createNewTx = true
        }
      }

      if (createNewTx) {
        lastTx = new TransactionsListEntry(
          paraName,
          symbol,
          this.currentAccount.address,
          blockHeight,
          txIndex,
          nTime,
          strToAddr,
          strFromAddr,
          strTxHash,
          amount,
          nFee,
          strExecer,
          strActionname,
          nTy,
          strNote,
          strError
        )
        dbHelper.insert(TABLE_NAME, lastTx)
      }

      this.$store.commit(updateMethod, { txHeight: blockHeight, txIndex: txIndex })
      return lastTx
    }
    /* 交易记录相关 --end */

  },
  filters: {
    numFilter(val, num) {
      if (val || val == 0) {
        let f = parseFloat(val),
          result = null;
        if (num == 4) {
          result = Math.floor(f * 10000) / 10000;
        } else {
          result = Math.floor(f * 100) / 100;
        }
        return parseFloat(result).toFixed(num)
      }
    },
    longFilter(val, num) {
      if (val || val == 0) {
        let f = parseFloat(val)
        return (f / 1e8).toFixed(num)
      }
    }
  }
}