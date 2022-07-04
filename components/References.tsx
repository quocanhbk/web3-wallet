import { Flex, Wrap, WrapItem, chakra, Text } from "@chakra-ui/react"

const refs = [
    {
        text: "Sequence Wallet Refs",
        url: "https://www.notion.so/quocanhbk17/Sequence-Wallet-8658aa552e644629908a7100c6c4a35b",
        color: "yellow.400",
    },
    {
        text: "Using Sequence on testnets",
        url: "https://docs.sequence.one/getting-started/testnet",
        color: "orange.400",
    },
    {
        text: "MetaMask and Coinbase conflicts",
        url: "https://github.com/MetaMask/metamask-extension/issues/13622",
        color: "red.400",
    },
    {
        text: "Gnosis Safe connection instruction",
        url: "https://quocanhbk17.notion.site/Gnosis-Safe-Conection-Instruction-48a051a0e7904d58a87371240f510f56",
        color: "green.400",
    },
    { text: "Source code", url: "https://github.com/quocanhbk/web3-wallet", color: "blue.400" },
]

const References = () => {
    return (
        <Flex align="center">
            <Wrap spacing={2}>
                <Text fontWeight="semibold">References:</Text>
                {refs.map(ref => (
                    <WrapItem
                        key={ref.url}
                        border="1px"
                        borderColor={"whiteAlpha.200"}
                        bg={"gray.800"}
                        px={2}
                        py={1}
                        rounded="md"
                    >
                        <chakra.a
                            fontSize={"sm"}
                            href={ref.url}
                            color={ref.color}
                            target={"_blank"}
                            fontWeight="semibold"
                        >
                            {ref.text}
                        </chakra.a>
                    </WrapItem>
                ))}
            </Wrap>
        </Flex>
    )
}

export default References
