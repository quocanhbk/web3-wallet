import { Contract, ethers, providers } from "ethers"
import { GREETER_ABI } from "../constant"

class Greeter {
    provider: providers.Web3Provider
    contract: Contract

    constructor(provider: providers.Web3Provider, contractAddress: string) {
        this.provider = provider
        this.contract = new ethers.Contract(contractAddress, GREETER_ABI, provider)
    }

    async getGreeting(): Promise<string> {
        return await this.contract.greet()
    }

    async setGreeting(greet: string): Promise<void> {
        const signer = this.provider.getSigner()
        const tx = await this.contract.connect(signer).setGreeting(greet)
        await tx.wait()
    }
}

export default Greeter
