import { getChromeStorage, setChromeStorage, setChromeStorageKVS } from "@/libs/chromeUtil"
import Vue from 'vue'
import { errPromise } from '@/libs/common'
import Long from 'long'

const state = {
  password: '',
  seed: '',
  accountMap: {},
  currentAccount: {
    address: "",
    hexPrivateKey: '',
    base58PrivateKey: "",
    index: 0,
    name: ""
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
