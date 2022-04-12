import { BigNumber, providers } from "ethers"
import { WETH_ABI } from "../constant/abi"

import ERC20 from "./ERC20"

class WETH extends ERC20 {
    constructor(provider: providers.Web3Provider, contractAddress: string) {
        super(provider, contractAddress, WETH_ABI)
    }

    async deposit(value: BigNumber): Promise<void> {
        const signer = this.provider.getSigner()
        const tx = await this.contract.connect(signer).deposit({
            value,
        })
        await tx.wait()
    }

    async withdraw(value: BigNumber): Promise<void> {
        const signer = this.provider.getSigner()
        const tx = await this.contract.connect(signer).withdraw(value)
        await tx.wait()
    }
}

export default WETH
