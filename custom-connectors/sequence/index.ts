import { Connector } from "@web3-react/types"
import type { Actions } from "@web3-react/types"
import { sequence, Wallet } from "0xsequence"

export class Sequence extends Connector {
    public sequence?: Wallet
    private readonly options: sequence.provider.ConnectOptions | undefined
    constructor(actions: Actions, options?: sequence.provider.ConnectOptions) {
        super(actions)
        this.options = options
    }

    private async startListening(chainId?: number) {
        if (this.sequence?.isConnected()) {
            this.sequence.disconnect()
        }

        this.sequence = new sequence.Wallet(chainId)
        await this.sequence.connect(this.options)
        this.provider = this.sequence.getProvider() as any
    }

    public async activate(chainId?: number): Promise<void> {
        this.actions.startActivation()

        await this.startListening(chainId).catch((error: Error) => {
            this.actions.reportError(error)
        })

        if (this.provider) {
            await Promise.all([this.sequence!.getAddress(), this.sequence!.getChainId()])
                .then(([account, chainId]) => {
                    this.actions.update({ chainId, accounts: [account] })
                })
                .catch((error: Error) => {
                    this.actions.reportError(error)
                })
        }
    }

    public deactivate(...args: unknown[]): void | Promise<void> {
        super.deactivate(...args)
        this.sequence?.disconnect()
    }
}
