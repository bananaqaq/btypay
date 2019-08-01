import chain33API from '@/mixins/chain33API'
import {seed, sign} from '@33cn/wallet-base'

let isDev = process.env.NODE_ENV === 'development'
// console.log({isDev})


function getBackgroundPage() {
  return new Promise((resolve) => {
    window.chrome.runtime.getBackgroundPage(win => {
      resolve(win)
    })
  })
}

export default {
  mixins: [chain33API],
  methods: {
    getChromeStorage(keys) {
      return new Promise(resolve => {
        window.chrome.storage.local.get(keys, (result) => {
          resolve(result)
        })
      })
    },
    setChromeStorage(key, value) {
      return new Promise(resolve => {
        window.chrome.storage.local.set({[key]: value}, () => {
          resolve(value)
        })
      })
    },
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
        const account = wallet.newAccount(name)
        this.$store.commit('Account/UPDATE_ACCOUNTS', wallet.accountMap)
        this.setCurrentAccount(account)
        this.setChromeStorage('accountIndexList', wallet.accountIndexList)
      })
    },
    recoverAccount() {
      this.getWallet().then(wallet => {
        //  获取索引恢复账户
        window.chrome.storage.local.get(['accountIndexList'], (result) => {
          // console.log(result)
          if (result.accountIndexList) {
            wallet.recoverAccount(result.accountIndexList)
            this.$store.commit('Account/UPDATE_ACCOUNTS', wallet.accountMap)
            this.getChromeStorage(['currentAccountIndex']).then(result => {
              let currentAccount = wallet.accountMap[result['currentAccountIndex']]
              if(!currentAccount) {
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
        this.$store.commit('Account/UPDATE_CURRENTACCOUNT', account)
        return account
      }).then(account => {
        this.setChromeStorage('currentAccountIndex', account.index)
      })
    },
    getCurrentAccount() {
      return getBackgroundPage().then(win => {
        this.$store.commit('Account/UPDATE_CURRENTACCOUNT', win.currentAccount)
        return win.currentAccount
      })
    },
    logout() {
      getBackgroundPage().then(win => {
        win.myChain33WalletInstance = null
        win.currentAccount = null
        this.$store.commit('Account/UPDATE_CURRENTACCOUNT', null)
        this.$router.push('login')
      })
    },
    /* 账户相关 -- end */

    /* 交易相关 -- start */

    signRawTransaction(tx, privateKey) {
      return sign.signRawTransaction(tx, privateKey)
    },

    sendToAddr({privateKey, to, amount, fee, note}) {
      // console.log(privateKey)
      return this.createRawTransaction(to, amount, fee, note)
        .then(tx => {
          // console.log(tx)
          return sign.signRawTransaction(tx, privateKey)
        }).then(signedTx => {
          return this.sendTransation(signedTx)
        })
    }

    /* 交易相关 -- end */
  }
}