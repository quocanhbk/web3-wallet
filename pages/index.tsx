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
    Wrap,
    WrapItem,
} from "@chakra-ui/react"
import { useAnimation, motion } from "framer-motion"
import type { NextPage } from "next"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "react-query"
import ConnectWallet from "../components/ConnectWallet"
import References from "../components/References"
import SignMessage from "../components/SignMessage"
import useWeb3Wallet, { CHAINS, ConnectorId, connectors } from "../web3-wallet"

const Home: NextPage = () => {
    const { account, connector, isActive, activate, deactivate, error, chain, balance, contractCaller, sign } =
        useWeb3Wallet()

    const toast = useToast({ duration: 2500, variant: "subtle" })

    const [selectedChain, setSelectedChain] = useState<string>()

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

    const { data: weth } = useQuery("weth", () => contractCaller.current?.WETH.getBalance(account!), {
        enabled: !!contractCaller.current && !!account && chain?.chainId === 1,
        initialData: 0,
    })

    const { data: greeting, isLoading: isLoadingGreeting } = useQuery(
        ["greeting", account],
        () => contractCaller.current?.Greeter.getGreeting(),
        {
            enabled: !!contractCaller.current && !!account && chain?.chainId === 1,
            initialData: "",
        }
    )

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

    const controls = useAnimation()

    useEffect(() => {
        controls.start(i => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, type: "tween", duration: 0.4 },
        }))
    }, [isActive, controls])

    return (
        <Flex direction="column" minH="100vh" bg="gray.900" color="whiteAlpha.900" p={[4, 8]}>
            <Box w="25rem" maxW="full" flex={1}>
                <Heading mb={4} textAlign="center">
                    Web3Wallet Demo
                </Heading>
                {!isActive ? (
                    <ConnectWallet />
                ) : (
                    <Box>
                        <motion.div custom={0} animate={controls} initial={{ y: 100, opacity: 0 }}>
                            <Box
                                mb={4}
                                border="1px"
                                borderColor={"whiteAlpha.200"}
                                p={4}
                                bg="gray.800"
                                rounded="lg"
                                overflow={"hidden"}
                            >
                                <Text mb={2} fontSize={"lg"} fontWeight="semibold">
                                    Wallet Information
                                </Text>
                                <Flex overflow={"hidden"} fontSize="sm">
                                    <Stack direction={"column"}>
                                        <Text>Connector</Text>
                                        <Text>Account</Text>
                                        <Text>Chain</Text>
                                        <Text>Balance</Text>
                                    </Stack>
                                    <Stack direction={"column"} overflow="hidden" ml={4} flex={1}>
                                        <Flex align="center">
                                            <Img
                                                src={connectors.find(c => c.name === connector.name)?.image}
                                                alt={connector.name}
                                                boxSize="1rem"
                                                mr={2}
                                            />
                                            <Text
                                                color={
                                                    connector.id === "metaMask"
                                                        ? "orange.400"
                                                        : connector.id === "gnosis"
                                                        ? "green.400"
                                                        : connector.id === "sequence"
                                                        ? "pink.400"
                                                        : "blue.400"
                                                }
                                            >
                                                {connector.name}
                                            </Text>
                                        </Flex>
                                        <Text w="full" isTruncated color="blue.400">
                                            {account}
                                        </Text>
                                        <Text color="teal.400">{chain?.name ?? "Unknown"}</Text>
                                        <Text color="green.400">{balance}</Text>
                                    </Stack>
                                </Flex>
                            </Box>
                        </motion.div>
                        <motion.div custom={1} animate={controls} initial={{ y: 100, opacity: 0 }}>
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
                                        rounded="md"
                                    >
                                        {Object.entries(CHAINS).map(([key, value]) => (
                                            <option value={key} key={key}>
                                                {value.name}
                                            </option>
                                        ))}
                                    </Select>
                                    <Button
                                        ml={2}
                                        w="6rem"
                                        isDisabled={!selectedChain}
                                        onClick={() => activate(connector.id, parseInt(selectedChain!))}
                                        size="sm"
                                    >
                                        Switch
                                    </Button>
                                </Flex>
                            </Box>
                        </motion.div>
                        <motion.div custom={2} animate={controls} initial={{ y: 100, opacity: 0 }}>
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
                                        {isLoadingGreeting ? "Loading..." : greeting}
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
                                        onClick={() => mutateGreeting()}
                                        size="sm"
                                        isDisabled={!greet}
                                    >
                                        Update
                                    </Button>
                                </Flex>
                            </Box>
                        </motion.div>
                        <motion.div custom={3} animate={controls} initial={{ y: 100, opacity: 0 }}>
                            <SignMessage onSign={sign} />
                        </motion.div>
                        <motion.div custom={4} animate={controls} initial={{ y: 100, opacity: 0 }}>
                            <Button onClick={() => deactivate()} w="full" variant={"outline"} color="red.400">
                                Disconnect
                            </Button>
                        </motion.div>
                    </Box>
                )}
            </Box>
            <Box borderTop={"1px"} borderColor="whiteAlpha.200" pt={4} mt={8}>
                <References />
            </Box>
        </Flex>
    )
}

export default Home
