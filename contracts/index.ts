import { ethers, providers } from "ethers"
import { WETH_ADDRESS } from "../constant"

import WETH from "./WETH"

export class ContractCaller {
    provider: providers.Web3Provider
    WETH: WETH

    constructor(provider: providers.Web3Provider) {
        this.provider = provider
        this.WETH = new WETH(this.provider, WETH_ADDRESS)
    }

    public async sign(message: any) {
        const signer = this.provider.getSigner()
        const signature = await signer.signMessage(message)
        return signature
    }
}
