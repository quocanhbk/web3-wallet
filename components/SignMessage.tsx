import { Box, Flex, Input, Button, Text, useToast } from "@chakra-ui/react"
import { useState } from "react"
import { useMutation } from "react-query"

interface SignMessageProps {
    onSign: (message: string) => Promise<string>
}

const SignMessage = ({ onSign }: SignMessageProps) => {
    const [message, setMessage] = useState("")

    const [signature, setSignature] = useState("")

    const toast = useToast({ duration: 2500, variant: "subtle" })

    const { mutate: mutateSign } = useMutation(() => onSign(message), {
        onMutate: () => {
            setSignature("")
        },
        onSuccess: signature => {
            setSignature(signature)
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
        <Box mb={4} bg="gray.800" rounded={"lg"} p={4} border="1px" borderColor={"whiteAlpha.200"}>
            <Text mb={2} fontSize={"lg"} fontWeight="semibold">
                Create Signature
            </Text>
            <Flex>
                <Input
                    rounded="md"
                    flex={1}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    size="sm"
                    placeholder="Enter message"
                />
                <Button ml={2} w="6rem" onClick={() => mutateSign()} size="sm" isDisabled={!message}>
                    Sign
                </Button>
            </Flex>
            {signature && (
                <Text mt={2} width="full" isTruncated bg="gray.900" py={1} px={2} rounded="md" color="blue.500">
                    Signature: {signature}
                </Text>
            )}
        </Box>
    )
}

export default SignMessage
