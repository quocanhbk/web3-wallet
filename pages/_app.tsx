import { ChakraProvider } from "@chakra-ui/react"
import type { AppProps } from "next/app"
import { QueryClient, QueryClientProvider } from "react-query"
import { useRef } from "react"
import { Web3WalletProvider } from "../web3-wallet/useWeb3Wallet"

function MyApp({ Component, pageProps }: AppProps) {
    const qcRef = useRef(
        new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
    )

    return (
        <ChakraProvider>
            <QueryClientProvider client={qcRef.current}>
                <Web3WalletProvider
                    config={{
                        walletConnect: {
                            rpc: {
                                1: "https://mainnet.infura.io/v3/47a3dff66e3e49c2b8fff75f0eb95c90",
                                4: "https://rinkeby.infura.io/v3/47a3dff66e3e49c2b8fff75f0eb95c90",
                            },
                        },
                        coinbaseWallet: {
                            url: "https://mainnet.infura.io/v3/47a3dff66e3e49c2b8fff75f0eb95c90",
                            appName: "Use Wallet",
                        },
                    }}
                >
                    <Component {...pageProps} />
                </Web3WalletProvider>
            </QueryClientProvider>
        </ChakraProvider>
    )
}

export default MyApp
