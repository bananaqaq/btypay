import { getChromeStorage, setChromeStorage, setChromeStorageKVS } from "@/libs/chromeUtil"
import Vue from 'vue'
import { errPromise } from '@/libs/common'

const state = {
  password: '',
  seed: 'film finger voyage during alter chat sentence hundred connect riot doctor cash sing nut chat',//助记词
  accountMap: {},
  currentAccount: {
    // 1
    // hexPrivateKey: "04339cbd3a9981b218dfb042b139714e40e2d72d9357c9e8c940a07ad51e3607",
    // address: "1EscufYUAkgCTTAFVqXmHMvRZMucTepvUM",

    // 2   
    // address: "15KHkN7db2dUF5oWcvwTSSxg2uFqTHJH8J",
    // hexPrivateKey: "910010376d40528ef943df150f419f28d311e5d90751031f9951f1b6cfb5f8d3",

    // 3
    address: "1GUhbeySSNywQcGcsjhPPXMX7iRZ6P6ovb",
    hexPrivateKey: '0x76b33cfa093226848e1e979c649778b4a24e040a97bb099007f73afb54b4c2fb',

    // 4
    // address: "1NN5DQHp5goSLLFe6BhfL8DKALoCNuR9PT",

    base58PrivateKey: "xprvA3b4zNsRHPgvzSydbftV9acbtKhNui8P69E7B7UNmJCKfWJZ5biLtcnHC9gYWRdGufyhehMcFcaPYpCgNRYznSCBv1gxxGd3xUYAABibgxQ",
    index: 0,
    name: "创世地址"
  },
  mainIsConnected: 1,//1:连接中；2:连接成功；3:连接失败
  parallelIsConnected: 1,//1:连接中；2:连接成功；3:连接失败

  mainAsset: {
    amt: 0.0000,
    price: 10
  },
  parallelAsset: {
    name: "GBT",
    amt: 0.0000,
    price: 10
  },

  // 1xzVbLNynwDNLjPNF8zvXfbygQvFcZG4a   https://jiedian1.bityuan.com:8801/   
  mainNodeList: [{ url: 'http://47.107.15.126:8801', txHeight: -1, txIndex: 0 }],
  mainNode: { index: 0, url: 'http://47.107.15.126:8801', txHeight: -1, txIndex: 0 },

  paraNodeList: [
    {
      name: 'gbttest',
      coin: "GBT",
      url: "http://172.16.103.24:8801",
      txHeight: -1,
      txIndex: 0,
      paraAddr: "1HPkPopVe3ERfvaAgedDtJQ792taZFEHCe",
      tradeAddr: "154SjGaRuyuWKaAsprLkxmx69r1oubAhDx"
    },
    {
      name: 'game',
      coin: "GBTY",
      url: "http://47.98.245.85:8901",
      txHeight: -1,
      txIndex: 0
    },
  ],
  paraNode: {
    index: 0,
    name: 'gbttest',
    coin: "GBT",
    url: "http://172.16.103.24:8801",
    txHeight: -1,
    txIndex: 0,
    paraAddr: "1HPkPopVe3ERfvaAgedDtJQ792taZFEHCe",
    tradeAddr: "154SjGaRuyuWKaAsprLkxmx69r1oubAhDx",


    // index: 1, 
    // name: 'game', 
    // coin: "GBTY", 
    // url: "http://47.98.245.85:8901", 
    // txHeight: -1, 
    // txIndex: 0,
    // paraAddr: "1HPkPopVe3ERfvaAgedDtJQ792taZFEHCe", 
    // tradeAddr: "18UPv6sbbzorMAhdHi3AfxRa1iM16rVpTb",


    // index: 0,
    // name: 'marsfood',
    // coin: "bty",
    // url: "http://47.96.190.51:8801",
    // txHeight: -1,
    // txIndex: 0,
    // paraAddr: "1HPkPopVe3ERfvaAgedDtJQ792taZFEHCe",
    // tradeAddr: "154SjGaRuyuWKaAsprLkxmx69r1oubAhDx",
  },

}

const mutations = {
  UPDATE_MAIN_CONNECT(state, payload) {
    state.mainIsConnected = payload;
  },
  UPDATE_PARALLEL_CONNECT(state, payload) {
    state.parallelIsConnected = payload;
  },
  UPDATE_PASSWORD(state, payload) {
    state.password = payload;
  },
  UPDATE_SEED(state, payload) {
    state.seed = payload;
  },
  UPDATE_ACCOUNTS(state, accountMap) {
    state.accountMap = accountMap
  },
  UPDATE_CURRENTACCOUNT(state, currentAccount) {
    state.currentAccount = currentAccount
  },


  UPDATE_MAIN_ASSET(state, { amt, price }) {
    if (amt || amt == 0) {
      state.mainAsset.amt = amt
    }
    if (price) {
      state.mainAsset.price = price
    }
  },
  UPDATE_PARA_ASSET(state, { name, amt, price }) {
    if (name) {
      state.parallelAsset.name = name
    }
    if (amt || amt == 0) {
      state.parallelAsset.amt = amt
    }
    if (price) {
      state.parallelAsset.price = price
    }
  },

  // NODE --START
  UPDATE_MAIN_NODE_LIST(state, payload) {
    state.mainNodeList = payload
  },
  UPDATE_MAIN_NODE(state, payload) {
    state.mainNode = payload
  },
  UPDATE_PARA_NODE_LIST(state, payload) {
    state.paraNodeList = payload
  },
  UPDATE_PARA_NODE(state, payload) {
    state.paraNode = payload
  },
  // NODE --END




}

