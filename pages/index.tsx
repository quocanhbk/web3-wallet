import {
    Box,
    Heading,
    Stack,
    Text,
    Button,
    useToast,
    Select,
    Flex,
    Input,
    Img,
    chakra,
    ChakraProvider,
} from "@chakra-ui/react"
import type { NextPage } from "next"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "react-query"
import useWeb3Wallet, { CHAINS, ConnectorId } from "../web3-wallet"
import { useRouter } from "next/router"
const Home: NextPage = () => {
    const { account, connector, isActive, activate, deactivate, error, chain, balance, contractCaller } =
        useWeb3Wallet()

    const toast = useToast({ duration: 2500, variant: "subtle" })

    const [selectedChain, setSelectedChain] = useState<string>()
    const [message, setMessage] = useState("")
    const [greet, setGreet] = useState("")
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

    const handleConnect = async (connectorId: ConnectorId) => {
        await activate(connectorId)
        console.log(account)
    }

    const { data: weth } = useQuery("weth", () => contractCaller.current?.WETH.getBalance(account!), {
        enabled: !!contractCaller.current && !!account && chain?.chainId === 1,
        initialData: 0,
    })

    const { data: greeting } = useQuery("greeting", () => contractCaller.current?.Greeter.getGreeting(), {
        enabled: !!contractCaller.current && !!account && chain?.chainId === 1,
        initialData: "",
    })

    const { mutate: mutateGreeting, isLoading } = useMutation(
        () => contractCaller.current!.Greeter.setGreeting(greet),
        {
            onSuccess: () => {
                toast({
                    title: "Success",
                    description: "Greeting updated",
                    status: "success",
                })
            },
        }
    )

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

    const connectors = [
        { connector: "metaMask", image: "/icons/metamask.svg", name: "MetaMask" },
        { connector: "walletConnect", image: "/icons/walletConnect.svg", name: "WalletConnect" },
        { connector: "coinbaseWallet", image: "/icons/coinbase.png", name: "Coinbase Wallet" },
        { connector: "sequence", image: "/icons/sequence.svg", name: "Sequence" },
    ]

    return (
        <Box h="100vh" bg="gray.900" color="whiteAlpha.900" p={[4, 8]}>
            <Box w="25rem" maxW="full">
                <Heading mb={4} textAlign="center">
                    Web3Wallet Demo
                </Heading>
                {!isActive ? (
                    <Stack spacing={4}>
                        {connectors.map(c => (
                            <Box
                                rounded="lg"
                                p={2}
                                bg="transparent"
                                border="1px"
                                borderColor={"whiteAlpha.200"}
                                _hover={{ bg: "whiteAlpha.200" }}
                                _active={{ bg: "whiteAlpha.100" }}
                                key={c.connector}
                                onClick={() => handleConnect(c.connector as ConnectorId)}
                                cursor="pointer"
                            >
                                <Flex align="center" w="full" justify="center">
                                    <Img src={c.image} boxSize={"1.5rem"} rounded="lg" />
                                    <Text ml={2} fontSize="sm">
                                        {c.name}
                                    </Text>
                                </Flex>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Box>
                        <Box mb={4} border="1px" borderColor={"whiteAlpha.200"} p={4} bg="gray.800" rounded="lg">
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
                                    size="sm"
                                >
                                    {Object.entries(CHAINS).map(([key, value]) => (
                                        <option value={key} key={key}>
                                            {value.name}
                                        </option>
                                    ))}
                                </Select>
                                <Button
                                    ml={2}
                                    colorScheme="blue"
                                    w="6rem"
                                    isDisabled={!selectedChain}
                                    onClick={() => activate(connector.id, parseInt(selectedChain!))}
                                    size="sm"
                                >
                                    Switch
                                </Button>
                            </Flex>
                        </Box>
                        <Box mb={4} bg="gray.800" rounded={"lg"} p={4} border="1px" borderColor={"whiteAlpha.200"}>
                            <Text mb={2} fontSize={"lg"} fontWeight="semibold">
                                Contract Interaction
                            </Text>
                            <Box mb={4}>
                                <Text color="pink.300">Wrapped Ethereum</Text>
                                <Text fontSize={"sm"}>Balance: {weth}</Text>
                            </Box>
                            <Text color="blue.300">Greeter</Text>
                            <Text fontSize={"sm"}>
                                Greeting:{" "}
                                <chakra.span color="green.400" fontWeight={"semibold"}>
                                    {greeting}
                                </chakra.span>{" "}
                            </Text>
                            <Text fontSize={"sm"} mb={1}>
                                Set greeting:
                            </Text>
                            <Flex>
                                <Input
                                    rounded="md"
                                    flex={1}
                                    value={greet}
                                    onChange={e => setGreet(e.target.value)}
                                    size="sm"
                                />
                                <Button
                                    isLoading={isLoading}
                                    ml={2}
                                    w="6rem"
                                    colorScheme={"blue"}
                                    onClick={() => mutateGreeting()}
                                    size="sm"
                                >
                                    Update
                                </Button>
                            </Flex>
                        </Box>
                        <Box mb={4} bg="gray.800" rounded={"lg"} p={4} border="1px" borderColor={"whiteAlpha.200"}>
                            <Text mb={2} fontSize={"lg"} fontWeight="semibold">
                                Signature
                            </Text>
                            <Flex>
                                <Input
                                    rounded="md"
                                    flex={1}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    size="sm"
                                />
                                <Button ml={2} w="6rem" colorScheme={"blue"} onClick={() => mutateSign()} size="sm">
                                    Sign
                                </Button>
                            </Flex>
                        </Box>
                        <Button colorScheme="red" onClick={() => deactivate()} w="full">
                            Disconnect
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default Home
