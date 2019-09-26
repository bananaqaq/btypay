import { getChromeStorage, setChromeStorage, setChromeStorageKVS } from "@/libs/chromeUtil"
import { errPromise } from '@/libs/common'
import { MainNode, ParaNode, findNodeIndexOfList } from '@/dataTypes/Node'
import { stat } from "fs"

const state = {
  defaultMainNodeList: [
    { uid: "main1", url: 'http://47.107.15.126:8801', txHeight: -1, txIndex: 0 },
    { uid: "main2", url: "https://jiedian1.bityuan.com:8801/", txHeight: -1, txIndex: 0 }
  ],
  defaultParaNodeList: [
    {
      uid: "para1",
      name: 'gbttest',
      coin: "GBT",
      url: "http://172.16.103.24:8801",
      txHeight: -1,
      txIndex: 0,
      paraAddr: "1HPkPopVe3ERfvaAgedDtJQ792taZFEHCe",
      tradeAddr: "154SjGaRuyuWKaAsprLkxmx69r1oubAhDx"
    },
    {
      uid: "para2",
      name: 'game',
      coin: "GBTY",
      url: "http://47.98.245.85:8901",
      txHeight: -1,
      txIndex: 0,
      paraAddr: "1HPkPopVe3ERfvaAgedDtJQ792taZFEHCe",
      tradeAddr: "18UPv6sbbzorMAhdHi3AfxRa1iM16rVpTb",
    },
    {
      uid: "para3",
      index: 0,
      name: 'marsfood',
      coin: "bty",
      url: "http://47.96.190.51:8801",
      txHeight: -1,
      txIndex: 0,
      paraAddr: "1HPkPopVe3ERfvaAgedDtJQ792taZFEHCe",
      tradeAddr: "154SjGaRuyuWKaAsprLkxmx69r1oubAhDx",
    }
  ],

  mainNodeList: {},
  mainNode: {},

  paraNodeList: {},
  paraNode: {},

  mainConnect: 1,
  paraConnect: 1
}

const mutations = {
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

  UPDATE_MAIN_CONNECT(state, payload){
    state.mainConnect = payload
  },
  UPDATE_PARA_CONNECT(state, payload){
    state.paraConnect = payload
  }
}

const actions = {

  FIRST_INIT_MAIN_NODE({ state }) {
    state.mainNodeList = state.defaultMainNodeList.slice(0)
    state.mainNode = state.defaultMainNodeList.slice(0, 1)[0]
    
    let kvs = {
      mainNode: state.mainNode,
      mainNodeList: state.mainNodeList
    }
    return setChromeStorageKVS(kvs)
  },
  UPDATE_AND_SAVE_MAIN_NODE({ state }, { uid, txHeight, txIndex }) {
    let index = findNodeIndexOfList(state.mainNodeList, uid)
    
    (txHeight || txHeight == 0) && (state.mainNodeList[index].txHeight = txHeight)
    (txIndex || txIndex == 0) && (state.mainNodeList[index].txIndex = txIndex)

    let kvs = { mainNodeList: state.mainNodeList }
    if(state.mainNode.uid === uid){
      state.mainNode = state.mainNodeList.slice(index, index + 1)[0]
      kvs.mainNode = state.mainNode
    }

    return setChromeStorageKVS(kvs)
  },
  ADD_MAIN_NODE({ state }, url) {
    let newNode = new MainNode(url)
    state.mainNodeList.push(newNode)
    return setChromeStorage("mainNodeList", state.mainNodeList)
  },
  DEL_MAIN_NODE({ state }, uid) {
    if (uid === state.mainNode.uid) return errPromise()

    let index = findNodeIndexOfList(state.mainNodeList, uid)
    state.mainNodeList.splice(index, 1)

    return setChromeStorage("mainNodeList", state.mainNodeList)
  },
  CHANGE_MAIN_NODE({ state }, uid) {
    let index = findNodeIndexOfList(state.mainNodeList, uid)
    state.mainNode = state.mainNodeList.slice(index, index + 1)[0]
    return setChromeStorage('mainNode', state.mainNode)
  },



  FIRST_INIT_PARA_NODE({ state }) {
    state.paraNodeList = state.defaultParaNodeList.slice(0)
    state.paraNode = state.defaultParaNodeList.slice(0, 1)[0]
    let kvs = {
      paraNode: state.paraNode,
      paraNodeList: state.paraNodeList
    }
    return setChromeStorageKVS(kvs)
  },
  UPDATE_AND_SAVE_PARA_NODE({ state }, { uid, txHeight, txIndex, paraAddr, tradeAddr }) {
    let index = findNodeIndexOfList(state.paraNodeList, uid)
    
    (txHeight || txHeight == 0) && (state.paraNodeList[index].txHeight = txHeight)
    (txIndex || txIndex == 0) && (state.paraNodeList[index].txIndex = txIndex)
    paraAddr && (state.paraNodeList[index].paraAddr = paraAddr)
    tradeAddr && (state.paraNodeList[index].tradeAddr = tradeAddr)

    let kvs = { paraNodeList: state.paraNodeList }
    if(state.paraNode.uid === uid){
      state.paraNode = state.paraNodeList.slice(index, index + 1)[0]
      kvs.paraNode = state.paraNode
    }

    return setChromeStorageKVS(kvs)
  },
  ADD_PARA_NODE({ state }, { name, coin, url, paraAddr, tradeAddr }) {
    let newNode = new ParaNode(name, coin, url, paraAddr, tradeAddr)
    state.paraNodeList.push(newNode)
    return setChromeStorage('paraNodeList', state.paraNodeList)
  },
  DEL_PARA_NODE({ state }, uid) {
    if (uid === state.paraNode.uid) return errPromise()

    let index = findNodeIndexOfList(state.paraNodeList, uid)
    state.paraNodeList.splice(index, 1)
    return setChromeStorage("paraNodeList", state.paraNodeList)
  },
  CHANGE_PARA_NODE({ state }, uid) {
    let index = findNodeIndexOfList(state.paraNodeList, uid)
    state.paraNode = state.paraNodeList.slice(index, index + 1)[0]
    return setChromeStorage("paraNode", state.paraNode)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
