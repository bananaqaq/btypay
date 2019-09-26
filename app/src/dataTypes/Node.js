export class MainNode{

    uid = ""
    url = ""
    txHeight = -1
    txIndex = 0

    constructor(url){
        this.url = url
        this.uid = `${+new Date()}BTY`
    }
}

export class ParaNode {

    uid = ""
    name = ""
    coin = ""
    url = ""
    txHeight = -1
    txIndex = 0
    paraAddr = ""
    tradeAddr = ""

    constructor(name, coin, url, paraAddr, tradeAddr) {
        this.uid = `${+new Date() + coin}`
        this.name = name
        this.coin = coin
        this.url = url
        this.paraAddr = paraAddr
        this.tradeAddr = tradeAddr
    }

}

export function findNodeIndexOfList(list, uid) {
    return list.findIndex( node => {
        return node.uid === uid
    })
}