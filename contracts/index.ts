import { ethers, providers } from "ethers"
import { GREETER_ABI, WETH_ADDRESS } from "../constant"
import Greeter from "./Greeter"

import WETH from "./WETH"

export class ContractCaller {
    provider: providers.Web3Provider
    WETH: WETH
    Greeter: Greeter

    constructor(provider: providers.Web3Provider) {
        this.provider = provider
        this.WETH = new WETH(this.provider, WETH_ADDRESS)
        this.Greeter = new Greeter(this.provider, "0x0087EB397af9E04Ff9872199d63F841474bf2A27")
    }

    public async sign(message: any) {
        const signer = this.provider.getSigner()
        const signature = await signer.signMessage(message)
        return signature
    }
}
