export function getChromeStorage(keys){
    return new Promise(resolve => {
      window.chrome.storage.local.get(keys, result => {
        resolve(result)
      })
    })
}

export function setChromeStorage(key, value){
    return new Promise(resolve => {
        window.chrome.storage.local.set({ [key]: value }, () => {
          resolve('success')
        })
      })
}

// kvs: { key1: value1, key2: value2 }
export function setChromeStorageKVS(kvs){
  return new Promise(resolve => {
    window.chrome.storage.local.set(kvs, () => {
      resolve("success")
    })
  })
}

export function removeChromeStorage(keys){
  return new Promise(resolve => {
    window.chrome.storage.local.remove(keys, result => {
      resolve("success")
    })
  })
}

export function clearChromeStorage(){
  window.chrome.storage.local.clear();
}
