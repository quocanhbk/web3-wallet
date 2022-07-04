import { Box, Flex, Img, Text } from "@chakra-ui/react"
import { ConnectorInfo } from "../web3-wallet"
import { motion } from "framer-motion"

interface WalletCardProps {
    onClick?: () => void
    info: Omit<ConnectorInfo, "connector">
}

const WalletCard = ({ onClick, info }: WalletCardProps) => {
    return (
        <Box
            rounded="lg"
            p={2}
            bg="transparent"
            border="1px"
            borderColor={"whiteAlpha.200"}
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.100" }}
            key={info.id}
            onClick={onClick}
            cursor="pointer"
        >
            <Flex align="center" w="full" justify="center">
                <Img src={info.image} boxSize={"1.5rem"} rounded="lg" />
                <Text ml={2} fontSize="sm">
                    {info.name}
                </Text>
            </Flex>
        </Box>
    )
}

export default WalletCard