const actions = {
  FIRST_INIT_MAIN_NODE({ state }) {
    state.mainNode = state.mainNodeList.slice(0, 1)[0]
    state.mainNode.index = 0
    let kvs = {
      mainNode: state.mainNode,
      mainNodeList: state.mainNodeList
    }
    return setChromeStorageKVS(kvs)
  },
  UPDATE_AND_SAVE_MAIN_NODE({ state }, { index, txHeight, txIndex }) {
    let listBackup = state.mainNodeList.slice(0)
      (txHeight || txHeight == 0) && (listBackup[index].txHeight = txHeight)
        (txIndex || txIndex == 0) && (listBackup[index].txIndex = txIndex)

    let currentIndex = state.mainNode.index
    let currentBackup = listBackup.slice(currentIndex, currentIndex + 1)[0]
    currentBackup.index = currentIndex

    let kvs = index === currentIndex ? { mainNode: currentBackup, mainNodeList: listBackup } : { mainNodeList: listBackup }

    return setChromeStorageKVS(kvs).then(res => {
      if (res === 'success') {
        state.mainNodeList = listBackup
        state.mainNode = currentBackup
      }
      return res
    })
  },
  ADD_MAIN_NODE({ state }, url) {
    let newNode = {
      url: url,
      txHeight: -1,
      txIndex: 0,
      name: "BTY"
    }
    let listBackup = state.mainNodeList.concat(newNode)
    return setChromeStorage("mainNodeList", listBackup).then(res => {
      if (res === "success") {
        state.mainNodeList = listBackup
      }
      return res
    })
  },
  DEL_MAIN_NODE({ state }, index) {
    if (index === state.mainNode.index) return errPromise()
    let listBackup = state.mainNodeList.slice(0)
    listBackup.splice(index, 1)

    let currentIndex = state.mainNode.index
    if (currentIndex > index) {
      currentIndex -= 1
    }
    let currentBackup = listBackup.slice(currentIndex, currentIndex + 1)[0]
    currentBackup.index = currentIndex

    let kvs = { mainNodeList: listBackup, mainNode: currentBackup }

    return setChromeStorageKVS(kvs).then(res => {
      if (res === "success") {
        state.mainNodeList = listBackup
        state.mainNode = currentBackup
      }
      return res
    })
  },
  CHANGE_MAIN_NODE({ state }, index) {
    let itemBackup = state.mainNodeList.slice(index, index + 1)[0]
    itemBackup.index = index
    return setChromeStorage('mainNode', itemBackup).then(res => {
      if (res === "success") {
        state.mainNode = itemBackup
      }
      return res
    })
  },



  FIRST_INIT_PARA_NODE({ state }) {
    state.paraNode = state.paraNodeList.slice(0, 1)[0]
    state.paraNode.index = 0
    let kvs = {
      paraNode: state.paraNode,
      paraNodeList: state.paraNodeList
    }
    return setChromeStorageKVS(kvs)
  },
  UPDATE_AND_SAVE_PARA_NODE({ state }, { index, txHeight, txIndex, paraAddr, tradeAddr }) {
    let listBackup = state.paraNodeList.slice(0)
      (txHeight || txHeight == 0) && (listBackup[index].txHeight = txHeight)
        (txIndex || txIndex == 0) && (listBackup[index].txIndex = txIndex)
    paraAddr && (listBackup[index].paraAddr = paraAddr)
    tradeAddr && (listBackup[index].tradeAddr = tradeAddr)

    let currentIndex = state.paraNode.index
    let currentBackup = listBackup.slice(currentIndex, currentIndex + 1)[0]
    currentBackup.index = currentIndex

    let kvs = index === currentIndex ? { paraNode: currentBackup, paraNodeList: listBackup } : { paraNodeList: listBackup }

    return setChromeStorageKVS(kvs).then(res => {
      if (res === "success") {
        state.paraNodeList = listBackup
        state.paraNode = currentBackup
      }
      return res
    })
  },
  ADD_PARA_NODE({ state }, { url, name, coin, paraAddr, tradeAddr }) {
    let newNode = {
      index: 0,
      name: name,
      coin: coin,
      url: url,
      txHeight: -1,
      txIndex: 0,
      paraAddr: paraAddr,
      tradeAddr: tradeAddr,
    }
    let listBackup = state.paraNodeList.concat(newNode)
    return setChromeStorage('paraNodeList', listBackup).then(res => {
      if (res === "success") {
        state.paraNodeList = listBackup
      }
      return res
    })
  },
  DEL_PARA_NODE({ state }, index) {
    if (index === state.paraNode.index) return errPromise()
    let listBackup = state.paraNodeList.slice(0)
    listBackup.splice(index, 1)

    let currentIndex = state.paraNode.index
    if(currentIndex > index){
      currentIndex -= 1
    }
    let currentBackup = listBackup.slice(currentIndex, currentIndex + 1)[0]
    currentBackup.index = currentIndex

    let kvs = { paraNodeList: listBackup, paraNode: currentBackup }
    return setChromeStorageKVS(kvs).then(res => {
      if (res === "success") {
        state.paraNodeList = listBackup
        state.paraNode = currentBackup
      }
      return res
    })
  },
  CHANGE_PARA_NODE({ state }, index) {
    let itemBackup = state.paraNodeList.slice(index, index + 1)[0]
    itemBackup.index = index
    return setChromeStorage("paraNode", itemBackup).then(res => {
      if (res === "success") {
        state.paraNode = itemBackup
      }
      return res
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
