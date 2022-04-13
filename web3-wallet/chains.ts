import type { AddEthereumChainParameter } from "@web3-react/types"

interface BasicChainInformation {
    urls: string[]
    name: string
}

interface ExtendedChainInformation extends BasicChainInformation {
    nativeCurrency: AddEthereumChainParameter["nativeCurrency"]
    blockExplorerUrls: AddEthereumChainParameter["blockExplorerUrls"]
}

function isExtendedChainInformation(
    chainInformation: BasicChainInformation | ExtendedChainInformation
): chainInformation is ExtendedChainInformation {
    return !!(chainInformation as ExtendedChainInformation).nativeCurrency
}

export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
    const chainInformation = CHAINS[chainId]
    if (isExtendedChainInformation(chainInformation)) {
        return {
            chainId,
            chainName: chainInformation.name,
            nativeCurrency: chainInformation.nativeCurrency,
            rpcUrls: chainInformation.urls,
            blockExplorerUrls: chainInformation.blockExplorerUrls,
        }
    } else {
        return chainId
    }
}

export const CHAINS: {
    [chainId: number]: BasicChainInformation | ExtendedChainInformation
} = {
    1: {
        urls: ["https://mainnet.infura.io/v3/47a3dff66e3e49c2b8fff75f0eb95c90"],
        name: "Mainnet",
    },
    137: {
        urls: ["https://rpc-mainnet.matic.network"],
        name: "Polygon",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
        },
        blockExplorerUrls: ["https://polygonscan.com"],
    },
}

export const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce<{ [chainId: number]: string[] }>(
    (accumulator, chainId) => {
        const validURLs: string[] = CHAINS[Number(chainId)].urls

        if (validURLs.length) {
            accumulator[Number(chainId)] = validURLs
        }

        return accumulator
    },
    {}
)
