import { Stack } from "@chakra-ui/react"
import { useAnimation, motion } from "framer-motion"
import { useEffect } from "react"
import useWeb3Wallet, { ConnectorId, connectors } from "../web3-wallet"
import WalletCard from "./WalletCard"

const ConnectWallet = () => {
    const { activate } = useWeb3Wallet()

    const handleConnect = async (connectorId: ConnectorId) => {
        try {
            await activate(connectorId)
        } catch (e) {
            console.log("ERROR", e)
        }
    }

    const controls = useAnimation()

    useEffect(() => {
        controls.start(i => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, type: "tween", duration: 0.4 },
        }))
    }, [controls])

    return (
        <Stack spacing={4}>
            {connectors.map((c, index) => (
                <motion.div key={c.id} custom={index} animate={controls} initial={{ y: 100, opacity: 0 }}>
                    <WalletCard info={c} onClick={() => handleConnect(c.id)} />
                </motion.div>
            ))}
        </Stack>
    )
}

export default ConnectWallet
