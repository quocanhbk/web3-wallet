import { initializeConnector, useWeb3React, Web3ReactHooks, Web3ReactProvider } from "@web3-react/core"
import { WalletConnect } from "@web3-react/walletconnect"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { CHAINS, getAddChainParameters } from "./chains"
import { useQuery } from "react-query"
import { ethers, providers } from "ethers"
import { ContractCaller } from "../contracts"
import { CoinbaseWallet } from "@web3-react/coinbase-wallet"

import { MetaMask } from "@web3-react/metamask"
import { Connector } from "@web3-react/types"
import { Sequence } from "../custom-connectors/sequence"
import { Gnosis } from "../custom-connectors/gnosis"

export type Connectors = [MetaMask | WalletConnect | CoinbaseWallet | Sequence, Web3ReactHooks][]

export type ConnectorId = "metaMask" | "walletConnect" | "coinbaseWallet" | "sequence" | "gnosis"

export type ConnectorInfo = { id: ConnectorId; name: string; image: string; connector: Connector }

export type ConnectorsData = Record<ConnectorId, ConnectorInfo & { hooks: Web3ReactHooks }>

export const connectors: Omit<ConnectorInfo, "connector">[] = [
    { id: "metaMask", image: "/icons/metamask.svg", name: "MetaMask" },
    { id: "walletConnect", image: "/icons/walletConnect.svg", name: "WalletConnect" },
    { id: "coinbaseWallet", image: "/icons/coinbase.png", name: "Coinbase Wallet" },
    { id: "sequence", image: "/icons/sequence.svg", name: "Sequence" },
    { id: "gnosis", image: "/icons/gnosis.png", name: "Gnosis Safe" },
]

const getConnectorInfo = (connector: Connector): ConnectorInfo => {
    if (connector instanceof MetaMask) return { ...connectors[0], connector }
    else if (connector instanceof WalletConnect) return { ...connectors[1], connector }
    else if (connector instanceof CoinbaseWallet) return { ...connectors[2], connector }
    else if (connector instanceof Sequence) return { ...connectors[3], connector }
    else return { ...connectors[4], connector }
}

const getLastConnector = () => (localStorage.getItem("lastConnector") ?? "metaMask") as ConnectorId

const setLastConenctor = (connectorId: ConnectorId) => localStorage.setItem("lastConnector", connectorId)

const useWeb3WalletError = (
    connectorsData: Record<ConnectorId, { id: ConnectorId; name: string; connector: Connector; hooks: Web3ReactHooks }>,
    currentConnector: ConnectorId | null = null
) => {
    const metaMaskError = connectorsData.metaMask.hooks.useError()
    const walletConnectError = connectorsData.walletConnect.hooks.useError()
    const coinbaseError = connectorsData.coinbaseWallet.hooks.useError()

    return currentConnector === "metaMask"
        ? metaMaskError
        : currentConnector === "walletConnect"
        ? walletConnectError
        : currentConnector === "coinbaseWallet"
        ? coinbaseError
        : null
}

const useWeb3WalletState = (
    connectorsData: Record<ConnectorId, { id: ConnectorId; name: string; connector: Connector; hooks: Web3ReactHooks }>
) => {
    const { connector, account, chainId, isActive, provider } = useWeb3React()

    const contractCaller = useRef<ContractCaller | null>(null)

    const [currentConnector, setCurrentConnector] = useState<ConnectorId | null>(null)

    const activate = async (connectorId: ConnectorId, chainId?: number) => {
        await connector.deactivate()

        setCurrentConnector(connectorId)

        setLastConenctor(connectorId)

        const newConnector = connectorsData[connectorId].connector
        newConnector instanceof WalletConnect || connector instanceof Sequence
            ? await newConnector.activate(chainId)
            : newConnector instanceof MetaMask &&
              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
              !window.ethereum
            ? window.open("https://metamask.app.link/dapp/web3-wallet-demo.vercel.app/")
            : await newConnector.activate(!chainId ? undefined : getAddChainParameters(chainId))
    }

    const deactivate = async () => {
        await connector.deactivate()
        setCurrentConnector(null)
    }

    useEffect(() => {
        const lastConnector = connectorsData[getLastConnector()].connector
        lastConnector.connectEagerly && lastConnector.connectEagerly()
    }, [])

    const error = useWeb3WalletError(connectorsData, currentConnector)

    useEffect(() => {
        if (provider) {
            contractCaller.current = new ContractCaller(provider as providers.Web3Provider)
        }
    }, [provider])

    const { data: balance } = useQuery(
        "balance",
        () => provider!.getBalance(account!).then(res => parseFloat(ethers.utils.formatEther(res))),
        {
            enabled: !!provider && !!account,
            initialData: 0,
        }
    )

    const sign = async (message: string) => {
        if (connector instanceof Gnosis) {
            return await connector.sdk!.txs.signMessage(message).then(res => res.safeTxHash)
        } else {
            return contractCaller.current!.sign(message)
        }
    }

    return {
        account: account?.toLowerCase(),
        chain: chainId ? { ...CHAINS[chainId], chainId } : undefined,
        activate,
        deactivate,
        isActive,
        error,
        connector: getConnectorInfo(connector),
        provider,
        balance,
        contractCaller,
        sign,
    }
}

