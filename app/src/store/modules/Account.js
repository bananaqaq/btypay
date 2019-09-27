import { getChromeStorage, setChromeStorage, setChromeStorageKVS } from "@/libs/chromeUtil"
import Vue from 'vue'
import { errPromise } from '@/libs/common'
import Long from 'long'

const state = {
  password: '',
  seed: '',
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

  mainAsset: {
    amt: Long.ZERO,
    price: 0
  },
  paraAsset: {
    amt: Long.ZERO,
    price: 0
  },

}

const mutations = {
  UPDATE_MAIN_CONNECT(state, payload) {
    state.mainIsConnected = payload;
  },
  UPDATE_PARALLEL_CONNECT(state, payload) {
    state.parallelIsConnected = payload;
  },

  // 待删
  UPDATE_PASSWORD(state, payload) {
    state.password = payload;
  },


  UPDATE_SEED(state, payload) {
    state.seed = payload;
  },
  UPDATE_ACCOUNTS(state, accountMap) {
    state.accountMap = accountMap
  },
  UPDATE_CURRENT_ACCOUNT(state, currentAccount) {
    state.currentAccount = currentAccount
  },


  UPDATE_MAIN_ASSET(state, { amt, price }) {
    amt && (state.mainAsset.amt = amt)
    price && (state.mainAsset.price = price)
  },
  UPDATE_PARA_ASSET(state, { amt, price }) {
   amt && (state.parallelAsset.amt = amt)
   price && (state.parallelAsset.price = price)
  },

}

export default {
  namespaced: true,
  state,
  mutations
}
