import { Box, Heading, Stack, Text, Button, useToast, Select, Flex, Input } from "@chakra-ui/react"
import type { NextPage } from "next"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "react-query"
import useWeb3Wallet, { CHAINS } from "../web3-wallet"

const Home: NextPage = () => {
    const { account, connector, isActive, activate, deactivate, error, chain, balance, contractCaller } =
        useWeb3Wallet()
    const toast = useToast({ duration: 2500, variant: "subtle" })

    const [selectedChain, setSelectedChain] = useState<string>()
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (error) {
            if (error.message.includes("Disconnected from chain")) {
                activate(connector.id)
            } else {
                toast({
                    title: "Error",
                    description: error.message,
                    status: "error",
                })
            }
        }
    }, [error?.message])

    const { data: weth } = useQuery("weth", () => contractCaller.current?.WETH.getBalance(account!), {
        enabled: !!contractCaller.current && !!account && chain?.chainId === 1,
        initialData: 0,
    })

    const { mutate: mutateSign } = useMutation(() => contractCaller.current!.sign(message), {
        onSuccess: data => {
            toast({
                title: "Signature",
                description: `${data.slice(0, 25)}...${data.slice(-25)}`,
                status: "success",
            })
            setMessage("")
        },
        onError: (error: any) => {
            if (error?.code === 4001) {
                toast({
                    title: "Error",
                    description: "User denied to sign message",
                    status: "error",
                })
            }
        },
    })

    return (
        <Box h="100vh" bg="gray.900" color="whiteAlpha.900" p={8}>
            <Heading mb={4}>WALLET DEMO</Heading>
            <Stack spacing={8} w="20rem" maxW="full">
                <Box border="1px" borderColor={"whiteAlpha.200"} p={4} bg="gray.800" rounded="lg">
                    <Stack>
                        <Text color="yellow.300">Connector: {connector.name}</Text>
                        <Text color={isActive ? "green.300" : "red.300"}>
                            Status: {isActive ? "Connected" : "Not connected"}
                        </Text>
                        <Text color="messenger.300" isTruncated>
                            Account: {account}
                        </Text>
                        <Text color="cyan.300" isTruncated>
                            Balance: {balance}
                        </Text>
                        <Text color="teal.300" isTruncated>
                            Chain: {chain?.name}
                        </Text>
                    </Stack>
                </Box>
                <Box w="full" h="1px" bg="whiteAlpha.200" />
                {!isActive ? (
                    <Stack spacing={4}>
                        <Button colorScheme={"orange"} onClick={() => activate("metaMask")}>
                            MetaMask
                        </Button>
                        <Button colorScheme={"blue"} onClick={() => activate("walletConnect")}>
                            WalletConnect
                        </Button>
                        <Button colorScheme={"purple"} onClick={() => activate("coinbaseWallet")}>
                            Coinbase
                        </Button>
                    </Stack>
                ) : (
                    <Box>
                        <Box mb={4} bg="gray.800" rounded={"lg"} p={4} border="1px" borderColor={"whiteAlpha.200"}>
                            <Text mb={2} fontSize={"lg"} fontWeight="semibold">
                                Switch Chain
                            </Text>
                            <Flex>
                                <Select
                                    placeholder="Select option"
                                    value={selectedChain}
                                    onChange={e => setSelectedChain(e.target.value)}
                                    flex={1}
                                >
                                    {Object.entries(CHAINS).map(([key, value]) => (
                                        <option value={key} key={key}>
                                            {value.name}
                                        </option>
                                    ))}
                                </Select>
                                <Button
                                    ml={4}
                                    colorScheme="yellow"
                                    isDisabled={!selectedChain}
                                    onClick={() => activate(connector.id, parseInt(selectedChain!))}
                                >
                                    Switch
                                </Button>
                            </Flex>
                        </Box>
                        <Box mb={4} bg="gray.800" rounded={"lg"} p={4} border="1px" borderColor={"whiteAlpha.200"}>
                            <Text mb={2} fontSize={"lg"} fontWeight="semibold">
                                Contract Interaction
                            </Text>
                            <Text color="pink.300">Wrapped Ethereum</Text>
                            <Text fontSize={"sm"}>Balance: {weth}</Text>
                        </Box>
                        <Box mb={4} bg="gray.800" rounded={"lg"} p={4} border="1px" borderColor={"whiteAlpha.200"}>
                            <Text mb={2} fontSize={"lg"} fontWeight="semibold">
                                Signature
                            </Text>
                            <Flex>
                                <Input flex={1} value={message} onChange={e => setMessage(e.target.value)} />
                                <Button ml={4} colorScheme={"blue"} onClick={() => mutateSign()}>
                                    Sign
                                </Button>
                            </Flex>
                        </Box>
                        <Button colorScheme="red" onClick={() => deactivate()} w="full">
                            Disconnect
                        </Button>
                    </Box>
                )}
            </Stack>
        </Box>
    )
}

export default Home
