// rin:0x6ac96004d4cd77b216d4bb493eafedd266ce5dbb7030265b8b22095d368d6aeb

import { Connector } from "@web3-react/types"
import type { Actions } from "@web3-react/types"
import { SafeAppProvider } from "@gnosis.pm/safe-apps-provider"
import SafeAppsSDK, { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { ethers } from "ethers"

export class Gnosis extends Connector {
    public safe?: SafeInfo
    public sdk?: SafeAppsSDK

    constructor(actions: Actions) {
        super(actions)
    }

    private async startListening(chainId?: number) {
        this.sdk = new SafeAppsSDK()
        const isSafe = await this.isSafeApp()
        console.log(isSafe)
        if (!isSafe) {
            window.open("https://gnosis-safe.io/app", "_blank")
            return
        }
        const safeInfo = await this.sdk.safe.getInfo()
        this.safe = safeInfo
        this.customProvider = new ethers.providers.Web3Provider(new SafeAppProvider(this.safe, this.sdk))
    }

    public async activate(chainId?: number): Promise<void> {
        this.actions.startActivation()
        await this.startListening(chainId).catch((error: Error) => {
            this.actions.reportError(error)
        })

        if (this.safe) {
            console.log("Safe", this.safe)
            this.actions.update({ accounts: [this.safe!.safeAddress], chainId: this.safe!.chainId })
        }
    }

    public async isSafeApp(): Promise<boolean> {
        // check if we're in an iframe
        if (window?.parent === window) {
            return false
        }

        const safe = await Promise.race([
            this.sdk?.safe.getInfo(),
            new Promise<undefined>(resolve => setTimeout(resolve, 300)),
        ])

        return !!safe
    }
}