const Web3WalletContext = createContext<ReturnType<typeof useWeb3WalletState> | null>(null)

export interface Web3WalletProviderProps {
    children: ReactNode
    config: {
        walletConnect: ConstructorParameters<typeof WalletConnect>["1"]
        coinbaseWallet: ConstructorParameters<typeof CoinbaseWallet>["1"]
    }
}

const Web3WalletStateProvider = ({
    children,
    connectorsData,
}: {
    children: ReactNode
    connectorsData: ConnectorsData
}) => {
    const state = useWeb3WalletState(connectorsData)

    return <Web3WalletContext.Provider value={state}>{children}</Web3WalletContext.Provider>
}

export const Web3WalletProvider = ({ children, config }: Web3WalletProviderProps) => {
    const [metaMask, metaMaskHooks] = useMemo(() => initializeConnector<MetaMask>(actions => new MetaMask(actions)), [])

    const [walletConnect, walletConnectHooks] = useMemo(
        () =>
            initializeConnector<WalletConnect>(
                actions => new WalletConnect(actions, config.walletConnect, false, true),
                [1, 4]
            ),
        [config.walletConnect]
    )

    const [coinbaseWallet, coinbaseHooks] = useMemo(
        () => initializeConnector<CoinbaseWallet>(actions => new CoinbaseWallet(actions, config.coinbaseWallet)),
        [config.coinbaseWallet]
    )

    const [sequence, sequenceHooks] = useMemo(() => initializeConnector<Sequence>(actions => new Sequence(actions)), [])

    const [gnosis, gnosisHooks] = useMemo(() => initializeConnector<Gnosis>(actions => new Gnosis(actions)), [])

    const connectors: [MetaMask | WalletConnect | CoinbaseWallet | Sequence | Gnosis, Web3ReactHooks][] = useMemo(
        () => [
            [metaMask, metaMaskHooks],
            [walletConnect, walletConnectHooks],
            [coinbaseWallet, coinbaseHooks],
            [sequence, sequenceHooks],
            [gnosis, gnosisHooks],
        ],
        [
            metaMask,
            metaMaskHooks,
            walletConnect,
            walletConnectHooks,
            coinbaseWallet,
            coinbaseHooks,
            sequence,
            sequenceHooks,
            gnosis,
            gnosisHooks,
        ]
    )

    const connectorsData = {
        metaMask: { ...getConnectorInfo(metaMask), hooks: metaMaskHooks },
        walletConnect: { ...getConnectorInfo(walletConnect), hooks: walletConnectHooks },
        coinbaseWallet: { ...getConnectorInfo(coinbaseWallet), hooks: coinbaseHooks },
        sequence: { ...getConnectorInfo(sequence), hooks: sequenceHooks },
        gnosis: { ...getConnectorInfo(gnosis), hooks: gnosisHooks },
    }

    return (
        <Web3ReactProvider connectors={connectors}>
            <Web3WalletStateProvider connectorsData={connectorsData}>{children}</Web3WalletStateProvider>
        </Web3ReactProvider>
    )
}

const useWeb3Wallet = () => {
    const context = useContext(Web3WalletContext)

    if (!context) {
        throw new Error("useWeb3Wallet must be used within a Web3WalletProvider")
    }

    return context
}

export default useWeb3Wallet
